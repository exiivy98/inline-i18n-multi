import { useState, useCallback, useMemo, type ReactNode } from 'react'
import { setLocale as setCoreLocale, type Locale } from 'inline-i18n-multi'
import { LocaleContext } from './context'

interface LocaleProviderProps {
  /**
   * Initial locale value
   */
  locale: Locale
  children: ReactNode
}

export function LocaleProvider({ locale: initialLocale, children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)

  // sync with core package
  setCoreLocale(locale)

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    setCoreLocale(newLocale)
  }, [])

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale])

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}
