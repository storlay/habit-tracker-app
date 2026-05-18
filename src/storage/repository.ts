import type { Category, EntriesMap, Habit, Settings } from '../types';
import { getItem, setItem } from './asyncStorage';

export const KEYS = {
  habits: '@ht:habits',
  categories: '@ht:categories',
  entries: '@ht:entries',
  settings: '@ht:settings',
} as const;

export const loadHabits = () => getItem<Habit[]>(KEYS.habits);
export const saveHabits = (habits: Habit[]) => setItem(KEYS.habits, habits);

export const loadCategories = () => getItem<Category[]>(KEYS.categories);
export const saveCategories = (cats: Category[]) => setItem(KEYS.categories, cats);

export const loadEntries = () => getItem<EntriesMap>(KEYS.entries);
export const saveEntries = (entries: EntriesMap) => setItem(KEYS.entries, entries);

export const loadSettings = () => getItem<Settings>(KEYS.settings);
export const saveSettings = (settings: Settings) => setItem(KEYS.settings, settings);
