import { addDays, format, parseISO, subDays } from 'date-fns';

export type ISODate = string;

export function todayISO(date: Date = new Date()): ISODate {
  return format(date, 'yyyy-MM-dd');
}

export function addDaysISO(iso: ISODate, n: number): ISODate {
  return format(addDays(parseISO(iso), n), 'yyyy-MM-dd');
}

export function subDaysISO(iso: ISODate, n: number): ISODate {
  return format(subDays(parseISO(iso), n), 'yyyy-MM-dd');
}

export function lastNDaysISO(n: number, from: ISODate = todayISO()): ISODate[] {
  const out: ISODate[] = new Array(n);
  for (let i = 0; i < n; i++) out[i] = subDaysISO(from, n - 1 - i);
  return out;
}

export function weekdayIndex(iso: ISODate): number {
  return parseISO(iso).getDay();
}

export function monthShort(iso: ISODate): string {
  return format(parseISO(iso), 'LLL');
}
