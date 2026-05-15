import type { HabitDraft, HabitType } from '../types';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: string): boolean {
  return HEX_RE.test(value);
}

export function isHabitType(value: string): value is HabitType {
  return value === 'binary' || value === 'counter' || value === 'duration';
}

export function validateDraft(draft: HabitDraft): string | null {
  if (!draft.title || draft.title.length === 0) return 'Введите название';
  if (!isHabitType(draft.type)) return 'Неверный тип привычки';
  if (!isHexColor(draft.color)) return 'Неверный цвет';
  if (!draft.categoryId) return 'Выберите категорию';
  if (draft.type !== 'binary' && (!Number.isFinite(draft.target) || (draft.target as number) < 1)) {
    return 'Укажите цель';
  }
  if (draft.reminder) {
    const { hour, minute, days } = draft.reminder;
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) return 'Неверный час напоминания';
    if (!Number.isInteger(minute) || minute < 0 || minute > 59) return 'Неверная минута напоминания';
    if (!Array.isArray(days) || days.length === 0) return 'Выберите дни напоминания';
    if (days.some((d) => !Number.isInteger(d) || d < 0 || d > 6)) return 'Неверные дни напоминания';
  }
  return null;
}
