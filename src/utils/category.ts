import { tx, type AppT } from '../i18n/useT';
import type { Category } from '../types';

export function categoryLabel(c: Category, t: AppT): string {
  return c.nameKey ? tx(t, c.nameKey) : (c.name ?? '');
}
