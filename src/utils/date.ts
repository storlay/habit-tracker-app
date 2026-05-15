import { format } from 'date-fns';

export function todayISO(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}
