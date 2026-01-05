import { describe, it as test, expect, beforeEach } from 'vitest'
import {
  it,
  setLocale,
  getLocale,
  t,
  loadDictionaries,
  loadDictionary,
  clearDictionaries,
  hasTranslation,
  getLoadedLocales,
  getDictionary,
  it_ja,
  en_zh,
} from './index'

describe('setLocale / getLocale', () => {
  beforeEach(() => {
    setLocale('en')
  })

  test('should set and get locale', () => {
    setLocale('ko')
    expect(getLocale()).toBe('ko')

    setLocale('ja')
    expect(getLocale()).toBe('ja')
  })

  test('should default to en', () => {
    expect(getLocale()).toBe('en')
  })
})

describe('it() - inline translation', () => {
  beforeEach(() => {
    setLocale('en')
  })

  describe('shorthand syntax (ko, en)', () => {
    test('should return English when locale is en', () => {
      setLocale('en')
      expect(it('안녕하세요', 'Hello')).toBe('Hello')
    })

    test('should return Korean when locale is ko', () => {
      setLocale('ko')
      expect(it('안녕하세요', 'Hello')).toBe('안녕하세요')
    })

    test('should fallback to English for unsupported locale', () => {
      setLocale('fr')
      expect(it('안녕하세요', 'Hello')).toBe('Hello')
    })

    test('should interpolate variables', () => {
      setLocale('en')
      expect(it('안녕, {name}님', 'Hello, {name}', { name: 'John' })).toBe('Hello, John')
    })

    test('should handle multiple variables', () => {
      setLocale('ko')
      expect(it('{count}개의 {item}', '{count} {item}', { count: 5, item: '사과' })).toBe('5개의 사과')
    })
  })

  describe('object syntax', () => {
    test('should return correct translation for locale', () => {
      setLocale('ja')
      expect(it({ ko: '안녕하세요', en: 'Hello', ja: 'こんにちは' })).toBe('こんにちは')
    })

    test('should fallback to en if locale not found', () => {
      setLocale('fr')
      expect(it({ ko: '안녕하세요', en: 'Hello', ja: 'こんにちは' })).toBe('Hello')
    })

    test('should fallback to first available if en not found', () => {
      setLocale('fr')
      expect(it({ ko: '안녕하세요', ja: 'こんにちは' })).toBe('안녕하세요')
    })

    test('should interpolate variables', () => {
      setLocale('en')
      expect(it({ ko: '환영합니다, {name}님', en: 'Welcome, {name}' }, { name: 'Alice' })).toBe('Welcome, Alice')
    })
  })
})

describe('Language pair helpers', () => {
  beforeEach(() => {
    setLocale('en')
  })

  test('it_ja should work for ko-ja pair', () => {
    setLocale('ko')
    expect(it_ja('안녕하세요', 'こんにちは')).toBe('안녕하세요')

    setLocale('ja')
    expect(it_ja('안녕하세요', 'こんにちは')).toBe('こんにちは')
  })

  test('en_zh should work for en-zh pair', () => {
    setLocale('en')
    expect(en_zh('Hello', '你好')).toBe('Hello')

    setLocale('zh')
    expect(en_zh('Hello', '你好')).toBe('你好')
  })
})

describe('Dictionary-based translation (t)', () => {
  beforeEach(() => {
    clearDictionaries()
    setLocale('en')
  })

  test('should load and use dictionaries', () => {
    loadDictionaries({
      en: { greeting: { hello: 'Hello', goodbye: 'Goodbye' } },
      ko: { greeting: { hello: '안녕하세요', goodbye: '안녕히 가세요' } },
    })

    setLocale('en')
    expect(t('greeting.hello')).toBe('Hello')

    setLocale('ko')
    expect(t('greeting.hello')).toBe('안녕하세요')
  })

  test('should load single dictionary', () => {
    loadDictionary('ja', { greeting: 'こんにちは' })

    setLocale('ja')
    expect(t('greeting')).toBe('こんにちは')
  })

  test('should interpolate variables', () => {
    loadDictionaries({
      en: { welcome: 'Welcome, {name}!' },
    })

    expect(t('welcome', { name: 'John' })).toBe('Welcome, John!')
  })

  test('should handle plurals with Intl.PluralRules', () => {
    loadDictionaries({
      en: {
        items: {
          count_one: '{count} item',
          count_other: '{count} items',
        },
      },
    })

    expect(t('items.count', { count: 1 })).toBe('1 item')
    expect(t('items.count', { count: 5 })).toBe('5 items')
    expect(t('items.count', { count: 0 })).toBe('0 items')
  })

  test('should override locale', () => {
    loadDictionaries({
      en: { hello: 'Hello' },
      ko: { hello: '안녕하세요' },
    })

    setLocale('en')
    expect(t('hello', undefined, 'ko')).toBe('안녕하세요')
  })

  test('should fallback to English if key missing in current locale', () => {
    loadDictionaries({
      en: { hello: 'Hello', goodbye: 'Goodbye' },
      ko: { hello: '안녕하세요' }, // goodbye missing in ko
    })

    setLocale('ko')
    expect(t('goodbye')).toBe('Goodbye') // fallback to en
  })

  test('should return key if locale dictionary not loaded', () => {
    loadDictionaries({
      en: { hello: 'Hello' },
    })

    setLocale('fr') // fr dictionary not loaded
    expect(t('hello')).toBe('hello') // returns key
  })

  test('should return key if translation not found', () => {
    loadDictionaries({ en: {} })
    expect(t('missing.key')).toBe('missing.key')
  })
})

describe('Dictionary utilities', () => {
  beforeEach(() => {
    clearDictionaries()
  })

  test('hasTranslation should check if key exists', () => {
    loadDictionaries({
      en: { greeting: { hello: 'Hello' } },
    })

    setLocale('en')
    expect(hasTranslation('greeting.hello')).toBe(true)
    expect(hasTranslation('greeting.goodbye')).toBe(false)
    expect(hasTranslation('missing')).toBe(false)
  })

  test('hasTranslation should check specific locale', () => {
    loadDictionaries({
      en: { hello: 'Hello' },
      ko: { hello: '안녕하세요' },
    })

    expect(hasTranslation('hello', 'en')).toBe(true)
    expect(hasTranslation('hello', 'ko')).toBe(true)
    expect(hasTranslation('hello', 'ja')).toBe(false)
  })

  test('getLoadedLocales should return loaded locales', () => {
    loadDictionaries({
      en: { hello: 'Hello' },
      ko: { hello: '안녕하세요' },
      ja: { hello: 'こんにちは' },
    })

    const locales = getLoadedLocales()
    expect(locales).toContain('en')
    expect(locales).toContain('ko')
    expect(locales).toContain('ja')
    expect(locales).toHaveLength(3)
  })

  test('getDictionary should return dictionary for locale', () => {
    loadDictionaries({
      en: { greeting: 'Hello' },
    })

    expect(getDictionary('en')).toEqual({ greeting: 'Hello' })
    expect(getDictionary('fr')).toBeUndefined()
  })

  test('clearDictionaries should remove all dictionaries', () => {
    loadDictionaries({
      en: { hello: 'Hello' },
      ko: { hello: '안녕하세요' },
    })

    expect(getLoadedLocales()).toHaveLength(2)

    clearDictionaries()

    expect(getLoadedLocales()).toHaveLength(0)
    expect(getDictionary('en')).toBeUndefined()
  })
})
