import { tx, type AppT } from '../i18n/useT';
import type { Entry, Habit } from '../types';
import {
  lastNDaysISO,
  monthShort,
  subDaysISO,
  todayISO,
  weekdayIndex,
  type ISODate,
} from './date';

export type EntriesByDate = Record<string, Entry>;

export function currentStreak(entries: EntriesByDate, today: ISODate = todayISO()): number {
  let streak = 0;
  let cursor = today;
  while (entries[cursor]?.completed) {
    streak += 1;
    cursor = subDaysISO(cursor, 1);
  }
  return streak;
}

export function bestStreak(entries: EntriesByDate): number {
  const dates = Object.keys(entries)
    .filter((d) => entries[d].completed)
    .sort();
  if (dates.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < dates.length; i++) {
    if (subDaysISO(dates[i], 1) === dates[i - 1]) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

export function completionRate(entries: EntriesByDate, dates: ISODate[]): number {
  if (dates.length === 0) return 0;
  let done = 0;
  for (const d of dates) if (entries[d]?.completed) done += 1;
  return done / dates.length;
}

export type Period = '7d' | '30d' | '90d' | '1y';

export type BucketPoint = {
  label: string;
  value: number;
  rate: number;
};

const PERIOD_DAYS: Record<Period, number> = {
  '7d': 7,
  '30d': 30,
  '90d': 90,
  '1y': 365,
};

export function periodDays(period: Period): number {
  return PERIOD_DAYS[period];
}

export function aggregate(
  habit: Habit,
  entries: EntriesByDate,
  period: Period,
  t: AppT,
): BucketPoint[] {
  const days = lastNDaysISO(PERIOD_DAYS[period]);
  if (period === '7d') return days.map((d) => bucketOfDay(d, entries, habit, t));
  if (period === '30d') return groupByWeek(days, entries, habit);
  if (period === '90d') return groupByWeek(days, entries, habit);
  return groupByMonth(days, entries, habit);
}

function bucketOfDay(d: ISODate, entries: EntriesByDate, habit: Habit, t: AppT): BucketPoint {
  const e = entries[d];
  const value = e?.value ?? 0;
  const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);
  return {
    label: tx(t, `common:weekdaysShort.${weekdayIndex(d)}`),
    value,
    rate: Math.min(1, value / target),
  };
}

function groupByWeek(days: ISODate[], entries: EntriesByDate, habit: Habit): BucketPoint[] {
  const weeks: BucketPoint[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    const completed = chunk.reduce((n, d) => n + (entries[d]?.completed ? 1 : 0), 0);
    const sum = chunk.reduce((n, d) => n + (entries[d]?.value ?? 0), 0);
    weeks.push({
      label: monthShort(chunk[chunk.length - 1]),
      value: habit.type === 'binary' ? completed : sum / chunk.length,
      rate: completed / chunk.length,
    });
  }
  return weeks;
}

function groupByMonth(days: ISODate[], entries: EntriesByDate, habit: Habit): BucketPoint[] {
  const byMonth = new Map<string, ISODate[]>();
  for (const d of days) {
    const key = d.slice(0, 7);
    const arr = byMonth.get(key);
    if (arr) arr.push(d);
    else byMonth.set(key, [d]);
  }
  const out: BucketPoint[] = [];
  for (const [, group] of byMonth) {
    const completed = group.reduce((n, d) => n + (entries[d]?.completed ? 1 : 0), 0);
    const sum = group.reduce((n, d) => n + (entries[d]?.value ?? 0), 0);
    out.push({
      label: monthShort(group[group.length - 1]),
      value: habit.type === 'binary' ? completed : sum / group.length,
      rate: completed / group.length,
    });
  }
  return out;
}

export function intensityLevel(value: number, target: number): 0 | 1 | 2 | 3 | 4 {
  if (value <= 0) return 0;
  const ratio = value / target;
  if (ratio >= 1) return 4;
  if (ratio >= 0.75) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}
