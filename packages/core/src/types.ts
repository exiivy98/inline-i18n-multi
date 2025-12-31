/**
 * Locale code type (e.g., 'ko', 'en', 'ja')
 */
export type Locale = string

/**
 * Translation map with locale keys
 */
export type Translations = Record<Locale, string>

/**
 * Variables for interpolation
 */
export type TranslationVars = Record<string, string | number>

/**
 * Extract variable names from template string
 * @example ExtractVars<'Hello {name}'> => 'name'
 */
export type ExtractVars<T extends string> =
  T extends `${string}{${infer Var}}${infer Rest}`
    ? Var | ExtractVars<Rest>
    : never

/**
 * Configuration options
 */
export interface Config {
  defaultLocale: Locale
  fallbackLocale?: Locale
}
