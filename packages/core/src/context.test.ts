import { describe, test, expect, beforeEach } from 'vitest'
import {
  setLocale,
  t,
  loadDictionaries,
  clearDictionaries,
  hasTranslation,
  resetConfig,
  createScope,
} from './index'

describe('Context System (v0.9.0)', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
    setLocale('en')
  })

  test('basic context selection', () => {
    loadDictionaries({
      en: {
        greeting: 'Hello',
        'greeting#formal': 'Good day',
        'greeting#casual': 'Hey',
      },
    })
    expect(t('greeting', { _context: 'formal' })).toBe('Good day')
    expect(t('greeting', { _context: 'casual' })).toBe('Hey')
  })

  test('falls back to base key when context not found', () => {
    loadDictionaries({
      en: {
        greeting: 'Hello',
        'greeting#formal': 'Good day',
      },
    })
    expect(t('greeting', { _context: 'unknown' })).toBe('Hello')
  })

  test('returns base key when no context provided', () => {
    loadDictionaries({
      en: {
        greeting: 'Hello',
        'greeting#formal': 'Good day',
      },
    })
    expect(t('greeting')).toBe('Hello')
  })

  test('context with interpolation variables', () => {
    loadDictionaries({
      en: {
        welcome: 'Hi {name}',
        'welcome#formal': 'Good day, {name}',
      },
    })
    expect(t('welcome', { name: 'John', _context: 'formal' })).toBe('Good day, John')
    expect(t('welcome', { name: 'John' })).toBe('Hi John')
  })

  test('_context does not appear in output', () => {
    loadDictionaries({
      en: {
        msg: 'Hello {name}',
        'msg#formal': 'Dear {name}',
      },
    })
    const result = t('msg', { name: 'Bob', _context: 'formal' })
    expect(result).toBe('Dear Bob')
    expect(result).not.toContain('_context')
    expect(result).not.toContain('formal')  // context value not in output
  })

  test('context with plural', () => {
    loadDictionaries({
      en: {
        'items_one': '{count} item',
        'items_other': '{count} items',
        'items#compact_one': '{count} itm',
        'items#compact_other': '{count} itms',
      },
    })
    expect(t('items', { count: 1, _context: 'compact' })).toBe('1 itm')
    expect(t('items', { count: 5, _context: 'compact' })).toBe('5 itms')
    expect(t('items', { count: 1 })).toBe('1 item')
    expect(t('items', { count: 5 })).toBe('5 items')
  })

  test('context with multiple locales', () => {
    loadDictionaries({
      en: {
        greeting: 'Hello',
        'greeting#formal': 'Good day',
      },
      ko: {
        greeting: '안녕하세요',
        'greeting#formal': '안녕하십니까',
      },
    })
    setLocale('en')
    expect(t('greeting', { _context: 'formal' })).toBe('Good day')
    setLocale('ko')
    expect(t('greeting', { _context: 'formal' })).toBe('안녕하십니까')
  })

  test('context with namespace', () => {
    loadDictionaries({
      en: {
        title: 'Settings',
        'title#admin': 'Admin Settings',
      },
    }, 'settings')
    expect(t('settings:title', { _context: 'admin' })).toBe('Admin Settings')
    expect(t('settings:title')).toBe('Settings')
  })

  test('context with createScope', () => {
    loadDictionaries({
      en: {
        greeting: 'Hello',
        'greeting#formal': 'Good day',
      },
    }, 'common')
    const tc = createScope('common')
    expect(tc('greeting', { _context: 'formal' })).toBe('Good day')
    expect(tc('greeting')).toBe('Hello')
  })

  test('hasTranslation with context', () => {
    loadDictionaries({
      en: {
        greeting: 'Hello',
        'greeting#formal': 'Good day',
      },
    })
    expect(hasTranslation('greeting', undefined, 'formal')).toBe(true)
    expect(hasTranslation('greeting', undefined, 'casual')).toBe(false)
    expect(hasTranslation('greeting')).toBe(true)
  })

  test('context only with _context var (no other vars)', () => {
    loadDictionaries({
      en: {
        bye: 'Goodbye',
        'bye#formal': 'Farewell',
      },
    })
    expect(t('bye', { _context: 'formal' })).toBe('Farewell')
  })

  test('nested key with context', () => {
    loadDictionaries({
      en: {
        nav: {
          home: 'Home',
          'home#short': 'H',
        },
      },
    })
    expect(t('nav.home', { _context: 'short' })).toBe('H')
    expect(t('nav.home')).toBe('Home')
  })
})
