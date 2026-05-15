import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Tabs: undefined;
  HabitForm: { habitId?: string } | undefined;
};

export type HabitFormProps = NativeStackScreenProps<RootStackParamList, 'HabitForm'>;
