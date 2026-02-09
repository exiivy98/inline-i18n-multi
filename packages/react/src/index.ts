export { LocaleProvider } from './provider'
export { useLocale, useT, useLoadDictionaries, useDetectedLocale } from './hooks'
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
  loadDictionaries,
  loadDictionary,
  clearDictionaries,
  hasTranslation,
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
  // custom formatters (v0.6.0)
  registerFormatter,
  clearFormatters,
  type CustomFormatter,
  // locale detection (v0.6.0)
  detectLocale,
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
