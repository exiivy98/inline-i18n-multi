import { describe, it, expect, beforeEach } from 'vitest'
import { getFallbackLocale, configure, resetConfig } from './index'

describe('getFallbackLocale (v0.23.0)', () => {
  beforeEach(() => {
    resetConfig()
  })

  it('returns "en" by default', () => {
    expect(getFallbackLocale()).toBe('en')
  })

  it('returns configured fallback locale', () => {
    configure({ fallbackLocale: 'ko' })
    expect(getFallbackLocale()).toBe('ko')
  })

  it('returns "en" after reset', () => {
    configure({ fallbackLocale: 'ja' })
    expect(getFallbackLocale()).toBe('ja')
    resetConfig()
    expect(getFallbackLocale()).toBe('en')
  })
})
