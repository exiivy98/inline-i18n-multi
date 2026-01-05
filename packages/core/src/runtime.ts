import type { Translations, TranslationVars } from './types'
import { getLocale } from './context'
import { interpolate } from './interpolation'

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

  const template = translations[locale]
  if (template) {
    return interpolate(template, vars)
  }

  // fallback: en -> first available
  const fallback = translations.en ?? Object.values(translations)[0]
  if (fallback) {
    return interpolate(fallback, vars)
  }

  throw new Error(
    `No translation found for locale "${locale}". Available: ${Object.keys(translations).join(', ')}`
  )
}

// Register __i18n_lookup globally for plugin transformations
// This makes it available without explicit import after bundle
if (typeof globalThis !== 'undefined') {
  (globalThis as Record<string, unknown>).__i18n_lookup = __i18n_lookup
}
