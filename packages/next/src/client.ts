// re-export everything from react package for client components
export {
  // React components & hooks
  LocaleProvider,
  useLocale,
  useT,
  T,
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
  loadDictionaries,
  loadDictionary,
  clearDictionaries,
  hasTranslation,
  getLoadedLocales,
  getDictionary,
  // rich text (v0.5.0)
  RichText,
  useRichText,
  // lazy loading (v0.5.0)
  loadAsync,
  isLoaded,
  useLoadDictionaries,
  // rich text parsing
  parseRichText,
  // custom formatters (v0.6.0) + ICU cache (v0.7.0)
  registerFormatter,
  clearFormatters,
  clearICUCache,
  type CustomFormatter,
  // locale persistence (v0.7.0)
  restoreLocale,
  // locale detection (v0.6.0)
  detectLocale,
  useDetectedLocale,
  type DetectLocaleOptions,
  type DetectSource,
  // types
  type Locale,
  type Translations,
  type TranslationVars,
  type Dictionary,
  type Dictionaries,
  type PluralRules,
  type RichTextSegment,
} from 'inline-i18n-multi-react'
