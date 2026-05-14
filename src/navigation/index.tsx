import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';
import TodayScreen from '../screens/TodayScreen';

const Tab = createBottomTabNavigator();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ICONS: Record<string, IconName> = {
  Today: 'checkbox-outline',
  Stats: 'stats-chart-outline',
  Settings: 'settings-outline',
};

export default function RootNavigation() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
