import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@gastos_theme';

type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  dark: string;
  muted: string;
  lightBg: string;
  surfaceBg: string;
  border: string;
  white: string;
  accent: string;
  success: string;
  background: string;
  card: string;
  text: string;
  textSecondary: string;
}

const lightColors: ThemeColors = {
  primary: '#056DFF',
  dark: '#10122B',
  muted: '#9aa0b0',
  lightBg: '#f0f1f4',
  surfaceBg: '#f7f8fa',
  border: '#eceef2',
  white: '#FFFFFF',
  accent: '#FF6424',
  success: '#0DA678',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#10122B',
  textSecondary: '#9aa0b0',
};

const darkColors: ThemeColors = {
  primary: '#3B8BFF',
  dark: '#FFFFFF',
  muted: '#8b90a0',
  lightBg: '#2a2d3a',
  surfaceBg: '#1e2030',
  border: '#2e3142',
  white: '#FFFFFF',
  accent: '#FF6424',
  success: '#0DA678',
  background: '#14161f',
  card: '#1c1e2b',
  text: '#FFFFFF',
  textSecondary: '#8b90a0',
};

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark') {
        setMode(stored);
      }
    }).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const isDark = mode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ mode, isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
