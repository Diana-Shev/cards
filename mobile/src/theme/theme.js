import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6366f1', // Индиго
    accent: '#f59e0b', // Янтарный
    background: '#f8fafc', // Светло-серый
    surface: '#ffffff', // Белый
    text: '#1f2937', // Темно-серый
    placeholder: '#9ca3af', // Серый
    backdrop: 'rgba(0, 0, 0, 0.5)',
    onSurface: '#1f2937',
    disabled: '#d1d5db',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  roundness: 12,
};
