import type { Category, EntriesMap, Habit } from '../types';
import { getItem, setItem } from './asyncStorage';

export const KEYS = {
  habits: '@ht:habits',
  categories: '@ht:categories',
  entries: '@ht:entries',
} as const;

export const loadHabits = () => getItem<Habit[]>(KEYS.habits);
export const saveHabits = (habits: Habit[]) => setItem(KEYS.habits, habits);

export const loadCategories = () => getItem<Category[]>(KEYS.categories);
export const saveCategories = (cats: Category[]) => setItem(KEYS.categories, cats);

export const loadEntries = () => getItem<EntriesMap>(KEYS.entries);
export const saveEntries = (entries: EntriesMap) => setItem(KEYS.entries, entries);
