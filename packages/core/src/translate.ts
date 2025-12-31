import type { Translations, TranslationVars } from './types'
import { getLocale } from './context'
import { interpolate } from './interpolation'

function resolveTemplate(translations: Translations): string {
  const locale = getLocale()

  const template = translations[locale]
  if (template) return template

  // fallback: en -> first available
  const fallback = translations.en ?? Object.values(translations)[0]
  if (fallback) return fallback

  throw new Error(
    `No translation found for locale "${locale}". Available: ${Object.keys(translations).join(', ')}`
  )
}

/**
 * Translate with two languages (shorthand)
 * @param ko - Korean text
 * @param en - English text
 * @param vars - Variables for interpolation
 */
export function it(ko: string, en: string, vars?: TranslationVars): string

/**
 * Translate with multiple languages (object syntax)
 * @param translations - Translation map with locale keys
 * @param vars - Variables for interpolation
 */
export function it(translations: Translations, vars?: TranslationVars): string

export function it(
  first: string | Translations,
  second?: string | TranslationVars,
  third?: TranslationVars,
): string {
  // object syntax: it({ ko: '...', en: '...' }, vars?)
  if (typeof first === 'object') {
    const translations = first
    const vars = second as TranslationVars | undefined
    return interpolate(resolveTemplate(translations), vars)
  }

  // shorthand syntax: it('한글', 'English', vars?)
  const ko = first
  const en = second as string
  const vars = third

  const translations: Translations = { ko, en }
  return interpolate(resolveTemplate(translations), vars)
}
