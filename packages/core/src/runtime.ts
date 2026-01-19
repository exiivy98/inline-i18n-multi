import type { Translations, TranslationVars } from './types'
import { getLocale } from './context'
import { interpolate } from './interpolation'
import { buildFallbackChain, emitWarning } from './config'

/**
 * Runtime lookup function for plugin-transformed code.
 * This is called by code that has been processed by @inline-i18n-multi/babel-plugin
 * or @inline-i18n-multi/swc-plugin.
 *
 * @param _hash - Content hash (for caching/debugging, unused at runtime)
 * @param translations - Translation map with locale keys
 * @param vars - Variables for interpolation
 */
export function __i18n_lookup(
  _hash: string,
  translations: Translations,
  vars?: TranslationVars
): string {
  const locale = getLocale()
  const availableLocales = Object.keys(translations)
  const fallbackChain = buildFallbackChain(locale)

  // Try each locale in the fallback chain
  for (const tryLocale of fallbackChain) {
    const template = translations[tryLocale]
    if (template) {
      // Warn if we had to fall back
      if (tryLocale !== locale) {
        emitWarning({
          type: 'missing_translation',
          requestedLocale: locale,
          availableLocales,
          fallbackUsed: tryLocale,
        })
      }
      return interpolate(template, vars, tryLocale)
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
    return interpolate(firstAvailable[1], vars, firstAvailable[0])
  }

  throw new Error(
    `No translation found for locale "${locale}". Available: ${availableLocales.join(', ')}`
  )
}

// Register __i18n_lookup globally for plugin transformations
// This makes it available without explicit import after bundle
if (typeof globalThis !== 'undefined') {
  (globalThis as Record<string, unknown>).__i18n_lookup = __i18n_lookup
}
