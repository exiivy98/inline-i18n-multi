import { getLocale } from './context'
import type { Locale, TranslationVars } from './types'
import { interpolate } from './interpolation'
import { buildFallbackChain, emitWarning, applyDebugFormat, getConfig, type DebugInfo } from './config'

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
 * Namespaced dictionaries storage
 * Structure: { namespace: { locale: Dictionary } }
 */
type NamespacedDictionaries = Record<string, Dictionaries>

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

// Default namespace for backward compatibility
const DEFAULT_NAMESPACE = 'default'

// Namespace separator in keys
const NAMESPACE_SEPARATOR = ':'

// Global dictionary storage - now namespaced
let namespacedDictionaries: NamespacedDictionaries = {}

// Lazy loading state tracking (v0.5.0)
let loadingState: Record<string, 'loading' | 'loaded' | 'error'> = {}
const loadingPromises = new Map<string, Promise<void>>()

function getLoadingKey(locale: Locale, namespace: string): string {
  return `${namespace}:${locale}`
}

/**
 * Parse a key that may contain a namespace prefix
 * @example
 * parseKey('common:greeting') // { namespace: 'common', key: 'greeting' }
 * parseKey('greeting')        // { namespace: 'default', key: 'greeting' }
 */
function parseKey(fullKey: string): { namespace: string; key: string } {
  const separatorIndex = fullKey.indexOf(NAMESPACE_SEPARATOR)
  if (separatorIndex > 0) {
    return {
      namespace: fullKey.substring(0, separatorIndex),
      key: fullKey.substring(separatorIndex + 1),
    }
  }
  return {
    namespace: DEFAULT_NAMESPACE,
    key: fullKey,
  }
}

/**
 * Load translations from dictionary objects
 * @param dicts - Dictionary objects keyed by locale
 * @param namespace - Optional namespace (defaults to 'default')
 * @example
 * // Without namespace (backward compatible)
 * loadDictionaries({
 *   en: { greeting: { hello: "Hello" } },
 *   ko: { greeting: { hello: "안녕하세요" } }
 * })
 *
 * // With namespace
 * loadDictionaries({
 *   en: { hello: "Hello" },
 *   ko: { hello: "안녕하세요" }
 * }, 'common')
 */
export function loadDictionaries(dicts: Dictionaries, namespace?: string): void {
  const ns = namespace || DEFAULT_NAMESPACE
  if (!namespacedDictionaries[ns]) {
    namespacedDictionaries[ns] = {}
  }
  namespacedDictionaries[ns] = {
    ...namespacedDictionaries[ns],
    ...dicts,
  }
}

/**
 * Load a single locale's dictionary
 * @param locale - Locale code
 * @param dict - Dictionary object
 * @param namespace - Optional namespace (defaults to 'default')
 */
export function loadDictionary(locale: Locale, dict: Dictionary, namespace?: string): void {
  const ns = namespace || DEFAULT_NAMESPACE
  if (!namespacedDictionaries[ns]) {
    namespacedDictionaries[ns] = {}
  }
  namespacedDictionaries[ns][locale] = {
    ...namespacedDictionaries[ns][locale],
    ...dict,
  }
}

/**
 * Clear loaded dictionaries
 * @param namespace - Optional namespace to clear (clears all if not specified)
 */
export function clearDictionaries(namespace?: string): void {
  if (namespace) {
    delete namespacedDictionaries[namespace]
    // Clear loading state for this namespace
    for (const key of Object.keys(loadingState)) {
      if (key.startsWith(`${namespace}:`)) {
        delete loadingState[key]
        loadingPromises.delete(key)
      }
    }
  } else {
    namespacedDictionaries = {}
    loadingState = {}
    loadingPromises.clear()
  }
}

/**
 * Asynchronously load a dictionary using the configured loader
 * @param locale - Locale to load
 * @param namespace - Optional namespace (defaults to 'default')
 * @throws Error if no loader is configured
 *
 * @example
 * configure({ loader: (locale, ns) => import(`./locales/${locale}/${ns}.json`) })
 * await loadAsync('ko', 'dashboard')
 * t('dashboard:title')
 */
export async function loadAsync(locale: Locale, namespace?: string): Promise<void> {
  const ns = namespace || DEFAULT_NAMESPACE
  const cfg = getConfig()

  if (!cfg.loader) {
    throw new Error('No loader configured. Call configure({ loader: ... }) first.')
  }

  const key = getLoadingKey(locale, ns)

  // Skip if already loaded
  if (loadingState[key] === 'loaded') return

  // Deduplicate concurrent calls
  if (loadingPromises.has(key)) {
    return loadingPromises.get(key)!
  }

  const promise = (async () => {
    loadingState[key] = 'loading'
    try {
      const dict = await cfg.loader!(locale, ns)
      loadDictionary(locale, dict as Dictionary, ns)
      loadingState[key] = 'loaded'
    } catch (error) {
      loadingState[key] = 'error'
      throw error
    } finally {
      loadingPromises.delete(key)
    }
  })()

  loadingPromises.set(key, promise)
  return promise
}

/**
 * Check if a dictionary has been loaded for a locale/namespace
 * @param locale - Locale to check
 * @param namespace - Optional namespace (defaults to 'default')
 */
export function isLoaded(locale: Locale, namespace?: string): boolean {
  const ns = namespace || DEFAULT_NAMESPACE
  const key = getLoadingKey(locale, ns)
  return loadingState[key] === 'loaded'
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
 * @param key - Dot-separated translation key, optionally prefixed with namespace
 * @param vars - Variables for interpolation (including 'count' for plurals)
 * @param locale - Override locale (optional)
 * @example
 * t('greeting.hello')           // Uses default namespace
 * t('common:greeting.hello')    // Uses 'common' namespace
 * t('items.count', { count: 5 }) // "5 items"
 */
export function t(
  key: string,
  vars?: TranslationVars,
  locale?: Locale
): string {
  const { namespace, key: actualKey } = parseKey(key)
  const currentLocale = locale ?? getLocale()
  const fallbackChain = buildFallbackChain(currentLocale)

  const nsDictionaries = namespacedDictionaries[namespace] || {}
  const availableLocales = Object.keys(nsDictionaries)

  let template: string | undefined
  let usedLocale: Locale | undefined

  // Try each locale in the fallback chain
  for (const tryLocale of fallbackChain) {
    const dict = nsDictionaries[tryLocale]
    if (!dict) continue

    const found = findInDictionary(dict, actualKey, vars, tryLocale)
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

    const debugInfo: DebugInfo = {
      isMissing: true,
      isFallback: false,
      requestedLocale: currentLocale,
      key,
    }
    return applyDebugFormat(key, debugInfo)
  }

  const isFallback = usedLocale !== currentLocale

  // Warn if we used a fallback
  if (isFallback) {
    emitWarning({
      type: 'missing_translation',
      key,
      requestedLocale: currentLocale,
      availableLocales,
      fallbackUsed: usedLocale,
    })
  }

  const result = interpolate(template, vars, usedLocale || currentLocale)

  const debugInfo: DebugInfo = {
    isMissing: false,
    isFallback,
    requestedLocale: currentLocale,
    usedLocale,
    key,
  }

  return applyDebugFormat(result, debugInfo)
}

/**
 * Check if a translation key exists
 * @param key - Translation key (may include namespace prefix)
 * @param locale - Optional locale to check
 */
export function hasTranslation(key: string, locale?: Locale): boolean {
  const { namespace, key: actualKey } = parseKey(key)
  const currentLocale = locale ?? getLocale()
  const nsDictionaries = namespacedDictionaries[namespace] || {}
  const dict = nsDictionaries[currentLocale]
  return dict ? getNestedValue(dict, actualKey) !== undefined : false
}

/**
 * Get all loaded locales
 * @param namespace - Optional namespace (returns from all if not specified)
 */
export function getLoadedLocales(namespace?: string): Locale[] {
  if (namespace) {
    return Object.keys(namespacedDictionaries[namespace] || {})
  }
  // Return unique locales across all namespaces
  const locales = new Set<Locale>()
  for (const ns of Object.values(namespacedDictionaries)) {
    for (const locale of Object.keys(ns)) {
      locales.add(locale)
    }
  }
  return Array.from(locales)
}

/**
 * Get dictionary for a specific locale
 * @param locale - Locale code
 * @param namespace - Optional namespace (defaults to 'default')
 */
export function getDictionary(locale: Locale, namespace?: string): Dictionary | undefined {
  const ns = namespace || DEFAULT_NAMESPACE
  return namespacedDictionaries[ns]?.[locale]
}

/**
 * Get all loaded namespaces
 */
export function getLoadedNamespaces(): string[] {
  return Object.keys(namespacedDictionaries)
}
