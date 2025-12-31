import { headers } from 'next/headers'
import type { Translations, TranslationVars, Locale } from 'inline-i18n-multi'

const VARIABLE_PATTERN = /\{(\w+)\}/g

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
  return headersList.get('x-locale') || 'en'
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
