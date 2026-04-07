import { DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { PaperProvider, MD3LightTheme } from 'react-native-paper'; 

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const paperTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      primary: '#1976D2',
      onPrimary: '#FFFFFF',
      primaryContainer: '#2196F3',
      onPrimaryContainer: '#000000',
      secondary: '#FFCA28',
      onSecondary: '#000000',
      surface: '#FFFFFF',
      onSurface: '#000000',
      background: '#F8F9FF',
      outline: '#757575',
      onSurfaceVariant: '#757575',
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={NavigationDefaultTheme}>
        <Stack screenOptions={{
          headerShown: false,
        }} />
        <StatusBar style="dark" />
      </ThemeProvider>
    </PaperProvider>
  );
}