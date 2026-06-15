import { describe, it, expect, beforeEach } from 'vitest'
import { getDefaultLocale, configure, resetConfig } from './index'

describe('getDefaultLocale (v0.22.0)', () => {
  beforeEach(() => {
    resetConfig()
  })

  it('returns "en" by default', () => {
    expect(getDefaultLocale()).toBe('en')
  })

  it('returns configured default locale', () => {
    configure({ defaultLocale: 'ko' })
    expect(getDefaultLocale()).toBe('ko')
  })

  it('returns "en" after reset', () => {
    configure({ defaultLocale: 'ja' })
    expect(getDefaultLocale()).toBe('ja')
    resetConfig()
    expect(getDefaultLocale()).toBe('en')
  })
})
