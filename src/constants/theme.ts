export type ThemeName = 'light' | 'dark';

export type Palette = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  danger: string;
  warning: string;
  trackBg: string;
  overlay: string;
};

export const PALETTES: Record<ThemeName, Palette> = {
  light: {
    bg: '#ffffff',
    surface: '#f8fafc',
    surfaceAlt: '#f1f5f9',
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    border: '#e5e7eb',
    primary: '#22c55e',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    trackBg: '#e5e7eb',
    overlay: 'rgba(15,23,42,0.06)',
  },
  dark: {
    bg: '#0b1220',
    surface: '#111827',
    surfaceAlt: '#1f2937',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    border: '#334155',
    primary: '#22c55e',
    success: '#22c55e',
    danger: '#f87171',
    warning: '#fbbf24',
    trackBg: '#1f2937',
    overlay: 'rgba(255,255,255,0.08)',
  },
};
