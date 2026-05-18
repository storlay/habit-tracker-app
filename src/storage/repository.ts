import { SEED_CATEGORY_NAME_KEYS } from '../constants/seed';
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

export const saveCategories = (cats: Category[]) => setItem(KEYS.categories, cats);

export async function loadCategories(): Promise<Category[] | null> {
  const stored = await getItem<Category[]>(KEYS.categories);
  if (!stored) return null;
  let changed = false;
  const migrated = stored.map((c) => {
    const seedKey = SEED_CATEGORY_NAME_KEYS[c.id];
    if (!seedKey || c.nameKey) return c;
    changed = true;
    return { id: c.id, color: c.color, icon: c.icon, nameKey: seedKey };
  });
  if (changed) await saveCategories(migrated);
  return migrated;
}

export const loadEntries = () => getItem<EntriesMap>(KEYS.entries);
export const saveEntries = (entries: EntriesMap) => setItem(KEYS.entries, entries);

export const loadSettings = () => getItem<Settings>(KEYS.settings);
export const saveSettings = (settings: Settings) => setItem(KEYS.settings, settings);
