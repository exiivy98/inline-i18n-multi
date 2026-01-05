import { headers } from 'next/headers'
import type { Translations, TranslationVars, Locale } from 'inline-i18n-multi'

const VARIABLE_PATTERN = /\{(\w+)\}/g

// ============================================
// SEO Configuration
// ============================================

export interface I18nConfig {
  locales: readonly Locale[] | Locale[]
  defaultLocale: Locale
  baseUrl?: string
}

let _config: I18nConfig = {
  locales: ['ko', 'en'],
  defaultLocale: 'ko',
}

/**
 * Configure i18n settings for SEO utilities
 */
export function configureI18n(config: I18nConfig): void {
  _config = { ..._config, ...config }
}

/**
 * Get current i18n configuration
 */
export function getI18nConfig(): I18nConfig {
  return _config
}

// ============================================
// Locale Resolution
// ============================================

/**
 * Get locale from route params (for /[locale]/... routes)
 * Validates against configured locales
 * @param params - Route params containing locale
 * @returns Validated locale or throws if invalid
 */
export function getLocaleFromParams(params: { locale: string }): Locale {
  const { locale } = params
  if (_config.locales.includes(locale)) {
    return locale
  }
  throw new Error(
    `Invalid locale: "${locale}". Supported: ${_config.locales.join(', ')}`
  )
}

/**
 * Get locale from headers (set by middleware)
 */
export async function getLocaleFromHeaders(): Promise<Locale> {
  const headersList = await headers()
  return headersList.get('x-locale') || _config.defaultLocale
}

/**
 * Generate static params for all locales (for generateStaticParams)
 * @example
 * export function generateStaticParams() {
 *   return generateLocaleParams()
 * }
 */
export function generateLocaleParams(): { locale: Locale }[] {
  return _config.locales.map((locale) => ({ locale }))
}

// ============================================
// SEO Metadata Helpers
// ============================================

export interface AlternateLinks {
  canonical: string
  languages: Record<Locale | 'x-default', string>
}

/**
 * Generate alternate links for hreflang SEO
 * @param pathname - Current page pathname (without locale prefix)
 * @param currentLocale - Current locale for canonical
 * @returns Object with canonical and language alternates
 * @example
 * export async function generateMetadata({ params }) {
 *   const alternates = getAlternates('/about', params.locale)
 *   return {
 *     alternates: {
 *       canonical: alternates.canonical,
 *       languages: alternates.languages,
 *     }
 *   }
 * }
 */
export function getAlternates(pathname: string, currentLocale: Locale): AlternateLinks {
  const baseUrl = _config.baseUrl || ''
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  const languages: Record<string, string> = {}

  for (const locale of _config.locales) {
    languages[locale] = `${baseUrl}/${locale}${cleanPath}`
  }

  // x-default points to default locale
  languages['x-default'] = `${baseUrl}/${_config.defaultLocale}${cleanPath}`

  return {
    canonical: `${baseUrl}/${currentLocale}${cleanPath}`,
    languages,
  }
}

/**
 * Create translated metadata for generateMetadata
 * @example
 * export async function generateMetadata({ params }) {
 *   const locale = getLocaleFromParams(params)
 *   return createMetadata({
 *     title: { ko: '홈', en: 'Home' },
 *     description: { ko: '환영합니다', en: 'Welcome' },
 *   }, locale, '/home')
 * }
 */
export function createMetadata(
  translations: {
    title: Translations
    description?: Translations
    keywords?: Translations
  },
  locale: Locale,
  pathname?: string
): {
  title: string
  description?: string
  keywords?: string
  alternates?: { canonical: string; languages: Record<string, string> }
} {
  const result: ReturnType<typeof createMetadata> = {
    title: translations.title[locale] || translations.title[_config.defaultLocale] || '',
  }

  if (translations.description) {
    result.description =
      translations.description[locale] ||
      translations.description[_config.defaultLocale]
  }

  if (translations.keywords) {
    result.keywords =
      translations.keywords[locale] ||
      translations.keywords[_config.defaultLocale]
  }

  if (pathname) {
    const alternates = getAlternates(pathname, locale)
    result.alternates = {
      canonical: alternates.canonical,
      languages: alternates.languages,
    }
  }

  return result
}

function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template

  return template.replace(VARIABLE_PATTERN, (_, key) => {
    const value = vars[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}

async function resolveLocale(localeParam?: Locale): Promise<Locale> {
  if (localeParam) return localeParam

  const headersList = await headers()
  return headersList.get('x-locale') || _config.defaultLocale
}

function resolveTemplate(translations: Translations, locale: Locale): string {
  const template = translations[locale]
  if (template) return template

  const fallback = translations.en ?? Object.values(translations)[0]
  if (fallback) return fallback

  throw new Error(
    `No translation found for locale "${locale}". Available: ${Object.keys(translations).join(', ')}`
  )
}

/**
 * Server Component translation with two languages
 * @param ko - Korean text
 * @param en - English text
 * @param vars - Variables for interpolation
 * @param locale - Override locale (optional)
 */
export async function it(
  ko: string,
  en: string,
  vars?: TranslationVars,
  locale?: Locale,
): Promise<string>

/**
 * Server Component translation with multiple languages
 * @param translations - Translation map with locale keys
 * @param vars - Variables for interpolation
 * @param locale - Override locale (optional)
 */
export async function it(
  translations: Translations,
  vars?: TranslationVars,
  locale?: Locale,
): Promise<string>

export async function it(
  first: string | Translations,
  second?: string | TranslationVars,
  third?: TranslationVars | Locale,
  fourth?: Locale,
): Promise<string> {
  // object syntax: it({ ko, en, ... }, vars?, locale?)
  if (typeof first === 'object') {
    const translations = first
    const vars = second as TranslationVars | undefined
    const locale = await resolveLocale(third as Locale | undefined)
    return interpolate(resolveTemplate(translations, locale), vars)
  }

  // shorthand syntax: it('한글', 'English', vars?, locale?)
  const ko = first
  const en = second as string
  const vars = third as TranslationVars | undefined
  const locale = await resolveLocale(fourth)

  const translations: Translations = { ko, en }
  return interpolate(resolveTemplate(translations, locale), vars)
}

// language pair helpers
type PairFunction = (
  text1: string,
  text2: string,
  vars?: TranslationVars,
  locale?: Locale,
) => Promise<string>

function createPair(lang1: Locale, lang2: Locale): PairFunction {
  return async (text1, text2, vars, locale) => {
    const translations: Translations = {
      [lang1]: text1,
      [lang2]: text2,
    }
    return it(translations, vars, locale)
  }
}

export const it_ja = createPair('ko', 'ja')
export const it_zh = createPair('ko', 'zh')
export const it_es = createPair('ko', 'es')
export const it_fr = createPair('ko', 'fr')
export const it_de = createPair('ko', 'de')

export const en_ja = createPair('en', 'ja')
export const en_zh = createPair('en', 'zh')
export const en_es = createPair('en', 'es')
export const en_fr = createPair('en', 'fr')
export const en_de = createPair('en', 'de')

export const ja_zh = createPair('ja', 'zh')
export const ja_es = createPair('ja', 'es')
export const zh_es = createPair('zh', 'es')
