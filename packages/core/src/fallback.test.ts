import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  setLocale,
  t,
  loadDictionaries,
  clearDictionaries,
  resetConfig,
  configure,
  createScope,
} from './index'

describe('Fallback Value (v0.10.0)', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
    setLocale('en')
    loadDictionaries({
      en: {
        greeting: 'Hello',
        welcome: 'Welcome, {name}',
      },
    })
  })

  test('returns fallback when key is missing', () => {
    expect(t('nonexistent', { _fallback: 'Default text' })).toBe('Default text')
  })

  test('returns raw key when no fallback provided', () => {
    expect(t('nonexistent')).toBe('nonexistent')
  })

  test('ignores fallback when translation exists', () => {
    expect(t('greeting', { _fallback: 'Ignored' })).toBe('Hello')
  })

  test('fallback with other variables', () => {
    expect(t('nonexistent', { name: 'Bob', _fallback: 'Hi there' })).toBe('Hi there')
  })

  test('_fallback not interpolated into existing translation', () => {
    const result = t('welcome', { name: 'John', _fallback: 'Fallback' })
    expect(result).toBe('Welcome, John')
    expect(result).not.toContain('_fallback')
    expect(result).not.toContain('Fallback')
  })

  test('fallback with namespace', () => {
    loadDictionaries({ en: { title: 'Settings' } }, 'settings')
    expect(t('settings:missing', { _fallback: 'Default' })).toBe('Default')
    expect(t('settings:title', { _fallback: 'Default' })).toBe('Settings')
  })

  test('fallback with debug mode', () => {
    configure({ debugMode: true })
    const result = t('nonexistent', { _fallback: 'Default' })
    expect(result).toContain('Default')
    expect(result).toContain('MISSING')
  })

  test('warning still emitted with fallback', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    configure({ warnOnMissing: true })
    t('nonexistent', { _fallback: 'Default' })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  test('_context and _fallback combined', () => {
    loadDictionaries({
      en: {
        msg: 'Hello',
        'msg#formal': 'Good day',
      },
    })
    // context found → use context translation
    expect(t('msg', { _context: 'formal', _fallback: 'FB' })).toBe('Good day')
    // both miss → use fallback
    expect(t('missing', { _context: 'formal', _fallback: 'FB' })).toBe('FB')
  })

  test('empty string fallback', () => {
    expect(t('nonexistent', { _fallback: '' })).toBe('')
  })

  test('fallback with createScope', () => {
    loadDictionaries({ en: { title: 'Home' } }, 'nav')
    const tn = createScope('nav')
    expect(tn('missing', { _fallback: 'Not found' })).toBe('Not found')
    expect(tn('title', { _fallback: 'Not found' })).toBe('Home')
  })
})
