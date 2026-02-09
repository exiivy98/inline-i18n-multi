import type { Locale } from './types'
import { getParentLocale } from './config'

export type DetectSource = 'navigator' | 'cookie' | 'url' | 'header'

export interface DetectLocaleOptions {
  /** Locales your app supports */
  supportedLocales: Locale[]
  /** Fallback when no source matches */
  defaultLocale: Locale
  /** Detection sources in priority order (default: ['navigator']) */
  sources?: DetectSource[]
  /** Cookie name to read (default: 'NEXT_LOCALE') */
  cookieName?: string
  /** Accept-Language header value (for SSR) */
  headerValue?: string
}

/**
 * Try to match a candidate locale against supported locales
 * Supports exact match and BCP 47 parent matching (e.g., en-US → en)
 */
function matchLocale(candidate: string, supportedLocales: Locale[]): Locale | undefined {
  const normalized = candidate.trim().toLowerCase()
  // Exact match (case-insensitive)
  const exact = supportedLocales.find(l => l.toLowerCase() === normalized)
  if (exact) return exact

  // BCP 47 parent match
  const parent = getParentLocale(candidate)
  if (parent) {
    const parentMatch = supportedLocales.find(l => l.toLowerCase() === parent.toLowerCase())
    if (parentMatch) return parentMatch
  }

  return undefined
}

/**
 * Detect locale from browser navigator.languages
 */
function detectFromNavigator(supportedLocales: Locale[]): Locale | undefined {
  if (typeof globalThis === 'undefined') return undefined
  const nav = (globalThis as { navigator?: { languages?: readonly string[]; language?: string } }).navigator
  if (!nav) return undefined

  const languages = nav.languages || (nav.language ? [nav.language] : [])
  for (const lang of languages) {
    const match = matchLocale(lang, supportedLocales)
    if (match) return match
  }
  return undefined
}

/**
 * Detect locale from document.cookie
 */
function detectFromCookie(supportedLocales: Locale[], cookieName: string): Locale | undefined {
  if (typeof document === 'undefined') return undefined

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.split('=').map(s => s.trim())
    if (key === cookieName && value) {
      return matchLocale(value, supportedLocales)
    }
  }
  return undefined
}

/**
 * Detect locale from URL pathname (e.g., /ko/about → ko)
 */
function detectFromUrl(supportedLocales: Locale[]): Locale | undefined {
  if (typeof location === 'undefined') return undefined

  const pathname = location.pathname
  // Match first path segment: /ko/... or /en-US/...
  const match = pathname.match(/^\/([a-zA-Z]{2}(?:-[a-zA-Z]{2,})?)(?:\/|$)/)
  if (match?.[1]) {
    return matchLocale(match[1], supportedLocales)
  }
  return undefined
}

/**
 * Parse Accept-Language header value
 * e.g., "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
 */
function detectFromHeader(supportedLocales: Locale[], headerValue?: string): Locale | undefined {
  if (!headerValue) return undefined

  const entries = headerValue
    .split(',')
    .map(part => {
      const parts = part.trim().split(';')
      const lang = parts[0]?.trim() || ''
      const qStr = parts[1]
      const q = qStr ? parseFloat(qStr.replace(/q=/, '')) : 1.0
      return { lang, q }
    })
    .sort((a, b) => b.q - a.q)

  for (const { lang } of entries) {
    const match = matchLocale(lang, supportedLocales)
    if (match) return match
  }
  return undefined
}

/**
 * Auto-detect the user's locale from multiple sources
 *
 * @example
 * const locale = detectLocale({
 *   supportedLocales: ['en', 'ko', 'ja'],
 *   defaultLocale: 'en',
 *   sources: ['cookie', 'navigator'],
 *   cookieName: 'NEXT_LOCALE',
 * })
 */
export function detectLocale(options: DetectLocaleOptions): Locale {
  const {
    supportedLocales,
    defaultLocale,
    sources = ['navigator'],
    cookieName = 'NEXT_LOCALE',
    headerValue,
  } = options

  for (const source of sources) {
    let detected: Locale | undefined
    switch (source) {
      case 'navigator':
        detected = detectFromNavigator(supportedLocales)
        break
      case 'cookie':
        detected = detectFromCookie(supportedLocales, cookieName)
        break
      case 'url':
        detected = detectFromUrl(supportedLocales)
        break
      case 'header':
        detected = detectFromHeader(supportedLocales, headerValue)
        break
    }
    if (detected) return detected
  }

  return defaultLocale
}
