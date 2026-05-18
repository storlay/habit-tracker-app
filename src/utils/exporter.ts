import type { Category, EntriesMap, Entry, Habit, Settings } from '../types';

export const EXPORT_VERSION = 1;

type Payload = {
  habits: Habit[];
  categories: Category[];
  entries: EntriesMap;
  settings: Settings;
};

export function exportPayload(p: Payload): string {
  const safe = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: pickSettings(p.settings),
    categories: p.categories.map(pickCategory),
    habits: p.habits.map(pickHabit),
    entries: pickEntries(p.entries),
  };
  return JSON.stringify(safe, null, 2);
}

const LANGUAGES: Settings['language'][] = ['system', 'ru', 'en', 'es', 'de'];

function pickSettings(s: Settings): Settings {
  return {
    theme: s.theme === 'light' || s.theme === 'dark' ? s.theme : 'system',
    weekStartsOn: s.weekStartsOn === 0 ? 0 : 1,
    language: LANGUAGES.includes(s.language) ? s.language : 'system',
  };
}

function pickCategory(c: Category): Category {
  return { id: c.id, name: c.name, nameKey: c.nameKey, color: c.color, icon: c.icon };
}

function pickHabit(h: Habit): Habit {
  return {
    id: h.id,
    title: h.title,
    type: h.type,
    target: h.target,
    unit: h.unit,
    categoryId: h.categoryId,
    color: h.color,
    icon: h.icon,
    weeklyGoal: h.weeklyGoal,
    reminder: h.reminder
      ? { hour: h.reminder.hour, minute: h.reminder.minute, days: [...h.reminder.days] }
      : undefined,
    createdAt: h.createdAt,
    archived: h.archived,
  };
}

function pickEntries(map: EntriesMap): EntriesMap {
  const out: EntriesMap = {};
  for (const habitId of Object.keys(map)) {
    const perDay = map[habitId];
    if (!perDay) continue;
    const next: Record<string, Entry> = {};
    for (const date of Object.keys(perDay)) {
      const e = perDay[date];
      if (!e) continue;
      next[date] = {
        habitId: e.habitId,
        date: e.date,
        value: Number.isFinite(e.value) ? e.value : 0,
        completed: !!e.completed,
      };
    }
    out[habitId] = next;
  }
  return out;
}
