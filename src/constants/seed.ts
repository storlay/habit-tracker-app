import type { Category } from '../types';

export const SEED_CATEGORY_NAME_KEYS: Record<string, string> = {
  'cat-health': 'categories:health',
  'cat-mind': 'categories:mind',
  'cat-sport': 'categories:sport',
  'cat-work': 'categories:work',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-health', nameKey: 'categories:health', color: '#22c55e', icon: 'heart' },
  { id: 'cat-mind', nameKey: 'categories:mind', color: '#a855f7', icon: 'book' },
  { id: 'cat-sport', nameKey: 'categories:sport', color: '#ef4444', icon: 'fitness' },
  { id: 'cat-work', nameKey: 'categories:work', color: '#3b82f6', icon: 'briefcase' },
];
