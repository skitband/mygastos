import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  fontFamily: 'Manrope_400Regular',
};

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#056DFF',
    primaryContainer: '#EAF2FF',
    secondary: '#10122B',
    secondaryContainer: '#f0f1f4',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#f7f8fa',
    outline: '#eceef2',
    onSurface: '#10122B',
    onSurfaceVariant: '#9aa0b0',
    error: '#FF6424',
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 16,
};

export const colors = {
  primary: '#056DFF',
  dark: '#10122B',
  muted: '#9aa0b0',
  lightBg: '#f0f1f4',
  surfaceBg: '#f7f8fa',
  border: '#eceef2',
  white: '#FFFFFF',
  accent: '#FF6424',
  success: '#0DA678',
};
