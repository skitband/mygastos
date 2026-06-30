import { Platform } from 'react-native';

// Use your machine's local IP when running on physical device
// localhost works for web/simulator
// In production PWA, API is not available — app uses AsyncStorage/localStorage fallback
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    // If running on a deployed domain (not localhost), skip API
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return '';  // empty = all API calls will fail, triggering local storage fallback
    }
    return 'http://localhost:3000';
  }
  // For physical device, use your PC's local IP
  return 'http://192.168.1.4:3000';
};

const BASE_URL = getBaseUrl();

function fetchWithTimeout(url: string, options?: RequestInit, timeoutMs = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface ExpenseResponse {
  id: number;
  amount: number;
  category_id: string;
  note: string;
  date: string;
  created_at: string;
  category_name: string;
  category_icon: string;
  category_color: string;
}

export interface MonthlyStats {
  total: number;
  days_with_expenses: number[];
  month: number;
  year: number;
}

export interface BreakdownItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  total: number;
}

// ==================== CATEGORIES ====================

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function createCategory(category: {
  id: string;
  name: string;
  icon: string;
  color?: string;
}): Promise<CategoryResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

// ==================== EXPENSES ====================

export async function fetchExpenses(params?: {
  date?: string;
  month?: number;
  year?: number;
  category?: string;
}): Promise<ExpenseResponse[]> {
  const query = new URLSearchParams();
  if (params?.date) query.append('date', params.date);
  if (params?.month) query.append('month', String(params.month));
  if (params?.year) query.append('year', String(params.year));
  if (params?.category) query.append('category', params.category);

  const res = await fetchWithTimeout(`${BASE_URL}/api/expenses?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch expenses');
  return res.json();
}

export async function createExpense(expense: {
  amount: number;
  category_id: string;
  note: string;
  date: string;
}): Promise<ExpenseResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to create expense');
  return res.json();
}

export async function updateExpense(
  id: number,
  expense: Partial<{ amount: number; category_id: string; note: string; date: string }>
): Promise<ExpenseResponse> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense),
  });
  if (!res.ok) throw new Error('Failed to update expense');
  return res.json();
}

export async function deleteExpense(id: number): Promise<void> {
  const res = await fetchWithTimeout(`${BASE_URL}/api/expenses/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete expense');
}

// ==================== STATS ====================

export async function fetchMonthlyStats(
  month: number,
  year: number,
  category?: string
): Promise<MonthlyStats> {
  const query = new URLSearchParams({
    month: String(month),
    year: String(year),
  });
  if (category) query.append('category', category);

  const res = await fetchWithTimeout(`${BASE_URL}/api/stats/monthly?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch monthly stats');
  return res.json();
}

export async function fetchBreakdown(month: number, year: number): Promise<BreakdownItem[]> {
  const query = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  const res = await fetchWithTimeout(`${BASE_URL}/api/stats/breakdown?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch breakdown');
  return res.json();
}
