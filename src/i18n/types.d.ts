import 'i18next';
import type ru from './resources/ru.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: typeof ru;
  }
}
