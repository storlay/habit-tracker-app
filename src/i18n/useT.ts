import { useTranslation } from 'react-i18next';
import { NAMESPACES } from './index';

export const useT = () => useTranslation(NAMESPACES);

export type AppT = ReturnType<typeof useT>['t'];

export function tx(t: AppT, key: string, options?: { count?: number }): string {
  return t(key as never, options as never) as unknown as string;
}
