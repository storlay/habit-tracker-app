import type { TFunction } from 'i18next';
import type { Category } from '../types';

export function categoryLabel(c: Category, t: TFunction): string {
  return c.nameKey ? t(c.nameKey) : (c.name ?? '');
}
