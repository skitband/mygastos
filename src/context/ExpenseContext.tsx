import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, Category } from '../types';
import * as api from '../services/api';
import dbData from '../data/db.json';

const STORAGE_KEY_EXPENSES = '@gastos_expenses';
const STORAGE_KEY_CATEGORIES = '@gastos_categories';

interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  loading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Omit<Expense, 'id'>>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByDate: (date: string) => Expense[];
  getExpensesByMonth: (year: number, month: number) => Expense[];
  getMonthTotal: (year: number, month: number, categoryFilter?: string) => number;
  getDaysWithExpenses: (year: number, month: number, categoryFilter?: string) => number[];
  refreshData: () => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>(dbData.categories as Category[]);
  const [loading, setLoading] = useState(true);
  const [useApi, setUseApi] = useState(false);

  // Save to AsyncStorage whenever expenses change
  const persistExpenses = useCallback(async (exps: Expense[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(exps));
    } catch {}
  }, []);

  // Try to load from API, fall back to local storage
  const loadFromApi = useCallback(async () => {
    try {
      setLoading(true);
      const [cats, exps] = await Promise.all([
        api.fetchCategories(),
        api.fetchExpenses(),
      ]);
      setCategories(cats);
      const mapped = exps.map(e => ({
        id: String(e.id),
        amount: e.amount,
        category: e.category_id,
        note: e.note,
        date: e.date,
      }));
      setExpenses(mapped);
      setUseApi(true);
      await persistExpenses(mapped);
    } catch {
      // API not available, load from local storage
      setUseApi(false);
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_EXPENSES);
        if (stored) {
          setExpenses(JSON.parse(stored));
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  }, [persistExpenses]);

  useEffect(() => {
    loadFromApi();
  }, [loadFromApi]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (useApi) {
      try {
        const created = await api.createExpense({
          amount: expense.amount,
          category_id: expense.category,
          note: expense.note,
          date: expense.date,
        });
        const newExp: Expense = {
          id: String(created.id),
          amount: created.amount,
          category: created.category_id,
          note: created.note,
          date: created.date,
        };
        setExpenses(prev => {
          const updated = [newExp, ...prev];
          persistExpenses(updated);
          return updated;
        });
      } catch {
        const newExpense: Expense = { ...expense, id: Date.now().toString() };
        setExpenses(prev => {
          const updated = [newExpense, ...prev];
          persistExpenses(updated);
          return updated;
        });
      }
    } else {
      const newExpense: Expense = { ...expense, id: Date.now().toString() };
      setExpenses(prev => {
        const updated = [newExpense, ...prev];
        persistExpenses(updated);
        return updated;
      });
    }
  }, [useApi, persistExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    if (useApi) {
      try {
        await api.deleteExpense(Number(id));
      } catch {
        // Continue with local delete
      }
    }
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      persistExpenses(updated);
      return updated;
    });
  }, [useApi, persistExpenses]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Omit<Expense, 'id'>>) => {
    if (useApi) {
      try {
        await api.updateExpense(Number(id), {
          amount: updates.amount,
          category_id: updates.category,
          note: updates.note,
          date: updates.date,
        });
      } catch {
        // Continue with local update
      }
    }
    setExpenses(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updates } : e);
      persistExpenses(updated);
      return updated;
    });
  }, [useApi, persistExpenses]);

  const getExpensesByDate = useCallback((date: string) => {
    return expenses.filter(e => e.date === date);
  }, [expenses]);

  const getExpensesByMonth = useCallback((year: number, month: number) => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [expenses]);

  const getMonthTotal = useCallback((year: number, month: number, categoryFilter?: string) => {
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        const monthMatch = d.getFullYear() === year && d.getMonth() === month;
        const catMatch = !categoryFilter || e.category === categoryFilter;
        return monthMatch && catMatch;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const getDaysWithExpenses = useCallback((year: number, month: number, categoryFilter?: string) => {
    const days = new Set<number>();
    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        if (!categoryFilter || e.category === categoryFilter) {
          days.add(d.getDate());
        }
      }
    });
    return Array.from(days);
  }, [expenses]);

  return (
    <ExpenseContext.Provider value={{
      expenses,
      categories,
      loading,
      addExpense,
      updateExpense,
      deleteExpense,
      getExpensesByDate,
      getExpensesByMonth,
      getMonthTotal,
      getDaysWithExpenses,
      refreshData: loadFromApi,
    }}>
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
