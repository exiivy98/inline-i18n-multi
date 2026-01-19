import { getLocale } from './context'
import type { Locale, TranslationVars } from './types'
import { interpolate } from './interpolation'
import { buildFallbackChain, emitWarning } from './config'

/**
 * Nested dictionary structure for translations
 * @example { greeting: { hello: "Hello", goodbye: "Goodbye" } }
 */
export type Dictionary = {
  [key: string]: string | Dictionary
}

/**
 * All loaded dictionaries by locale
 */
export type Dictionaries = Record<Locale, Dictionary>

/**
 * Plural rules configuration
 */
export interface PluralRules {
  zero?: string
  one?: string
  two?: string
  few?: string
  many?: string
  other: string
}

// Global dictionary storage
let dictionaries: Dictionaries = {}

/**
 * Load translations from dictionary objects
 * @param dicts - Dictionary objects keyed by locale
 * @example
 * loadDictionaries({
 *   en: { greeting: { hello: "Hello" } },
 *   ko: { greeting: { hello: "안녕하세요" } }
 * })
 */
export function loadDictionaries(dicts: Dictionaries): void {
  dictionaries = { ...dictionaries, ...dicts }
}

/**
 * Load a single locale's dictionary
 * @param locale - Locale code
 * @param dict - Dictionary object
 */
export function loadDictionary(locale: Locale, dict: Dictionary): void {
  dictionaries[locale] = { ...dictionaries[locale], ...dict }
}

/**
 * Clear all loaded dictionaries
 */
export function clearDictionaries(): void {
  dictionaries = {}
}

/**
 * Get a nested value from dictionary using dot notation
 * @param dict - Dictionary object
 * @param key - Dot-separated key path
 */
function getNestedValue(dict: Dictionary, key: string): string | undefined {
  const parts = key.split('.')
  let current: string | Dictionary | undefined = dict

  for (const part of parts) {
    if (typeof current !== 'object' || current === null) {
      return undefined
    }
    current = current[part]
    if (current === undefined) {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

/**
 * Get plural category using Intl.PluralRules
 */
function getPluralCategory(count: number, locale: Locale): Intl.LDMLPluralRule {
  const rules = new Intl.PluralRules(locale)
  return rules.select(count)
}

/**
 * Try to find a translation in a dictionary, handling plurals
 */
function findInDictionary(
  dict: Dictionary,
  key: string,
  vars: TranslationVars | undefined,
  locale: Locale
): string | undefined {
  let template = getNestedValue(dict, key)

  // Handle plurals if count is provided
  if (vars && typeof vars.count === 'number') {
    const pluralKey = `${key}_${getPluralCategory(vars.count, locale)}`
    const pluralTemplate = getNestedValue(dict, pluralKey)
    if (pluralTemplate) {
      template = pluralTemplate
    }
  }

  return template
}

/**
 * Translate using key-based lookup (i18n compatible)
 * @param key - Dot-separated translation key
 * @param vars - Variables for interpolation (including 'count' for plurals)
 * @param locale - Override locale (optional)
 * @example
 * t('greeting.hello') // "Hello"
 * t('items.count', { count: 5 }) // "5 items"
 */
export function t(
  key: string,
  vars?: TranslationVars,
  locale?: Locale
): string {
  const currentLocale = locale ?? getLocale()
  const fallbackChain = buildFallbackChain(currentLocale)
  const availableLocales = Object.keys(dictionaries)

  let template: string | undefined
  let usedLocale: Locale | undefined

  // Try each locale in the fallback chain
  for (const tryLocale of fallbackChain) {
    const dict = dictionaries[tryLocale]
    if (!dict) continue

    const found = findInDictionary(dict, key, vars, tryLocale)
    if (found) {
      template = found
      usedLocale = tryLocale
      break
    }
  }

  if (!template) {
    emitWarning({
      type: 'missing_translation',
      key,
      requestedLocale: currentLocale,
      availableLocales,
    })
    return key
  }

  // Warn if we used a fallback
  if (usedLocale && usedLocale !== currentLocale) {
    emitWarning({
      type: 'missing_translation',
      key,
      requestedLocale: currentLocale,
      availableLocales,
      fallbackUsed: usedLocale,
    })
  }

  return interpolate(template, vars, usedLocale || currentLocale)
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(key: string, locale?: Locale): boolean {
  const currentLocale = locale ?? getLocale()
  const dict = dictionaries[currentLocale]
  return dict ? getNestedValue(dict, key) !== undefined : false
}

/**
 * Get all loaded locales
 */
export function getLoadedLocales(): Locale[] {
  return Object.keys(dictionaries)
}

/**
 * Get dictionary for a specific locale
 */
export function getDictionary(locale: Locale): Dictionary | undefined {
  return dictionaries[locale]
}
