import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { IoniconName } from '../constants/icons';
import HabitFormScreen from '../screens/HabitFormScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import TodayScreen from '../screens/TodayScreen';
import type { RootStackParamList } from './types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

const ICONS: Record<string, IoniconName> = {
  Today: 'checkbox-outline',
  Stats: 'stats-chart-outline',
  Settings: 'settings-outline',
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: 'Сегодня' }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: 'Статистика' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Настройки' }} />
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="HabitForm"
          component={HabitFormScreen}
          options={{ presentation: 'modal', title: 'Привычка' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
