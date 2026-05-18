import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type HabitType = 'binary' | 'counter' | 'duration';

export type Habit = {
  id: string;
  title: string;
  type: HabitType;
  target?: number;
  unit?: string;
  categoryId: string;
  color: string;
  icon: IoniconName;
  weeklyGoal: number;
  reminder?: { hour: number; minute: number; days: number[] };
  notificationIds?: string[];
  createdAt: string;
  archived: boolean;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: IoniconName;
};

export type Entry = {
  habitId: string;
  date: string;
  value: number;
  completed: boolean;
};

export type EntriesMap = Record<string, Record<string, Entry>>;

export type Settings = {
  theme: 'system' | 'light' | 'dark';
  weekStartsOn: 0 | 1;
  language: 'system' | 'ru' | 'en' | 'es' | 'de';
};

export type HabitDraft = Omit<Habit, 'id' | 'createdAt' | 'archived' | 'notificationIds'>;
