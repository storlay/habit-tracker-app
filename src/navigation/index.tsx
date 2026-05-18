import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { IoniconName } from '../constants/icons';
import { useTheme } from '../context/SettingsContext';
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
  const { colors } = useTheme();
  const { t } = useTranslation('navigation');
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size} color={color} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.bg, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.bg },
        headerTitleStyle: { color: colors.text },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: t('today') }} />
      <Tab.Screen name="Stats" component={StatsScreen} options={{ title: t('stats') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  const { theme, colors } = useTheme();
  const { t } = useTranslation('navigation');
  const navTheme = useMemo<Theme>(() => {
    const base = theme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.bg,
        card: colors.bg,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
      },
    };
  }, [theme, colors]);
  const stackOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.bg },
      headerTitleStyle: { color: colors.text },
      headerTintColor: colors.text,
      contentStyle: { backgroundColor: colors.bg },
    }),
    [colors],
  );
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={stackOptions}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen
          name="HabitForm"
          component={HabitFormScreen}
          options={{ presentation: 'modal', title: t('habit') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
