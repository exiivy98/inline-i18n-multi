import { describe, it, expect, beforeEach } from 'vitest'
import {
  tRaw,
  loadDictionaries,
  clearDictionaries,
  setLocale,
  resetConfig,
  configure,
} from './index'

beforeEach(() => {
  resetConfig()
  clearDictionaries()
  setLocale('en')
})

describe('tRaw (v0.14.0)', () => {
  it('returns raw template without interpolation', () => {
    loadDictionaries({ en: { welcome: 'Welcome, {name}!' } })
    expect(tRaw('welcome')).toBe('Welcome, {name}!')
  })

  it('returns undefined for missing key', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    expect(tRaw('missing.key')).toBeUndefined()
  })

  it('returns nested key template', () => {
    loadDictionaries({ en: { greeting: { hello: 'Hello, {name}' } } })
    expect(tRaw('greeting.hello')).toBe('Hello, {name}')
  })

  it('respects explicit locale', () => {
    loadDictionaries({
      en: { greeting: 'Hello' },
      ko: { greeting: '안녕하세요' },
    })
    expect(tRaw('greeting', 'ko')).toBe('안녕하세요')
  })

  it('uses current locale by default', () => {
    loadDictionaries({
      en: { greeting: 'Hello' },
      ko: { greeting: '안녕하세요' },
    })
    setLocale('ko')
    expect(tRaw('greeting')).toBe('안녕하세요')
  })

  it('falls back through locale chain', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    setLocale('fr')
    expect(tRaw('greeting')).toBe('Hello')
  })

  it('works with namespaced keys', () => {
    loadDictionaries({ en: { title: 'Settings' } }, 'settings')
    expect(tRaw('settings:title')).toBe('Settings')
  })

  it('returns plural variant keys directly', () => {
    loadDictionaries({
      en: { items_one: '{count} item', items_other: '{count} items' },
    })
    expect(tRaw('items_one')).toBe('{count} item')
    expect(tRaw('items_other')).toBe('{count} items')
  })

  it('preserves ICU syntax in template', () => {
    loadDictionaries({
      en: { msg: '{count, plural, one {# item} other {# items}}' },
    })
    expect(tRaw('msg')).toBe('{count, plural, one {# item} other {# items}}')
  })

  it('returns undefined for unknown namespace', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    expect(tRaw('unknown:greeting')).toBeUndefined()
  })
})
