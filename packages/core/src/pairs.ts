import type { Locale, Translations, TranslationVars } from './types'
import { it } from './translate'

type PairFunction = (
  text1: string,
  text2: string,
  vars?: TranslationVars,
) => string

function createPair(lang1: Locale, lang2: Locale): PairFunction {
  return (text1, text2, vars) => {
    const translations: Translations = {
      [lang1]: text1,
      [lang2]: text2,
    }
    return it(translations, vars)
  }
}

// Korean combinations
export const it_ja = createPair('ko', 'ja')
export const it_zh = createPair('ko', 'zh')
export const it_es = createPair('ko', 'es')
export const it_fr = createPair('ko', 'fr')
export const it_de = createPair('ko', 'de')

// English combinations
export const en_ja = createPair('en', 'ja')
export const en_zh = createPair('en', 'zh')
export const en_es = createPair('en', 'es')
export const en_fr = createPair('en', 'fr')
export const en_de = createPair('en', 'de')

// Other combinations
export const ja_zh = createPair('ja', 'zh')
export const ja_es = createPair('ja', 'es')
export const zh_es = createPair('zh', 'es')
