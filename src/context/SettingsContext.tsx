import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import { PALETTES, type Palette, type ThemeName } from '../constants/theme';
import { loadSettings, saveSettings } from '../storage/repository';
import type { Settings } from '../types';

const DEFAULTS: Settings = { theme: 'system', weekStartsOn: 1 };

type ContextValue = {
  settings: Settings;
  theme: ThemeName;
  colors: Palette;
  setTheme: (theme: Settings['theme']) => void;
  setWeekStartsOn: (day: Settings['weekStartsOn']) => void;
};

const SettingsContext = createContext<ContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const hydratedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadSettings();
      if (loaded) setSettings({ ...DEFAULTS, ...loaded });
      hydratedRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (hydratedRef.current) void saveSettings(settings);
  }, [settings]);

  const setTheme = useCallback((theme: Settings['theme']) => {
    setSettings((s) => ({ ...s, theme }));
  }, []);

  const setWeekStartsOn = useCallback((weekStartsOn: Settings['weekStartsOn']) => {
    setSettings((s) => ({ ...s, weekStartsOn }));
  }, []);

  const theme: ThemeName =
    settings.theme === 'system' ? (system === 'dark' ? 'dark' : 'light') : settings.theme;

  const value = useMemo<ContextValue>(
    () => ({
      settings,
      theme,
      colors: PALETTES[theme],
      setTheme,
      setWeekStartsOn,
    }),
    [settings, theme, setTheme, setWeekStartsOn],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): ContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function useTheme(): { colors: Palette; theme: ThemeName } {
  const { colors, theme } = useSettings();
  return { colors, theme };
}
