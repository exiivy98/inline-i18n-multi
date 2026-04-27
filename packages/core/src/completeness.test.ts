import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCompletenessRatio,
  loadDictionaries,
  clearDictionaries,
  resetConfig,
  configure,
  setLocale,
} from './index'

beforeEach(() => {
  resetConfig()
  clearDictionaries()
  setLocale('en')
})

describe('getCompletenessRatio (v0.17.0)', () => {
  it('returns 1 for the base locale itself', () => {
    loadDictionaries({ en: { a: '1', b: '2' } })
    expect(getCompletenessRatio('en')).toBe(1)
  })

  it('returns ratio of matched keys vs base', () => {
    loadDictionaries({
      en: { a: '1', b: '2', c: '3' },
      ko: { a: '가' },
    })
    expect(getCompletenessRatio('ko')).toBeCloseTo(1 / 3, 5)
  })

  it('returns 1 when target has all base keys', () => {
    loadDictionaries({
      en: { a: '1', b: '2' },
      ko: { a: '가', b: '나' },
    })
    expect(getCompletenessRatio('ko')).toBe(1)
  })

  it('returns 0 when target has no matching keys', () => {
    loadDictionaries({
      en: { a: '1' },
      ko: { x: '엑스' },
    })
    expect(getCompletenessRatio('ko')).toBe(0)
  })

  it('returns 1 when base locale has no keys', () => {
    loadDictionaries({ en: {}, ko: { a: '가' } })
    expect(getCompletenessRatio('ko')).toBe(1)
  })

  it('respects custom base locale', () => {
    loadDictionaries({
      ko: { a: '가', b: '나' },
      ja: { a: 'あ' },
    })
    expect(getCompletenessRatio('ja', 'ko')).toBe(0.5)
  })

  it('uses configured defaultLocale when baseLocale omitted', () => {
    configure({ defaultLocale: 'ko' })
    loadDictionaries({
      ko: { a: '가', b: '나' },
      en: { a: 'A' },
    })
    expect(getCompletenessRatio('en')).toBe(0.5)
  })

  it('handles nested keys', () => {
    loadDictionaries({
      en: { greeting: { hello: 'Hi', bye: 'Bye' }, welcome: 'Welcome' },
      ko: { greeting: { hello: '안녕' } },
    })
    expect(getCompletenessRatio('ko')).toBeCloseTo(1 / 3, 5)
  })

  it('scopes by namespace when provided', () => {
    loadDictionaries({ en: { a: '1', b: '2' } }, 'common')
    loadDictionaries({ ko: { a: '가' } }, 'common')
    loadDictionaries({ en: { x: '1' } }, 'other')

    expect(getCompletenessRatio('ko', 'en', 'common')).toBe(0.5)
  })

  it('returns 1 when target locale is missing entirely (no base keys in namespace)', () => {
    loadDictionaries({ en: {} })
    expect(getCompletenessRatio('ko')).toBe(1)
  })
})
