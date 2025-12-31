import { createContext, useContext } from 'react'
import type { Locale } from 'inline-i18n-multi'

interface LocaleContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

export function useLocaleContext(): LocaleContextValue {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocaleContext must be used within a LocaleProvider')
  }

  return context
}
