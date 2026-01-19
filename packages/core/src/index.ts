// Inline translations
export { it } from './translate'
export { setLocale, getLocale } from './context'
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
} from './dictionary'

// Configuration
export { configure, getConfig, resetConfig } from './config'

export type {
  Locale,
  Translations,
  TranslationVars,
  Config,
  TranslationWarning,
  WarningHandler,
} from './types'

export type {
  Dictionary,
  Dictionaries,
  PluralRules,
} from './dictionary'
