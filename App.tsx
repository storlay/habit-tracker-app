import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HabitsProvider } from './src/context/HabitsContext';
import { SettingsProvider, useTheme } from './src/context/SettingsContext';
import RootNavigation from './src/navigation';

function AppShell() {
  const { theme, colors } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.bg }}>
      <RootNavigation />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <HabitsProvider>
        <AppShell />
      </HabitsProvider>
    </SettingsProvider>
  );
}
