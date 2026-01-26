import type { Translations, TranslationVars } from './types'
import { getLocale } from './context'
import { interpolate } from './interpolation'
import { buildFallbackChain, emitWarning, applyDebugFormat, type DebugInfo } from './config'

interface ResolveResult {
  template: string
  locale: string
  debugInfo: DebugInfo
}

function resolveTemplate(translations: Translations): ResolveResult {
  const locale = getLocale()
  const availableLocales = Object.keys(translations)
  const fallbackChain = buildFallbackChain(locale)

  // Try each locale in the fallback chain
  for (const tryLocale of fallbackChain) {
    const template = translations[tryLocale]
    if (template) {
      const isFallback = tryLocale !== locale
      // Warn if we had to fall back
      if (isFallback) {
        emitWarning({
          type: 'missing_translation',
          requestedLocale: locale,
          availableLocales,
          fallbackUsed: tryLocale,
        })
      }
      return {
        template,
        locale: tryLocale,
        debugInfo: {
          isMissing: false,
          isFallback,
          requestedLocale: locale,
          usedLocale: tryLocale,
        },
      }
    }
  }

  // Last resort: use first available translation
  const firstAvailable = Object.entries(translations)[0]
  if (firstAvailable) {
    emitWarning({
      type: 'missing_translation',
      requestedLocale: locale,
      availableLocales,
      fallbackUsed: firstAvailable[0],
    })
    return {
      template: firstAvailable[1],
      locale: firstAvailable[0],
      debugInfo: {
        isMissing: false,
        isFallback: true,
        requestedLocale: locale,
        usedLocale: firstAvailable[0],
      },
    }
  }

  throw new Error(
    `No translation found for locale "${locale}". Available: ${availableLocales.join(', ')}`
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
    const { template, locale, debugInfo } = resolveTemplate(translations)
    const result = interpolate(template, vars, locale)
    return applyDebugFormat(result, debugInfo)
  }

  // shorthand syntax: it('한글', 'English', vars?)
  const ko = first
  const en = second as string
  const vars = third

  const translations: Translations = { ko, en }
  const { template, locale, debugInfo } = resolveTemplate(translations)
  const result = interpolate(template, vars, locale)
  return applyDebugFormat(result, debugInfo)
}
