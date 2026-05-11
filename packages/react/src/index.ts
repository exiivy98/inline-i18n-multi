export { LocaleProvider } from './provider'
export { useLocale, useT, useScopedT, useLoadDictionaries, useDetectedLocale } from './hooks'
export { T } from './component'
export { RichText, useRichText } from './richtext'

// re-export from core for convenience
export {
  // inline translations
  it,
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
  getLocale,
  setLocale,
  // key-based translations (i18n compatible)
  t,
  tRaw,
  tBatch,
  interpolateTemplate,
  loadDictionaries,
  loadDictionary,
  clearDictionaries,
  hasTranslation,
  getMissingLocales,
  getCompletenessRatio,
  getLoadedLocales,
  getDictionary,
  loadAsync,
  isLoaded,
  // configuration
  configure,
  getConfig,
  resetConfig,
  // rich text parsing
  parseRichText,
  type RichTextSegment,
  // custom formatters (v0.6.0) + ICU cache (v0.7.0)
  registerFormatter,
  clearFormatters,
  clearICUCache,
  type CustomFormatter,
  // locale persistence (v0.7.0)
  restoreLocale,
  // translation scope (v0.8.0)
  createScope,
  // locale detection (v0.6.0)
  detectLocale,
  // locale change event (v0.12.0)
  onLocaleChange,
  clearLocaleListeners,
  // utils (v0.11.0)
  getLocaleDisplayName,
  getTranslationKeys,
  trackMissingKeys,
  getMissingKeys,
  clearMissingKeys,
  onMissingKey,
  clearMissingKeyListeners,
  // formatting utilities (v0.13.0)
  formatNumber,
  formatDate,
  formatList,
  type DetectLocaleOptions,
  type DetectSource,
  // types
  type Locale,
  type Translations,
  type TranslationVars,
  type Dictionary,
  type Dictionaries,
  type PluralRules,
} from 'inline-i18n-multi'
