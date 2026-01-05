// main entry - re-export commonly used items
export {
  LocaleProvider,
  useLocale,
  useT,
  T,
  // key-based translations (i18n compatible)
  t,
  loadDictionaries,
  loadDictionary,
  clearDictionaries,
  hasTranslation,
  getLoadedLocales,
} from 'inline-i18n-multi-react'
export { createI18nMiddleware, type I18nMiddlewareConfig } from './middleware'

export type {
  Locale,
  Translations,
  TranslationVars,
  Dictionary,
  Dictionaries,
  PluralRules,
} from 'inline-i18n-multi'
