import { describe, it, expect, beforeEach } from 'vitest'
import { interpolateTemplate, setLocale, configure, resetConfig, registerFormatter, clearFormatters } from './index'

describe('interpolateTemplate', () => {
  beforeEach(() => {
    resetConfig()
    clearFormatters()
    setLocale('en')
  })

  it('returns plain text unchanged', () => {
    expect(interpolateTemplate('Hello World')).toBe('Hello World')
  })

  it('interpolates simple variables', () => {
    expect(interpolateTemplate('Hello {name}!', { name: 'Alice' })).toBe('Hello Alice!')
  })

  it('interpolates multiple variables', () => {
    expect(interpolateTemplate('{greeting}, {name}!', { greeting: 'Hi', name: 'Bob' })).toBe('Hi, Bob!')
  })

  it('handles missing variables gracefully', () => {
    expect(interpolateTemplate('Hello {name}!')).toBe('Hello {name}!')
  })

  it('uses the specified locale', () => {
    const result = interpolateTemplate('{count, number}', { count: 1234.5 }, 'de')
    expect(result).toContain('1.234')
  })

  it('uses current locale when not specified', () => {
    setLocale('ko')
    const result = interpolateTemplate('{count, number}', { count: 1234 })
    expect(result).toBe('1,234')
  })

  it('handles ICU plural format', () => {
    const template = '{count, plural, one {# item} other {# items}}'
    expect(interpolateTemplate(template, { count: 1 })).toBe('1 item')
    expect(interpolateTemplate(template, { count: 5 })).toBe('5 items')
  })

  it('handles ICU select format', () => {
    const template = '{gender, select, male {He} female {She} other {They}} left.'
    expect(interpolateTemplate(template, { gender: 'female' })).toBe('She left.')
  })

  it('handles plural shorthand', () => {
    expect(interpolateTemplate('{count, p, item|items}', { count: 1 })).toBe('1 item')
    expect(interpolateTemplate('{count, p, item|items}', { count: 3 })).toBe('3 items')
  })

  it('handles custom formatters', () => {
    registerFormatter('upper', (value) => String(value).toUpperCase())
    expect(interpolateTemplate('{name, upper}', { name: 'hello' })).toBe('HELLO')
  })

  it('strips _context and _fallback vars', () => {
    expect(interpolateTemplate('Hello {name}', { name: 'World', _context: 'formal', _fallback: 'fallback' })).toBe('Hello World')
  })
})
