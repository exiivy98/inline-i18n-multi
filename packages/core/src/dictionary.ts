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
 * Context separator for contextual translations (v0.9.0)
 * Dictionary keys use key#context format: 'greeting#formal', 'greeting#casual'
 */
const CONTEXT_SEPARATOR = '#'

/**
 * Try to find a translation in a dictionary, handling context and plurals
 */
function findInDictionary(
  dict: Dictionary,
  key: string,
  vars: TranslationVars | undefined,
  locale: Locale
): string | undefined {
  // Try context-specific key first (v0.9.0)
  if (vars?._context) {
    const contextKey = `${key}${CONTEXT_SEPARATOR}${vars._context}`

    // Check plural variants of context key first
    if (typeof vars.count === 'number') {
      const pluralKey = `${contextKey}_${getPluralCategory(vars.count, locale)}`
      const pluralTemplate = getNestedValue(dict, pluralKey)
      if (pluralTemplate) return pluralTemplate
    }

    // Then check the context key itself
    const contextTemplate = getNestedValue(dict, contextKey)
    if (contextTemplate !== undefined) return contextTemplate

    // Fall through to base key if context key not found
  }

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
    recordMissingKey(key)

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

    // v0.10.0: Use _fallback if provided instead of raw key
    if (vars?._fallback !== undefined) {
      return applyDebugFormat(vars._fallback, debugInfo)
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
 * Get the raw template string for a translation key without interpolation (v0.14.0)
 * Returns undefined if the key is not found.
 *
 * @param key - Dot-separated translation key, optionally prefixed with namespace
 * @param locale - Override locale (optional)
 * @example
 * tRaw('welcome')               // → "Welcome, {name}!"
 * tRaw('items.count', 'ko')     // → "{count}개 항목"
 * tRaw('common:greeting')       // → "Hello"
 */
export function tRaw(key: string, locale?: Locale): string | undefined {
  const { namespace, key: actualKey } = parseKey(key)
  const currentLocale = locale ?? getLocale()
  const fallbackChain = buildFallbackChain(currentLocale)
  const nsDictionaries = namespacedDictionaries[namespace] || {}

  for (const tryLocale of fallbackChain) {
    const dict = nsDictionaries[tryLocale]
    if (!dict) continue
    const found = getNestedValue(dict, actualKey)
    if (found !== undefined) return found
  }

  return undefined
}

/**
 * Translate multiple keys at once (v0.15.0)
 * @param keys - Array of translation keys
 * @param vars - Optional variables applied to all translations
 * @param locale - Override locale (optional)
 * @returns Object mapping each key to its translated string
 *
 * @example
 * tBatch(['greeting', 'farewell'])
 * // → { greeting: 'Hello', farewell: 'Goodbye' }
 */
export function tBatch(
  keys: string[],
  vars?: TranslationVars,
  locale?: Locale,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of keys) {
    result[key] = t(key, vars, locale)
  }
  return result
}

/**
 * Check if a translation key exists
 * @param key - Translation key (may include namespace prefix)
 * @param locale - Optional locale to check
 * @param context - Optional context for contextual translations (v0.9.0)
 */
export function hasTranslation(key: string, locale?: Locale, context?: string): boolean {
  const { namespace, key: actualKey } = parseKey(key)
  const currentLocale = locale ?? getLocale()
  const nsDictionaries = namespacedDictionaries[namespace] || {}
  const dict = nsDictionaries[currentLocale]
  if (!dict) return false

  // Check context-specific key only when context is provided (v0.9.0)
  if (context) {
    const contextKey = `${actualKey}${CONTEXT_SEPARATOR}${context}`
    return getNestedValue(dict, contextKey) !== undefined
  }

  return getNestedValue(dict, actualKey) !== undefined
}

/**
 * Get all locales where a translation key is missing (v0.16.0)
 * Inverse of `hasTranslation` — checks every loaded locale in the key's namespace
 * and returns those that do not contain the key.
 *
 * @param key - Translation key (may include namespace prefix)
 * @returns Array of locale codes missing the key
 *
 * @example
 * loadDictionaries({ en: { hello: 'Hi' }, ko: { hello: '안녕' }, ja: {} })
 * getMissingLocales('hello')   // → ['ja']
 * getMissingLocales('common:greeting')   // → ['en', 'ko', 'ja'] (key missing in all)
 */
export function getMissingLocales(key: string): Locale[] {
  const { namespace, key: actualKey } = parseKey(key)
  const nsDictionaries = namespacedDictionaries[namespace] || {}
  const missing: Locale[] = []
  for (const locale of Object.keys(nsDictionaries)) {
    const dict = nsDictionaries[locale]
    if (!dict || getNestedValue(dict, actualKey) === undefined) {
      missing.push(locale)
    }
  }
  return missing
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

/**
 * Get translation completeness ratio of a locale relative to a base locale (v0.17.0)
 * Returns a value between 0 and 1 representing the fraction of base locale keys
 * that exist in the target locale.
 *
 * @param locale - Target locale to measure
 * @param baseLocale - Reference locale (defaults to config.defaultLocale)
 * @param namespace - Optional namespace to scope the comparison
 * @returns Ratio in [0, 1]; 1 if base has no keys or locale === base
 *
 * @example
 * loadDictionaries({ en: { a: '1', b: '2', c: '3' }, ko: { a: '가' } })
 * getCompletenessRatio('ko')        // → 0.333... (1 of 3 keys translated)
 * getCompletenessRatio('en')        // → 1 (same as base)
 */
export function getCompletenessRatio(
  locale: Locale,
  baseLocale?: Locale,
  namespace?: string,
): number {
  const base = baseLocale ?? getConfig().defaultLocale
  if (locale === base) return 1

  const baseKeys = getTranslationKeys(base, namespace)
  if (baseKeys.length === 0) return 1

  const localeKeys = new Set(getTranslationKeys(locale, namespace))
  let matched = 0
  for (const k of baseKeys) {
    if (localeKeys.has(k)) matched++
  }
  return matched / baseKeys.length
}

/**
 * Get the display name of a locale using Intl.DisplayNames (v0.11.0)
 * @param locale - Locale code to get display name for (e.g., 'ko', 'ja', 'en-US')
 * @param displayLocale - Locale in which to display the name (defaults to current locale)
 * @returns Display name string (e.g., "Korean", "日本語")
 *
 * @example
 * getLocaleDisplayName('ko', 'en')  // → "Korean"
 * getLocaleDisplayName('ko', 'ko')  // → "한국어"
 * getLocaleDisplayName('en', 'ja')  // → "英語"
 */
export function getLocaleDisplayName(locale: Locale, displayLocale?: Locale): string {
  const dl = displayLocale ?? getLocale()
  try {
    const displayNames = new Intl.DisplayNames([dl], { type: 'language' })
    return displayNames.of(locale) ?? locale
  } catch {
    return locale
  }
}

/**
 * Get all translation keys for a locale (v0.11.0)
 * @param locale - Locale to get keys for (defaults to current locale)
 * @param namespace - Optional namespace (returns from all if not specified)
 * @returns Array of translation keys (dot-notation paths)
 *
 * @example
 * getTranslationKeys('en')             // → ['greeting.hello', 'greeting.goodbye', 'welcome']
 * getTranslationKeys('en', 'common')   // → ['hello', 'goodbye']
 */
export function getTranslationKeys(locale?: Locale, namespace?: string): string[] {
  const loc = locale ?? getLocale()
  const keys: string[] = []

  function collectKeys(dict: Dictionary, prefix: string): void {
    for (const [k, v] of Object.entries(dict)) {
      const fullKey = prefix ? `${prefix}.${k}` : k
      if (typeof v === 'string') {
        keys.push(fullKey)
      } else {
        collectKeys(v, fullKey)
      }
    }
  }

  if (namespace) {
    const dict = namespacedDictionaries[namespace]?.[loc]
    if (dict) collectKeys(dict, '')
  } else {
    for (const [ns, dicts] of Object.entries(namespacedDictionaries)) {
      const dict = dicts[loc]
      if (dict) {
        const prefix = ns === DEFAULT_NAMESPACE ? '' : ''
        collectKeys(dict, prefix)
      }
    }
  }

  return keys
}

// Missing translation tracker (v0.11.0)
let missingKeys: Set<string> = new Set()
let trackMissing = false

/**
 * Enable or disable missing translation tracking (v0.11.0)
 * When enabled, all missing translation keys encountered via t() are recorded.
 * @param enabled - Whether to enable tracking
 *
 * @example
 * trackMissingKeys(true)
 * t('nonexistent.key')
 * getMissingKeys()  // → ['nonexistent.key']
 */
export function trackMissingKeys(enabled: boolean): void {
  trackMissing = enabled
  if (!enabled) {
    missingKeys = new Set()
  }
}

/**
 * Get all missing translation keys encountered since tracking was enabled (v0.11.0)
 * @returns Array of missing keys
 */
export function getMissingKeys(): string[] {
  return Array.from(missingKeys)
}

/**
 * Clear the list of tracked missing keys (v0.11.0)
 */
export function clearMissingKeys(): void {
  missingKeys = new Set()
}

/**
 * Record a missing key (internal use)
 */
export function recordMissingKey(key: string): void {
  if (trackMissing) {
    missingKeys.add(key)
  }
}
