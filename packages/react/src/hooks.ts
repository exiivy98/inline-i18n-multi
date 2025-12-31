import { useLocaleContext } from './context'
import type { Locale } from 'inline-i18n-multi'

/**
 * Get current locale and setter
 */
export function useLocale(): [Locale, (locale: Locale) => void] {
  const { locale, setLocale } = useLocaleContext()
  return [locale, setLocale]
}
