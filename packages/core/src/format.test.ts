import { describe, it, expect, beforeEach } from 'vitest'
import { formatNumber, formatDate, formatList } from './format'
import { setLocale } from './context'

beforeEach(() => {
  setLocale('en')
})

describe('formatNumber', () => {
  it('formats with current locale', () => {
    expect(formatNumber(1234.5)).toBe('1,234.5')
  })

  it('formats with explicit locale', () => {
    expect(formatNumber(1234.5, undefined, 'de')).toBe('1.234,5')
  })

  it('formats currency', () => {
    const result = formatNumber(42.5, { style: 'currency', currency: 'USD' })
    expect(result).toBe('$42.50')
  })

  it('formats percent', () => {
    expect(formatNumber(0.85, { style: 'percent' })).toBe('85%')
  })

  it('respects current locale from setLocale', () => {
    setLocale('ja')
    expect(formatNumber(1234)).toBe('1,234')
  })

  it('explicit locale overrides current locale', () => {
    setLocale('en')
    expect(formatNumber(1234.5, undefined, 'de')).toBe('1.234,5')
  })
})

describe('formatDate', () => {
  const date = new Date('2026-03-30T12:00:00Z')

  it('formats with current locale', () => {
    const result = formatDate(date, { timeZone: 'UTC' })
    expect(result).toContain('2026')
  })

  it('formats with explicit locale', () => {
    const result = formatDate(date, { timeZone: 'UTC', month: 'long' }, 'ja')
    expect(result).toBe('3月')
  })

  it('formats with dateStyle', () => {
    const result = formatDate(date, { dateStyle: 'short', timeZone: 'UTC' })
    expect(result).toContain('3')
    expect(result).toContain('30')
  })

  it('accepts number timestamp', () => {
    const result = formatDate(date.getTime(), { timeZone: 'UTC' })
    expect(result).toContain('2026')
  })
})

describe('formatList', () => {
  it('formats conjunction list', () => {
    expect(formatList(['A', 'B', 'C'])).toBe('A, B, and C')
  })

  it('formats disjunction list', () => {
    expect(formatList(['A', 'B', 'C'], { type: 'disjunction' })).toBe('A, B, or C')
  })

  it('formats with explicit locale', () => {
    const result = formatList(['りんご', 'みかん'], {}, 'ja')
    expect(result).toContain('りんご')
    expect(result).toContain('みかん')
  })

  it('formats single item', () => {
    expect(formatList(['A'])).toBe('A')
  })

  it('formats two items', () => {
    expect(formatList(['A', 'B'])).toBe('A and B')
  })

  it('respects current locale', () => {
    setLocale('ja')
    const result = formatList(['A', 'B'])
    expect(result).toContain('A')
    expect(result).toContain('B')
  })
})
