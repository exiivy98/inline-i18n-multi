import { describe, it as test, expect, beforeEach, afterEach, vi } from 'vitest'
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
  getLoadedNamespaces,
  loadAsync,
  isLoaded,
  it_ja,
  en_zh,
  configure,
  resetConfig,
  registerFormatter,
  clearFormatters,
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

  test('should fallback to en if locale dictionary not loaded', () => {
    loadDictionaries({
      en: { hello: 'Hello' },
    })

    setLocale('fr') // fr dictionary not loaded, falls back to en
    expect(t('hello')).toBe('Hello')
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

describe('Fallback chain', () => {
  beforeEach(() => {
    clearDictionaries()
    resetConfig()
    setLocale('en')
  })

  describe('it() with BCP 47 fallback', () => {
    test('should fallback from zh-TW to zh', () => {
      setLocale('zh-TW')
      expect(it({ en: 'Hello', zh: '你好' })).toBe('你好')
    })

    test('should fallback from en-US to en', () => {
      setLocale('en-US')
      expect(it({ en: 'Hello', ko: '안녕하세요' })).toBe('Hello')
    })

    test('should use exact match if available', () => {
      setLocale('zh-TW')
      expect(it({ en: 'Hello', zh: '你好', 'zh-TW': '你好 (繁體)' })).toBe('你好 (繁體)')
    })
  })

  describe('t() with BCP 47 fallback', () => {
    test('should fallback from zh-TW to zh', () => {
      loadDictionaries({
        en: { hello: 'Hello' },
        zh: { hello: '你好' },
      })

      setLocale('zh-TW')
      expect(t('hello')).toBe('你好')
    })

    test('should use exact locale match first', () => {
      loadDictionaries({
        en: { hello: 'Hello' },
        zh: { hello: '你好' },
        'zh-TW': { hello: '你好 (繁體)' },
      })

      setLocale('zh-TW')
      expect(t('hello')).toBe('你好 (繁體)')
    })

    test('should fallback through chain to en', () => {
      loadDictionaries({
        en: { hello: 'Hello' },
        ko: { hello: '안녕하세요' },
      })

      setLocale('ja') // ja not loaded, should fallback to en
      expect(t('hello')).toBe('Hello')
    })
  })

  describe('configure()', () => {
    test('should allow custom fallback locale', () => {
      configure({ fallbackLocale: 'ko' })
      loadDictionaries({
        ko: { hello: '안녕하세요' },
      })

      setLocale('fr')
      expect(t('hello')).toBe('안녕하세요')
    })

    test('should allow custom fallback chain', () => {
      configure({
        fallbackChain: {
          'pt-BR': ['pt', 'es', 'en'],
        },
      })
      loadDictionaries({
        en: { hello: 'Hello' },
        es: { hello: 'Hola' },
      })

      setLocale('pt-BR')
      expect(t('hello')).toBe('Hola') // falls back to es
    })

    test('should disable autoParentLocale', () => {
      configure({ autoParentLocale: false })
      loadDictionaries({
        en: { hello: 'Hello' },
        zh: { hello: '你好' },
      })

      setLocale('zh-TW')
      // Without autoParentLocale, zh-TW won't fallback to zh
      // It will go directly to the fallbackLocale (en)
      expect(t('hello')).toBe('Hello')
    })
  })

  describe('warnings', () => {
    test('should call onMissingTranslation when fallback is used', () => {
      const handler = vi.fn()
      configure({
        warnOnMissing: true,
        onMissingTranslation: handler,
      })

      setLocale('fr')
      it({ en: 'Hello', ko: '안녕하세요' })

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'missing_translation',
          requestedLocale: 'fr',
          fallbackUsed: 'en',
        })
      )
    })

    test('should not warn when exact match is found', () => {
      const handler = vi.fn()
      configure({
        warnOnMissing: true,
        onMissingTranslation: handler,
      })

      setLocale('en')
      it({ en: 'Hello', ko: '안녕하세요' })

      expect(handler).not.toHaveBeenCalled()
    })
  })
})

describe('Namespace support (v0.4.0)', () => {
  beforeEach(() => {
    clearDictionaries()
    resetConfig()
    setLocale('en')
  })

  describe('loadDictionaries with namespace', () => {
    test('should load dictionaries with namespace', () => {
      loadDictionaries({
        en: { hello: 'Hello from common' },
      }, 'common')

      expect(t('common:hello')).toBe('Hello from common')
    })

    test('should load multiple namespaces', () => {
      loadDictionaries({ en: { title: 'Home' } }, 'home')
      loadDictionaries({ en: { title: 'Settings' } }, 'settings')

      expect(t('home:title')).toBe('Home')
      expect(t('settings:title')).toBe('Settings')
    })

    test('should use default namespace without prefix', () => {
      loadDictionaries({
        en: { greeting: 'Hello' },
      })

      expect(t('greeting')).toBe('Hello')
    })

    test('should support nested keys with namespace', () => {
      loadDictionaries({
        en: { buttons: { submit: 'Submit', cancel: 'Cancel' } },
      }, 'common')

      expect(t('common:buttons.submit')).toBe('Submit')
      expect(t('common:buttons.cancel')).toBe('Cancel')
    })
  })

  describe('loadDictionary with namespace', () => {
    test('should load single locale with namespace', () => {
      loadDictionary('en', { hello: 'Hello' }, 'common')
      loadDictionary('ko', { hello: '안녕하세요' }, 'common')

      setLocale('en')
      expect(t('common:hello')).toBe('Hello')

      setLocale('ko')
      expect(t('common:hello')).toBe('안녕하세요')
    })
  })

  describe('hasTranslation with namespace', () => {
    test('should check key in specific namespace', () => {
      loadDictionaries({ en: { hello: 'Hello' } }, 'common')

      expect(hasTranslation('common:hello')).toBe(true)
      expect(hasTranslation('common:missing')).toBe(false)
      expect(hasTranslation('other:hello')).toBe(false)
    })

    test('should check key in default namespace', () => {
      loadDictionaries({ en: { hello: 'Hello' } })

      expect(hasTranslation('hello')).toBe(true)
      expect(hasTranslation('missing')).toBe(false)
    })
  })

  describe('clearDictionaries with namespace', () => {
    test('should clear specific namespace', () => {
      loadDictionaries({ en: { a: 'A' } }, 'ns1')
      loadDictionaries({ en: { b: 'B' } }, 'ns2')

      clearDictionaries('ns1')

      expect(t('ns1:a')).toBe('ns1:a') // Returns key (not found)
      expect(t('ns2:b')).toBe('B')
    })

    test('should clear all namespaces when no arg', () => {
      loadDictionaries({ en: { a: 'A' } }, 'ns1')
      loadDictionaries({ en: { b: 'B' } }, 'ns2')

      clearDictionaries()

      expect(getLoadedNamespaces()).toHaveLength(0)
    })
  })

  describe('getLoadedLocales with namespace', () => {
    test('should return locales for specific namespace', () => {
      loadDictionaries({ en: { a: 'A' }, ko: { a: 'ㄱ' } }, 'ns1')
      loadDictionaries({ ja: { b: 'B' } }, 'ns2')

      expect(getLoadedLocales('ns1')).toEqual(['en', 'ko'])
      expect(getLoadedLocales('ns2')).toEqual(['ja'])
    })

    test('should return all unique locales without arg', () => {
      loadDictionaries({ en: { a: 'A' } }, 'ns1')
      loadDictionaries({ en: { b: 'B' }, ko: { b: 'ㄴ' } }, 'ns2')

      const locales = getLoadedLocales()
      expect(locales).toContain('en')
      expect(locales).toContain('ko')
    })
  })

  describe('getDictionary with namespace', () => {
    test('should get dictionary from specific namespace', () => {
      loadDictionaries({ en: { hello: 'Hello' } }, 'common')

      expect(getDictionary('en', 'common')).toEqual({ hello: 'Hello' })
      expect(getDictionary('en', 'other')).toBeUndefined()
    })

    test('should get dictionary from default namespace', () => {
      loadDictionaries({ en: { hello: 'Hello' } })

      expect(getDictionary('en')).toEqual({ hello: 'Hello' })
    })
  })

  describe('getLoadedNamespaces', () => {
    test('should return all loaded namespaces', () => {
      loadDictionaries({ en: {} }, 'common')
      loadDictionaries({ en: {} }, 'admin')
      loadDictionaries({ en: {} })

      const namespaces = getLoadedNamespaces()
      expect(namespaces).toContain('common')
      expect(namespaces).toContain('admin')
      expect(namespaces).toContain('default')
    })
  })

  describe('fallback within namespace', () => {
    test('should fallback to other locale within same namespace', () => {
      loadDictionaries({
        en: { greeting: 'Hello' },
        ko: { farewell: '안녕히 가세요' },
      }, 'common')

      setLocale('ko')
      expect(t('common:greeting')).toBe('Hello') // Falls back to en
    })
  })

  describe('missing translation in namespace', () => {
    test('should return full key when not found', () => {
      expect(t('common:missing.key')).toBe('common:missing.key')
    })
  })
})

describe('Debug mode (v0.4.0)', () => {
  beforeEach(() => {
    clearDictionaries()
    resetConfig()
    setLocale('en')
  })

  describe('it() with debug mode', () => {
    test('should show fallback prefix when debug mode is enabled', () => {
      configure({ debugMode: true, warnOnMissing: false })
      setLocale('fr')

      const result = it({ en: 'Hello', ko: '안녕하세요' })
      expect(result).toBe('[fr -> en] Hello')
    })

    test('should not show prefix when exact match found', () => {
      configure({ debugMode: true, warnOnMissing: false })
      setLocale('en')

      const result = it({ en: 'Hello', ko: '안녕하세요' })
      expect(result).toBe('Hello')
    })

    test('should not show prefix when debug mode is disabled', () => {
      configure({ debugMode: false, warnOnMissing: false })
      setLocale('fr')

      const result = it({ en: 'Hello' })
      expect(result).toBe('Hello')
    })

    test('should work with shorthand syntax', () => {
      configure({ debugMode: true, warnOnMissing: false })
      setLocale('fr')

      const result = it('안녕하세요', 'Hello')
      expect(result).toBe('[fr -> en] Hello')
    })
  })

  describe('t() with debug mode', () => {
    test('should show missing prefix for missing keys', () => {
      configure({ debugMode: true, warnOnMissing: false })
      loadDictionaries({ en: {} })

      const result = t('missing.key')
      expect(result).toBe('[MISSING: en] missing.key')
    })

    test('should show fallback prefix when using fallback', () => {
      configure({ debugMode: true, warnOnMissing: false })
      loadDictionaries({
        en: { hello: 'Hello' },
      })

      setLocale('fr')
      const result = t('hello')
      expect(result).toBe('[fr -> en] Hello')
    })

    test('should not show prefix when exact match found', () => {
      configure({ debugMode: true, warnOnMissing: false })
      loadDictionaries({
        en: { hello: 'Hello' },
      })

      setLocale('en')
      const result = t('hello')
      expect(result).toBe('Hello')
    })

    test('should work with namespaced keys', () => {
      configure({ debugMode: true, warnOnMissing: false })
      loadDictionaries({ en: { hello: 'Hello' } }, 'common')

      setLocale('fr')
      const result = t('common:hello')
      expect(result).toBe('[fr -> en] Hello')
    })
  })

  describe('custom debug options', () => {
    test('should respect showMissingPrefix: false', () => {
      configure({
        debugMode: { showMissingPrefix: false, showFallbackPrefix: true },
        warnOnMissing: false,
      })
      loadDictionaries({ en: {} })

      const result = t('missing.key')
      expect(result).toBe('missing.key')
    })

    test('should respect showFallbackPrefix: false', () => {
      configure({
        debugMode: { showMissingPrefix: true, showFallbackPrefix: false },
        warnOnMissing: false,
      })
      loadDictionaries({ en: { hello: 'Hello' } })

      setLocale('fr')
      const result = t('hello')
      expect(result).toBe('Hello')
    })

    test('should use custom missing prefix format', () => {
      configure({
        debugMode: {
          missingPrefixFormat: (locale, key) => `[!${locale}:${key}] `,
        },
        warnOnMissing: false,
      })
      loadDictionaries({ en: {} })

      const result = t('greeting')
      expect(result).toBe('[!en:greeting] greeting')
    })

    test('should use custom fallback prefix format', () => {
      configure({
        debugMode: {
          fallbackPrefixFormat: (from, to) => `[${from}=>${to}] `,
        },
        warnOnMissing: false,
      })
      loadDictionaries({ en: { hello: 'Hello' } })

      setLocale('ko')
      const result = t('hello')
      expect(result).toBe('[ko=>en] Hello')
    })
  })

  // ============================================================================
  // Lazy Loading (v0.5.0)
  // ============================================================================

  describe('Lazy loading (v0.5.0)', () => {
    test('loadAsync throws if no loader configured', async () => {
      await expect(loadAsync('en')).rejects.toThrow('No loader configured')
    })

    test('loadAsync calls loader with locale and namespace', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      await loadAsync('en', 'common')
      expect(loader).toHaveBeenCalledWith('en', 'common')
    })

    test('loadAsync loads into default namespace when namespace omitted', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      await loadAsync('en')
      expect(loader).toHaveBeenCalledWith('en', 'default')
      expect(t('hello')).toBe('Hello')
    })

    test('loadAsync deduplicates concurrent calls', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      const p1 = loadAsync('en', 'common')
      const p2 = loadAsync('en', 'common')
      await Promise.all([p1, p2])

      expect(loader).toHaveBeenCalledTimes(1)
    })

    test('isLoaded returns false before loading', () => {
      expect(isLoaded('en')).toBe(false)
      expect(isLoaded('en', 'common')).toBe(false)
    })

    test('isLoaded returns true after successful load', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      await loadAsync('en', 'common')
      expect(isLoaded('en', 'common')).toBe(true)
    })

    test('isLoaded returns false after error', async () => {
      const loader = vi.fn().mockRejectedValue(new Error('Network error'))
      configure({ loader })

      await expect(loadAsync('en', 'common')).rejects.toThrow('Network error')
      expect(isLoaded('en', 'common')).toBe(false)
    })

    test('loadAsync error is thrown to caller', async () => {
      const loader = vi.fn().mockRejectedValue(new Error('Failed to fetch'))
      configure({ loader })

      await expect(loadAsync('ko')).rejects.toThrow('Failed to fetch')
    })

    test('clearDictionaries resets loading state', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      await loadAsync('en', 'common')
      expect(isLoaded('en', 'common')).toBe(true)

      clearDictionaries()
      expect(isLoaded('en', 'common')).toBe(false)
    })

    test('clearDictionaries with namespace resets only that namespace loading state', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      await loadAsync('en', 'common')
      await loadAsync('en', 'settings')
      expect(isLoaded('en', 'common')).toBe(true)
      expect(isLoaded('en', 'settings')).toBe(true)

      clearDictionaries('common')
      expect(isLoaded('en', 'common')).toBe(false)
      expect(isLoaded('en', 'settings')).toBe(true)
    })

    test('t() works with lazily loaded dictionaries', async () => {
      const loader = vi.fn().mockResolvedValue({ greeting: 'Hello World' })
      configure({ loader })

      await loadAsync('en', 'app')
      expect(t('app:greeting')).toBe('Hello World')
    })

    test('skips loading if already loaded', async () => {
      const loader = vi.fn().mockResolvedValue({ hello: 'Hello' })
      configure({ loader })

      await loadAsync('en', 'common')
      await loadAsync('en', 'common')

      expect(loader).toHaveBeenCalledTimes(1)
    })
  })
})

// ============================================================================
// Interpolation Guards (v0.6.0)
// ============================================================================

describe('Interpolation Guards (v0.6.0)', () => {
  beforeEach(() => {
    resetConfig()
    setLocale('en')
    clearDictionaries()
  })

  test('default: missing var returns {name} placeholder', () => {
    const result = it({ en: 'Hello {name}' })
    expect(result).toBe('Hello {name}')
  })

  test('custom handler formats missing vars', () => {
    configure({
      missingVarHandler: (varName) => `[${varName}]`,
    })
    const result = it({ en: 'Hello {name}' })
    expect(result).toBe('Hello [name]')
  })

  test('handler receives locale', () => {
    const handler = vi.fn().mockReturnValue('??')
    configure({ missingVarHandler: handler })
    setLocale('ko')
    it({ ko: 'Hello {name}' })
    expect(handler).toHaveBeenCalledWith('name', 'ko')
  })

  test('handler works with partially provided vars', () => {
    configure({
      missingVarHandler: (varName) => `<${varName}>`,
    })
    const result = it({ en: 'Hello {name}, age {age}' }, { name: 'World' })
    expect(result).toBe('Hello World, age <age>')
  })

  test('handler works with t() dictionary lookup', () => {
    configure({
      missingVarHandler: (varName) => `[${varName}]`,
    })
    loadDictionaries({ en: { greeting: 'Hello {name}' } })
    const result = t('greeting')
    expect(result).toBe('Hello [name]')
  })

  test('handler works with ICU plural templates', () => {
    configure({
      missingVarHandler: (varName) => `[${varName}]`,
    })
    const result = it({ en: '{count, plural, one {# item} other {# items}}' })
    expect(result).toBe('[count]')
  })

  test('resetConfig restores default behavior', () => {
    configure({
      missingVarHandler: (varName) => `[${varName}]`,
    })
    resetConfig()
    const result = it({ en: 'Hello {name}' })
    expect(result).toBe('Hello {name}')
  })

  test('handler not called when vars are provided', () => {
    const handler = vi.fn().mockReturnValue('??')
    configure({ missingVarHandler: handler })
    const result = it({ en: 'Hello {name}' }, { name: 'World' })
    expect(result).toBe('Hello World')
    expect(handler).not.toHaveBeenCalled()
  })
})

// ============================================================================
// Custom Formatter Registry (v0.6.0)
// ============================================================================

describe('Custom Formatter Registry (v0.6.0)', () => {
  beforeEach(() => {
    resetConfig()
    setLocale('en')
    clearFormatters()
  })

  afterEach(() => {
    clearFormatters()
  })

  test('it() works with custom formatter', () => {
    registerFormatter('phone', (value) => {
      const s = String(value)
      return `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`
    })
    const result = it({ en: 'Call {num, phone}' }, { num: '2125551234' })
    expect(result).toBe('Call (212) 555-1234')
  })

  test('t() works with custom formatter', () => {
    registerFormatter('phone', (value) => {
      const s = String(value)
      return `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`
    })
    loadDictionaries({ en: { contact: 'Call {num, phone}' } })
    const result = t('contact', { num: '2125551234' })
    expect(result).toBe('Call (212) 555-1234')
    clearDictionaries()
  })
})
