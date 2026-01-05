import { useState, useCallback, useMemo, useEffect, type ReactNode } from 'react'
import { setLocale as setCoreLocale, type Locale } from 'inline-i18n-multi'
import { LocaleContext } from './context'

interface LocaleProviderProps {
  /**
   * Initial locale value
   */
  locale: Locale
  /**
   * Cookie name for persisting locale (default: NEXT_LOCALE)
   * Set to false to disable cookie sync
   */
  cookieName?: string | false
  /**
   * Callback when locale changes
   */
  onLocaleChange?: (locale: Locale) => void
  children: ReactNode
}

function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export function LocaleProvider({
  locale: initialLocale,
  cookieName = 'NEXT_LOCALE',
  onLocaleChange,
  children,
}: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // sync with core package on mount and locale change
  useEffect(() => {
    setCoreLocale(locale)
  }, [locale])

  const setLocale = useCallback(
    (newLocale: Locale) => {
      setLocaleState(newLocale)
      setCoreLocale(newLocale)

      // sync cookie for Next.js middleware
      if (cookieName) {
        setCookie(cookieName, newLocale)
      }

      // callback for custom handling
      onLocaleChange?.(newLocale)
    },
    [cookieName, onLocaleChange]
  )

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
