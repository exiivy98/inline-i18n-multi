import type { Config, Locale, TranslationWarning, DebugModeOptions } from './types'

/**
 * Default warning handler - logs to console
 */
function defaultWarningHandler(warning: TranslationWarning): void {
  const parts = [`[inline-i18n] Missing translation for locale "${warning.requestedLocale}"`]

  if (warning.key) {
    parts.push(`key: "${warning.key}"`)
  }

  parts.push(`Available: [${warning.availableLocales.join(', ')}]`)

  if (warning.fallbackUsed) {
    parts.push(`Using fallback: "${warning.fallbackUsed}"`)
  }

  console.warn(parts.join(' | '))
}

/**
 * Check if we're in development mode
 */
function isDevMode(): boolean {
  try {
    // Check for Node.js environment
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      const proc = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process
      return proc?.env?.NODE_ENV !== 'production'
    }
    return false
  } catch {
    return false
  }
}

type FullConfig = Required<Omit<Config, 'loader'>> & Pick<Config, 'loader'>

const defaultConfig: FullConfig = {
  defaultLocale: 'en',
  fallbackLocale: 'en',
  autoParentLocale: true,
  fallbackChain: {},
  warnOnMissing: isDevMode(),
  onMissingTranslation: defaultWarningHandler,
  debugMode: false,
  loader: undefined,
}

let config: Config = { ...defaultConfig }

/**
 * Configure inline-i18n-multi settings
 *
 * @example
 * configure({
 *   fallbackLocale: 'en',
 *   fallbackChain: { 'pt-BR': ['pt', 'es', 'en'] },
 *   warnOnMissing: true,
 * })
 */
export function configure(options: Partial<Config>): void {
  config = { ...config, ...options }
}

/**
 * Get current configuration
 */
export function getConfig(): FullConfig {
  return {
    ...defaultConfig,
    ...config,
  }
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  config = { ...defaultConfig }
}

/**
 * Derive parent locale from BCP 47 tag
 *
 * @example
 * getParentLocale('zh-TW') // => 'zh'
 * getParentLocale('en-US') // => 'en'
 * getParentLocale('en')    // => undefined
 */
export function getParentLocale(locale: Locale): Locale | undefined {
  const dashIndex = locale.indexOf('-')
  if (dashIndex > 0) {
    return locale.substring(0, dashIndex)
  }
  return undefined
}

/**
 * Build fallback chain for a locale
 *
 * @example
 * // With autoParentLocale enabled (default)
 * buildFallbackChain('zh-TW') // => ['zh-TW', 'zh', 'en']
 * buildFallbackChain('en-US') // => ['en-US', 'en']
 *
 * // With custom fallback chain
 * configure({ fallbackChain: { 'pt-BR': ['pt', 'es', 'en'] } })
 * buildFallbackChain('pt-BR') // => ['pt-BR', 'pt', 'es', 'en']
 */
export function buildFallbackChain(locale: Locale): Locale[] {
  const cfg = getConfig()

  // Check for custom chain first
  if (cfg.fallbackChain[locale]) {
    return [locale, ...cfg.fallbackChain[locale]]
  }

  const chain: Locale[] = [locale]

  // Auto-derive parent locales if enabled
  if (cfg.autoParentLocale) {
    let current = locale
    while (true) {
      const parent = getParentLocale(current)
      if (parent && !chain.includes(parent)) {
        chain.push(parent)
        current = parent
      } else {
        break
      }
    }
  }

  // Add final fallback if not already in chain
  const finalFallback = cfg.fallbackLocale
  if (finalFallback && !chain.includes(finalFallback)) {
    chain.push(finalFallback)
  }

  return chain
}

/**
 * Emit a missing translation warning
 */
export function emitWarning(warning: TranslationWarning): void {
  const cfg = getConfig()
  if (cfg.warnOnMissing && cfg.onMissingTranslation) {
    cfg.onMissingTranslation(warning)
  }
}

// ============================================================================
// Debug Mode (v0.4.0)
// ============================================================================

/**
 * Debug information for translation output
 */
export interface DebugInfo {
  /** True if no translation was found */
  isMissing: boolean
  /** True if a fallback locale was used */
  isFallback: boolean
  /** The locale that was requested */
  requestedLocale: string
  /** The locale that was actually used */
  usedLocale?: string
  /** The translation key (for t() function) */
  key?: string
}

/**
 * Format translation output with debug information if enabled
 */
export function applyDebugFormat(output: string, debugInfo: DebugInfo): string {
  const cfg = getConfig()

  if (!cfg.debugMode) {
    return output
  }

  const options: DebugModeOptions =
    typeof cfg.debugMode === 'object'
      ? cfg.debugMode
      : { showMissingPrefix: true, showFallbackPrefix: true }

  // Handle missing translation
  if (debugInfo.isMissing && options.showMissingPrefix !== false) {
    const prefix = options.missingPrefixFormat
      ? options.missingPrefixFormat(debugInfo.requestedLocale, debugInfo.key)
      : `[MISSING: ${debugInfo.requestedLocale}] `
    return prefix + output
  }

  // Handle fallback translation
  if (debugInfo.isFallback && options.showFallbackPrefix !== false && debugInfo.usedLocale) {
    const prefix = options.fallbackPrefixFormat
      ? options.fallbackPrefixFormat(debugInfo.requestedLocale, debugInfo.usedLocale, debugInfo.key)
      : `[${debugInfo.requestedLocale} -> ${debugInfo.usedLocale}] `
    return prefix + output
  }

  return output
}
