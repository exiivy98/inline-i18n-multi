/**
 * Locale code type (e.g., 'ko', 'en', 'ja', 'zh-TW')
 */
export type Locale = string

/**
 * Translation map with locale keys
 */
export type Translations = Record<Locale, string>

/**
 * Variables for interpolation
 * Supports string, number, Date values for ICU formatting
 * Supports string[] for list formatting
 */
export type TranslationVars = Record<string, string | number | Date | string[]>

/**
 * Extract variable names from template string
 * @example ExtractVars<'Hello {name}'> => 'name'
 */
export type ExtractVars<T extends string> =
  T extends `${string}{${infer Var}}${infer Rest}`
    ? Var | ExtractVars<Rest>
    : never

/**
 * Warning information for missing translations
 */
export interface TranslationWarning {
  type: 'missing_translation'
  /** Dictionary key (for t() function) */
  key?: string
  /** The locale that was requested */
  requestedLocale: string
  /** Available locales that have translations */
  availableLocales: string[]
  /** The locale that was used as fallback */
  fallbackUsed?: string
}

/**
 * Warning handler function type
 */
export type WarningHandler = (warning: TranslationWarning) => void

/**
 * Debug mode options for visual indicators
 */
export interface DebugModeOptions {
  /** Show visual prefix for missing translations (default: true) */
  showMissingPrefix?: boolean
  /** Show visual prefix for fallback translations (default: true) */
  showFallbackPrefix?: boolean
  /** Custom prefix format for missing translations */
  missingPrefixFormat?: (locale: string, key?: string) => string
  /** Custom prefix format for fallback translations */
  fallbackPrefixFormat?: (requestedLocale: string, usedLocale: string, key?: string) => string
}

/**
 * Configuration options
 */
export interface Config {
  /** Default locale to use when none is set */
  defaultLocale: Locale
  /** Fallback locale when translation is missing (default: 'en') */
  fallbackLocale?: Locale
  /** Enable automatic BCP 47 parent locale derivation (default: true) */
  autoParentLocale?: boolean
  /** Custom fallback chain for specific locales */
  fallbackChain?: Record<Locale, Locale[]>
  /** Enable warnings when translation is missing (default: true in dev mode) */
  warnOnMissing?: boolean
  /** Custom warning handler */
  onMissingTranslation?: WarningHandler
  /** Enable debug mode with visual indicators (default: false) */
  debugMode?: boolean | DebugModeOptions
  /** Async loader function for lazy loading dictionaries */
  loader?: (locale: Locale, namespace: string) => Promise<Record<string, unknown>>
  /** Custom handler for missing interpolation variables (v0.6.0) */
  missingVarHandler?: (varName: string, locale: string) => string
}
