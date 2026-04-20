import { describe, it, expect, beforeEach } from 'vitest'
import {
  getMissingLocales,
  loadDictionaries,
  clearDictionaries,
  resetConfig,
  setLocale,
} from './index'

beforeEach(() => {
  resetConfig()
  clearDictionaries()
  setLocale('en')
})

describe('getMissingLocales (v0.16.0)', () => {
  it('returns locales missing the key', () => {
    loadDictionaries({
      en: { hello: 'Hi' },
      ko: { hello: '안녕' },
      ja: {},
    })
    expect(getMissingLocales('hello')).toEqual(['ja'])
  })

  it('returns empty array when key exists in all locales', () => {
    loadDictionaries({
      en: { hello: 'Hi' },
      ko: { hello: '안녕' },
    })
    expect(getMissingLocales('hello')).toEqual([])
  })

  it('returns all locales when key is missing in all', () => {
    loadDictionaries({
      en: { greeting: 'Hi' },
      ko: { greeting: '안녕' },
    })
    expect(getMissingLocales('nonexistent').sort()).toEqual(['en', 'ko'])
  })

  it('returns empty array when no locales are loaded', () => {
    expect(getMissingLocales('hello')).toEqual([])
  })

  it('works with nested keys', () => {
    loadDictionaries({
      en: { greeting: { hello: 'Hi', bye: 'Bye' } },
      ko: { greeting: { hello: '안녕' } },
    })
    expect(getMissingLocales('greeting.bye')).toEqual(['ko'])
  })

  it('works with namespaced keys', () => {
    loadDictionaries({ en: { hello: 'Hi' }, ko: {} }, 'common')
    loadDictionaries({ en: { title: 'Settings' } }, 'settings')

    expect(getMissingLocales('common:hello')).toEqual(['ko'])
    expect(getMissingLocales('settings:title')).toEqual([])
  })

  it('returns all loaded locales when namespace has no matching key', () => {
    loadDictionaries({ en: { a: '1' }, ko: { a: '가' } }, 'ns1')
    expect(getMissingLocales('ns1:nonexistent').sort()).toEqual(['en', 'ko'])
  })

  it('returns empty array for unknown namespace', () => {
    loadDictionaries({ en: { hello: 'Hi' } })
    expect(getMissingLocales('unknown:hello')).toEqual([])
  })
})
