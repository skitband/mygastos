const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'gastos.db');

function initializeDatabase() {
  const db = new Database(DB_PATH);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#056DFF'
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      note TEXT DEFAULT '',
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  return db;
}

function seedDatabase(db) {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get();

  if (categoryCount.count === 0) {
    const insertCategory = db.prepare(
      'INSERT INTO categories (id, name, icon, color) VALUES (?, ?, ?, ?)'
    );

    const categories = [
      ['food', 'Food', 'silverware-fork-knife', '#056DFF'],
      ['groceries', 'Groceries', 'cart', '#056DFF'],
      ['transport', 'Transport', 'car', '#056DFF'],
      ['fun', 'Fun', 'gamepad-variant', '#056DFF'],
      ['bills', 'Bills', 'flash', '#056DFF'],
      ['health', 'Health', 'heart-pulse', '#056DFF'],
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertCategory.run(...item);
      }
    });

    insertMany(categories);
  }

  const expenseCount = db.prepare('SELECT COUNT(*) as count FROM expenses').get();

  if (expenseCount.count === 0) {
    const insertExpense = db.prepare(
      'INSERT INTO expenses (amount, category_id, note, date) VALUES (?, ?, ?, ?)'
    );

    const expenses = [
      [12.50, 'food', 'Lunch at cafe', '2026-06-01'],
      [45.00, 'transport', 'Gas station', '2026-06-01'],
      [8.99, 'fun', 'Spotify subscription', '2026-06-02'],
      [23.50, 'food', 'Grocery store', '2026-06-03'],
      [15.00, 'transport', 'Uber ride', '2026-06-04'],
      [67.80, 'groceries', 'Grocery run', '2026-06-04'],
      [5.50, 'food', 'Coffee & pastry', '2026-06-05'],
      [120.00, 'bills', 'Electric bill', '2026-06-05'],
      [34.00, 'food', 'Dinner delivery', '2026-06-06'],
      [22.00, 'fun', 'Movie tickets', '2026-06-07'],
      [9.99, 'health', 'Vitamins', '2026-06-07'],
      [16.00, 'food', 'Sushi takeout', '2026-06-08'],
      [42.50, 'transport', 'Train ticket', '2026-06-09'],
      [89.99, 'fun', 'Bluetooth headphones', '2026-06-09'],
      [7.50, 'food', 'Breakfast bagel', '2026-06-10'],
      [55.00, 'bills', 'Internet bill', '2026-06-10'],
      [14.20, 'transport', 'Uber Trip', '2026-06-11'],
      [82.30, 'groceries', 'Whole Foods Market', '2026-06-11'],
      [5.50, 'food', 'Blue Bottle Coffee', '2026-06-11'],
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) {
        insertExpense.run(...item);
      }
    });

    insertMany(expenses);
  }
}

module.exports = { initializeDatabase, seedDatabase };
