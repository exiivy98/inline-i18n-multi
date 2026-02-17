// Inline translations
export { it } from './translate'
export { setLocale, getLocale, restoreLocale } from './context'
/** @deprecated Will be removed in v1.0.0 */
export { __i18n_lookup } from './runtime'
export {
  it_ja,
  it_zh,
  it_es,
  it_fr,
  it_de,
  en_ja,
  en_zh,
  en_es,
  en_fr,
  en_de,
  ja_zh,
  ja_es,
  zh_es,
} from './pairs'

// Key-based translations (i18n compatible)
export {
  t,
  loadDictionaries,
  loadDictionary,
  clearDictionaries,
  hasTranslation,
  getLoadedLocales,
  getDictionary,
  getLoadedNamespaces,
  loadAsync,
  isLoaded,
} from './dictionary'

// Configuration
export { configure, getConfig, resetConfig } from './config'

// Custom formatters (v0.6.0) + ICU cache (v0.7.0)
export { registerFormatter, clearFormatters, clearICUCache, type CustomFormatter } from './icu'

// Locale detection (v0.6.0)
export { detectLocale, type DetectLocaleOptions, type DetectSource } from './detect'

// Rich text parsing
export { parseRichText, type RichTextSegment } from './richtext'

export type {
  Locale,
  Translations,
  TranslationVars,
  Config,
  TranslationWarning,
  WarningHandler,
  DebugModeOptions,
} from './types'

export type {
  Dictionary,
  Dictionaries,
  PluralRules,
} from './dictionary'
