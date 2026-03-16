import { describe, it, expect, beforeEach } from 'vitest'
import {
  t,
  loadDictionaries,
  clearDictionaries,
  setLocale,
  resetConfig,
  getLocaleDisplayName,
  getTranslationKeys,
  trackMissingKeys,
  getMissingKeys,
  clearMissingKeys,
} from './index'

describe('Locale Display Names (v0.11.0)', () => {
  it('should return display name in English', () => {
    expect(getLocaleDisplayName('ko', 'en')).toBe('Korean')
  })

  it('should return display name in native locale', () => {
    expect(getLocaleDisplayName('ko', 'ko')).toBe('한국어')
  })

  it('should return display name in another locale', () => {
    expect(getLocaleDisplayName('en', 'ja')).toBe('英語')
  })

  it('should handle BCP 47 codes', () => {
    const name = getLocaleDisplayName('zh-TW', 'en')
    expect(name).toContain('Chinese')
  })

  it('should use current locale as default displayLocale', () => {
    setLocale('en')
    expect(getLocaleDisplayName('ja')).toBe('Japanese')

    setLocale('ko')
    expect(getLocaleDisplayName('ja')).toBe('일본어')
  })

  it('should return locale code for invalid locale', () => {
    expect(getLocaleDisplayName('invalidlocale', 'en')).toBe('invalidlocale')
  })
})

describe('Translation Key Listing (v0.11.0)', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
    setLocale('en')
  })

  it('should return all keys for a locale', () => {
    loadDictionaries({
      en: { greeting: 'Hello', farewell: 'Goodbye' },
      ko: { greeting: '안녕하세요' },
    })

    const keys = getTranslationKeys('en')
    expect(keys).toContain('greeting')
    expect(keys).toContain('farewell')
    expect(keys).toHaveLength(2)
  })

  it('should return nested keys in dot notation', () => {
    loadDictionaries({
      en: {
        greeting: { hello: 'Hello', goodbye: 'Goodbye' },
        items: { count_one: '{count} item', count_other: '{count} items' },
      },
    })

    const keys = getTranslationKeys('en')
    expect(keys).toContain('greeting.hello')
    expect(keys).toContain('greeting.goodbye')
    expect(keys).toContain('items.count_one')
    expect(keys).toContain('items.count_other')
    expect(keys).toHaveLength(4)
  })

  it('should filter by namespace', () => {
    loadDictionaries({ en: { hello: 'Hello' } }, 'common')
    loadDictionaries({ en: { title: 'Settings' } }, 'settings')

    expect(getTranslationKeys('en', 'common')).toEqual(['hello'])
    expect(getTranslationKeys('en', 'settings')).toEqual(['title'])
  })

  it('should use current locale by default', () => {
    loadDictionaries({
      en: { a: '1', b: '2' },
      ko: { a: '가' },
    })

    setLocale('en')
    expect(getTranslationKeys()).toHaveLength(2)

    setLocale('ko')
    expect(getTranslationKeys()).toHaveLength(1)
  })

  it('should return empty array for unknown locale', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    expect(getTranslationKeys('fr')).toEqual([])
  })

  it('should return keys across all namespaces when no namespace specified', () => {
    loadDictionaries({ en: { a: '1' } }, 'ns1')
    loadDictionaries({ en: { b: '2' } }, 'ns2')

    const keys = getTranslationKeys('en')
    expect(keys).toContain('a')
    expect(keys).toContain('b')
  })
})

describe('Missing Translation Tracker (v0.11.0)', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
    setLocale('en')
    trackMissingKeys(false) // reset tracker
  })

  it('should not track by default', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    t('missing.key')
    expect(getMissingKeys()).toEqual([])
  })

  it('should track missing keys when enabled', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    trackMissingKeys(true)

    t('missing.key')
    t('another.missing')

    const missing = getMissingKeys()
    expect(missing).toContain('missing.key')
    expect(missing).toContain('another.missing')
    expect(missing).toHaveLength(2)
  })

  it('should not track existing keys', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    trackMissingKeys(true)

    t('greeting')
    expect(getMissingKeys()).toEqual([])
  })

  it('should deduplicate missing keys', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    trackMissingKeys(true)

    t('missing.key')
    t('missing.key')
    t('missing.key')

    expect(getMissingKeys()).toHaveLength(1)
  })

  it('should clear missing keys', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    trackMissingKeys(true)

    t('missing.key')
    expect(getMissingKeys()).toHaveLength(1)

    clearMissingKeys()
    expect(getMissingKeys()).toEqual([])
  })

  it('should reset when tracking is disabled', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    trackMissingKeys(true)

    t('missing.key')
    expect(getMissingKeys()).toHaveLength(1)

    trackMissingKeys(false)
    expect(getMissingKeys()).toEqual([])
  })

  it('should track namespaced missing keys', () => {
    loadDictionaries({ en: { title: 'Settings' } }, 'settings')
    trackMissingKeys(true)

    t('settings:missing')

    expect(getMissingKeys()).toContain('settings:missing')
  })

  it('should work with _fallback', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    trackMissingKeys(true)

    const result = t('missing.key', { _fallback: 'Default' })
    expect(result).toBe('Default')
    expect(getMissingKeys()).toContain('missing.key')
  })
})
