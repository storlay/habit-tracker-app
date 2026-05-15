import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import { DEFAULT_CATEGORIES } from '../constants/seed';
import {
  loadCategories,
  loadEntries,
  loadHabits,
  saveCategories,
  saveEntries,
  saveHabits,
} from '../storage/repository';
import type { Category, EntriesMap, Entry, Habit, HabitDraft } from '../types';
import { uid } from '../utils/id';
import { todayISO } from '../utils/date';
import { validateDraft } from '../utils/validation';
import { cancelIds, scheduleForHabit } from '../utils/notifications';

type State = {
  habits: Habit[];
  categories: Category[];
  entries: EntriesMap;
  hydrated: boolean;
};

type Action =
  | { type: 'HYDRATE'; payload: Omit<State, 'hydrated'> }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'EDIT_HABIT'; id: string; patch: Partial<Habit> }
  | { type: 'ADD_CATEGORY'; category: Category }
  | { type: 'EDIT_CATEGORY'; id: string; patch: Partial<Category> }
  | { type: 'DELETE_CATEGORY'; id: string }
  | { type: 'SET_ENTRY'; entry: Entry };

const initialState: State = {
  habits: [],
  categories: [],
  entries: {},
  hydrated: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.payload, hydrated: true };

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };

    case 'EDIT_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) => (h.id === action.id ? { ...h, ...action.patch } : h)),
      };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.category] };

    case 'EDIT_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, ...action.patch } : c,
        ),
      };

    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.id) };

    case 'SET_ENTRY': {
      const { habitId, date } = action.entry;
      const perHabit = { ...(state.entries[habitId] ?? {}), [date]: action.entry };
      return { ...state, entries: { ...state.entries, [habitId]: perHabit } };
    }

    default:
      return state;
  }
}

type ContextValue = {
  state: State;
  addHabit: (draft: HabitDraft) => Promise<string | null>;
  editHabit: (id: string, patch: Partial<Habit>) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  addCategory: (input: Omit<Category, 'id'>) => string;
  editCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setEntry: (habitId: string, date: string, value: number) => void;
  toggleBinary: (habitId: string, date?: string) => void;
};

const HabitsContext = createContext<ContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const hydratedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const [habits, categories, entries] = await Promise.all([
        loadHabits(),
        loadCategories(),
        loadEntries(),
      ]);
      const initialCategories = categories ?? DEFAULT_CATEGORIES;
      dispatch({
        type: 'HYDRATE',
        payload: {
          habits: habits ?? [],
          categories: initialCategories,
          entries: entries ?? {},
        },
      });
      if (!categories) await saveCategories(initialCategories);
      hydratedRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (hydratedRef.current) void saveHabits(state.habits);
  }, [state.habits]);

  useEffect(() => {
    if (hydratedRef.current) void saveCategories(state.categories);
  }, [state.categories]);

  useEffect(() => {
    if (hydratedRef.current) void saveEntries(state.entries);
  }, [state.entries]);

  const addCategory = useCallback((input: Omit<Category, 'id'>) => {
    const category: Category = { ...input, id: uid() };
    dispatch({ type: 'ADD_CATEGORY', category });
    return category.id;
  }, []);

  const editCategory = useCallback((id: string, patch: Partial<Category>) => {
    dispatch({ type: 'EDIT_CATEGORY', id, patch });
  }, []);

  const deleteCategory = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', id });
  }, []);

  const value = useMemo<ContextValue>(() => {
    const setEntry: ContextValue['setEntry'] = (habitId, date, value) => {
      const habit = state.habits.find((h) => h.id === habitId);
      if (!habit) return;
      const target = habit.type === 'binary' ? 1 : (habit.target ?? 1);
      const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
      dispatch({
        type: 'SET_ENTRY',
        entry: { habitId, date, value: safe, completed: safe >= target },
      });
    };

    const toggleBinary: ContextValue['toggleBinary'] = (habitId, date = todayISO()) => {
      const current = state.entries[habitId]?.[date]?.value ?? 0;
      setEntry(habitId, date, current > 0 ? 0 : 1);
    };

    const addHabit: ContextValue['addHabit'] = async (draft) => {
      if (validateDraft(draft)) return null;
      const habit: Habit = {
        ...draft,
        id: uid(),
        createdAt: new Date().toISOString(),
        archived: false,
      };
      const ids = await scheduleForHabit(habit).catch((e: unknown) => { console.warn('notifications schedule failed', e); return [] as string[]; });
      dispatch({
        type: 'ADD_HABIT',
        habit: { ...habit, notificationIds: ids.length ? ids : undefined },
      });
      return habit.id;
    };

    const editHabit: ContextValue['editHabit'] = async (id, patch) => {
      const current = state.habits.find((h) => h.id === id);
      if (!current) return;
      const merged: Habit = { ...current, ...patch };
      const reminderChanged =
        JSON.stringify(current.reminder) !== JSON.stringify(merged.reminder);
      const titleChanged = current.title !== merged.title;
      if (!reminderChanged && !titleChanged) {
        dispatch({ type: 'EDIT_HABIT', id, patch });
        return;
      }
      await cancelIds(current.notificationIds).catch((e: unknown) => { console.warn('notifications cancel failed', e); });
      const ids = await scheduleForHabit(merged).catch((e: unknown) => { console.warn('notifications schedule failed', e); return [] as string[]; });
      dispatch({
        type: 'EDIT_HABIT',
        id,
        patch: { ...patch, notificationIds: ids.length ? ids : undefined },
      });
    };

    const archiveHabit: ContextValue['archiveHabit'] = async (id) => {
      const current = state.habits.find((h) => h.id === id);
      await cancelIds(current?.notificationIds).catch((e: unknown) => { console.warn('notifications cancel failed', e); });
      dispatch({ type: 'EDIT_HABIT', id, patch: { archived: true, notificationIds: undefined } });
    };

    return {
      state,
      addHabit,
      editHabit,
      archiveHabit,
      addCategory,
      editCategory,
      deleteCategory,
      setEntry,
      toggleBinary,
    };
  }, [state, addCategory, editCategory, deleteCategory]);

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits(): ContextValue {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used within HabitsProvider');
  return ctx;
}
