import type { Locale } from './types'
import { getConfig } from './config'

let currentLocale: Locale = 'en'

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match?.[1]
}

function persistLocaleToStorage(locale: Locale): void {
  const cfg = getConfig()
  if (!cfg.persistLocale) return

  const { storage, key = 'LOCALE', expires = 365 } = cfg.persistLocale

  if (storage === 'cookie') {
    setCookie(key, locale, expires)
  } else if (storage === 'localStorage') {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, locale)
      } catch {
        // localStorage may be full or blocked
      }
    }
  }
}

export function setLocale(locale: Locale): void {
  currentLocale = locale
  persistLocaleToStorage(locale)
}

export function getLocale(): Locale {
  return currentLocale
}

/**
 * Restore locale from configured persistent storage.
 * Returns the restored locale, or undefined if nothing was found.
 */
export function restoreLocale(): Locale | undefined {
  const cfg = getConfig()
  if (!cfg.persistLocale) return undefined

  const { storage, key = 'LOCALE' } = cfg.persistLocale
  let stored: string | undefined

  if (storage === 'cookie') {
    stored = getCookie(key)
  } else if (storage === 'localStorage') {
    if (typeof localStorage !== 'undefined') {
      try {
        stored = localStorage.getItem(key) ?? undefined
      } catch {
        // localStorage may be blocked
      }
    }
  }

  if (stored) {
    currentLocale = stored
    return stored
  }

  return undefined
}
