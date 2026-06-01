import { describe, it, expect, beforeEach } from 'vitest'
import { getTranslationCount, loadDictionaries, clearDictionaries, resetConfig, setLocale } from './index'

describe('getTranslationCount (v0.21.0)', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
    setLocale('en')
  })

  it('returns 0 when no dictionaries loaded', () => {
    expect(getTranslationCount('en')).toBe(0)
  })

  it('counts flat keys', () => {
    loadDictionaries({ en: { a: '1', b: '2', c: '3' } })
    expect(getTranslationCount('en')).toBe(3)
  })

  it('counts nested keys', () => {
    loadDictionaries({ en: { greeting: { hello: 'Hi', goodbye: 'Bye' }, welcome: 'Welcome' } })
    expect(getTranslationCount('en')).toBe(3)
  })

  it('counts per locale', () => {
    loadDictionaries({
      en: { a: '1', b: '2', c: '3' },
      ko: { a: '가' },
    })
    expect(getTranslationCount('en')).toBe(3)
    expect(getTranslationCount('ko')).toBe(1)
  })

  it('defaults to current locale', () => {
    loadDictionaries({ en: { a: '1', b: '2' } })
    setLocale('en')
    expect(getTranslationCount()).toBe(2)
  })

  it('scopes to namespace', () => {
    loadDictionaries({ en: { a: '1', b: '2' } }, 'ns1')
    loadDictionaries({ en: { x: '10' } }, 'ns2')
    expect(getTranslationCount('en', 'ns1')).toBe(2)
    expect(getTranslationCount('en', 'ns2')).toBe(1)
  })
})
