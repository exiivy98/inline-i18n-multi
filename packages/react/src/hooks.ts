import { useCallback, useState, useEffect } from 'react'
import { useLocaleContext } from './context'
import { t as coreT, loadAsync, isLoaded, detectLocale, setLocale } from 'inline-i18n-multi'
import type { Locale, TranslationVars, DetectLocaleOptions } from 'inline-i18n-multi'

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

/**
 * Hook for lazy loading dictionaries
 * Automatically loads dictionaries when locale or namespace changes
 *
 * @example
 * function Dashboard() {
 *   const { isLoading, error } = useLoadDictionaries('ko', 'dashboard')
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error message={error.message} />
 *   return <Content />
 * }
 */
export function useLoadDictionaries(
  locale: Locale,
  namespace?: string
): { isLoading: boolean; error: Error | null } {
  const [isLoading, setIsLoading] = useState(() => !isLoaded(locale, namespace))
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isLoaded(locale, namespace)) {
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    loadAsync(locale, namespace)
      .then(() => setIsLoading(false))
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      })
  }, [locale, namespace])

  return { isLoading, error }
}

/**
 * Hook that auto-detects and sets locale on mount
 *
 * @example
 * function App() {
 *   useDetectedLocale({
 *     supportedLocales: ['en', 'ko', 'ja'],
 *     defaultLocale: 'en',
 *     sources: ['cookie', 'navigator'],
 *   })
 *   return <Content />
 * }
 */
export function useDetectedLocale(options: DetectLocaleOptions): void {
  const { setLocale: setContextLocale } = useLocaleContext()

  useEffect(() => {
    const detected = detectLocale(options)
    setLocale(detected)
    setContextLocale(detected)
    // Run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
