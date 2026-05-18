import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './resources/de.json';
import en from './resources/en.json';
import es from './resources/es.json';
import ru from './resources/ru.json';

export const SUPPORTED_LANGUAGES = ['ru', 'en', 'es', 'de'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const FALLBACK: SupportedLanguage = 'ru';

function detectSystemLanguage(): SupportedLanguage {
  const code = getLocales()[0]?.languageCode;
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code ?? '')
    ? (code as SupportedLanguage)
    : FALLBACK;
}

void i18n.use(initReactI18next).init({
  resources: { ru: ru, en: en, es: es, de: de },
  lng: detectSystemLanguage(),
  fallbackLng: FALLBACK,
  compatibilityJSON: 'v4',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
