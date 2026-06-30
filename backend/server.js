const express = require('express');
const cors = require('cors');
const { initializeDatabase, seedDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize DB
const db = initializeDatabase();
// Only seed if SEED_DB=1 env is set
if (process.env.SEED_DB === '1') {
  seedDatabase(db);
}

// ==================== CATEGORIES ====================

// GET all categories
app.get('/api/categories', (req, res) => {
  const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
  res.json(categories);
});

// POST create category
app.post('/api/categories', (req, res) => {
  const { id, name, icon, color } = req.body;

  if (!id || !name || !icon) {
    return res.status(400).json({ error: 'id, name, and icon are required' });
  }

  try {
    const stmt = db.prepare(
      'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, name, icon, color || '#056DFF');
    res.status(201).json({ id, name, icon, color: color || '#056DFF' });
  } catch (err) {
    res.status(409).json({ error: 'Category already exists' });
  }
});

// ==================== EXPENSES ====================

// GET expenses with optional filters
app.get('/api/expenses', (req, res) => {
  const { date, month, year, category } = req.query;

  let sql = `
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
  `;
  const conditions = [];
  const params = [];

  if (date) {
    conditions.push('e.date = ?');
    params.push(date);
  }

  if (month && year) {
    conditions.push("strftime('%m', e.date) = ? AND strftime('%Y', e.date) = ?");
    params.push(String(month).padStart(2, '0'), String(year));
  }

  if (category) {
    conditions.push('e.category_id = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY e.date DESC, e.created_at DESC';

  const expenses = db.prepare(sql).all(...params);
  res.json(expenses);
});

// GET single expense
app.get('/api/expenses/:id', (req, res) => {
  const expense = db.prepare(`
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!expense) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  res.json(expense);
});

// POST create expense
app.post('/api/expenses', (req, res) => {
  const { amount, category_id, note, date } = req.body;

  if (!amount || !category_id || !date) {
    return res.status(400).json({ error: 'amount, category_id, and date are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'amount must be positive' });
  }

  // Validate category exists
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) {
    return res.status(400).json({ error: 'Invalid category_id' });
  }

  const stmt = db.prepare(
    'INSERT INTO expenses (amount, category_id, note, date) VALUES (?, ?, ?, ?)'
  );
  const result = stmt.run(amount, category_id, note || '', date);

  const newExpense = db.prepare(`
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(newExpense);
});

// PUT update expense
app.put('/api/expenses/:id', (req, res) => {
  const { amount, category_id, note, date } = req.body;
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const stmt = db.prepare(`
    UPDATE expenses
    SET amount = COALESCE(?, amount),
        category_id = COALESCE(?, category_id),
        note = COALESCE(?, note),
        date = COALESCE(?, date)
    WHERE id = ?
  `);
  stmt.run(amount || null, category_id || null, note !== undefined ? note : null, date || null, id);

  const updated = db.prepare(`
    SELECT e.*, c.name as category_name, c.icon as category_icon, c.color as category_color
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.id = ?
  `).get(id);

  res.json(updated);
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;

  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  res.json({ message: 'Expense deleted', id: Number(id) });
});

// ==================== STATS ====================

// GET monthly summary
app.get('/api/stats/monthly', (req, res) => {
  const { month, year, category } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'month and year query params are required' });
  }

  let sql = `
    SELECT COALESCE(SUM(amount), 0) as total
    FROM expenses
    WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
  `;
  const params = [String(month).padStart(2, '0'), String(year)];

  if (category) {
    sql += ' AND category_id = ?';
    params.push(category);
  }

  const result = db.prepare(sql).get(...params);

  // Days with expenses
  let daysSql = `
    SELECT DISTINCT CAST(strftime('%d', date) AS INTEGER) as day
    FROM expenses
    WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
  `;
  const daysParams = [String(month).padStart(2, '0'), String(year)];

  if (category) {
    daysSql += ' AND category_id = ?';
    daysParams.push(category);
  }

  const days = db.prepare(daysSql).all(...daysParams).map(r => r.day);

  res.json({
    total: result.total,
    days_with_expenses: days,
    month: Number(month),
    year: Number(year),
  });
});

// GET category breakdown for a month
app.get('/api/stats/breakdown', (req, res) => {
  const { month, year } = req.query;

  if (!month || !year) {
    return res.status(400).json({ error: 'month and year query params are required' });
  }

  const breakdown = db.prepare(`
    SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(e.amount), 0) as total
    FROM categories c
    LEFT JOIN expenses e ON e.category_id = c.id
      AND strftime('%m', e.date) = ?
      AND strftime('%Y', e.date) = ?
    GROUP BY c.id
    ORDER BY total DESC
  `).all(String(month).padStart(2, '0'), String(year));

  res.json(breakdown);
});

// ==================== RESET ====================

app.post('/api/reset', (req, res) => {
  db.exec('DELETE FROM expenses');
  res.json({ message: 'All expenses deleted' });
});

// ==================== START SERVER ====================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Gastos API running on http://0.0.0.0:${PORT}`);
  console.log(`  Local: http://localhost:${PORT}`);
});

// Keep process alive
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
