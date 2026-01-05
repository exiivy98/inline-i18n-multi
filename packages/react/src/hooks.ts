import { useCallback } from 'react'
import { useLocaleContext } from './context'
import { t as coreT } from 'inline-i18n-multi'
import type { Locale, TranslationVars } from 'inline-i18n-multi'

/**
 * Get current locale and setter
 */
export function useLocale(): [Locale, (locale: Locale) => void] {
  const { locale, setLocale } = useLocaleContext()
  return [locale, setLocale]
}

/**
 * Get translation function bound to current locale
 * @example
 * const t = useT()
 * t('greeting.hello') // uses context locale
 * t('items.count', { count: 5 })
 */
export function useT(): (key: string, vars?: TranslationVars) => string {
  const { locale } = useLocaleContext()

  return useCallback(
    (key: string, vars?: TranslationVars) => coreT(key, vars, locale),
    [locale]
  )
}
