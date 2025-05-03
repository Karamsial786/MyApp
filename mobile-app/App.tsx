import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider as PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

// Import AuthProvider
import { AuthProvider } from './src/contexts/AuthContext';

// Import AppNavigator
import AppNavigator from './src/navigation/AppNavigator';

// Customize theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0369a1',
    secondary: '#0ea5e9',
    background: '#f8fafc',
    surface: '#ffffff',
    error: '#ef4444',
    text: '#1e293b',
    onSurface: '#334155',
    disabled: '#94a3b8',
    placeholder: '#64748b',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#f59e0b',
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});