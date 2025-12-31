import { it, type Translations, type TranslationVars } from 'inline-i18n-multi'

interface TPropsShorthand {
  /**
   * Korean text
   */
  ko: string
  /**
   * English text
   */
  en: string
  translations?: never
}

interface TPropsObject {
  ko?: never
  en?: never
  /**
   * Translation map with locale keys
   */
  translations: Translations
}

type TProps = (TPropsShorthand | TPropsObject) & TranslationVars

/**
 * Translation component for JSX
 * @example <T ko="안녕" en="Hello" />
 * @example <T translations={{ ko: '안녕', en: 'Hello', ja: 'こんにちは' }} />
 * @example <T ko="안녕 {name}" en="Hello {name}" name="철수" />
 */
export function T(props: TProps) {
  const { ko, en, translations, ...vars } = props

  if (translations) {
    return <>{it(translations, vars)}</>
  }

  if (ko !== undefined && en !== undefined) {
    return <>{it(ko, en, vars)}</>
  }

  throw new Error('T component requires either "translations" or both "ko" and "en" props')
}
