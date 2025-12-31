export { LocaleProvider } from './provider'
export { useLocale } from './hooks'
export { T } from './component'

// re-export from core for convenience
export {
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
  type Locale,
  type Translations,
  type TranslationVars,
} from 'inline-i18n-multi'
