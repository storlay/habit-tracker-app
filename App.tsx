import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HabitsProvider } from './src/context/HabitsContext';
import RootNavigation from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HabitsProvider>
        <RootNavigation />
        <StatusBar style="auto" />
      </HabitsProvider>
    </GestureHandlerRootView>
  );
}
