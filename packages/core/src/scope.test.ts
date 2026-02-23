import { describe, it, expect, beforeEach } from 'vitest'
import { createScope } from './scope'
import { loadDictionaries, clearDictionaries } from './dictionary'
import { setLocale } from './context'
import { resetConfig } from './config'

describe('createScope', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
    setLocale('en')

    loadDictionaries({
      en: {
        greeting: 'Hello',
        nav: { home: 'Home', about: 'About' },
        welcome: 'Welcome, {name}!',
        items: { count_one: '{count} item', count_other: '{count} items' },
      },
      ko: {
        greeting: '안녕하세요',
        nav: { home: '홈', about: '소개' },
        welcome: '환영합니다, {name}님!',
        items: { count_other: '{count}개' },
      },
    }, 'common')

    loadDictionaries({
      en: { title: 'Settings', theme: 'Theme' },
      ko: { title: '설정', theme: '테마' },
    }, 'settings')
  })

  it('should return translated value for scoped key', () => {
    const tc = createScope('common')
    expect(tc('greeting')).toBe('Hello')
  })

  it('should resolve nested dot-notation keys', () => {
    const tc = createScope('common')
    expect(tc('nav.home')).toBe('Home')
    expect(tc('nav.about')).toBe('About')
  })

  it('should pass variables through', () => {
    const tc = createScope('common')
    expect(tc('welcome', { name: 'John' })).toBe('Welcome, John!')
  })

  it('should handle plural variables', () => {
    const tc = createScope('common')
    expect(tc('items.count', { count: 1 })).toBe('1 item')
    expect(tc('items.count', { count: 5 })).toBe('5 items')
  })

  it('should support locale override', () => {
    const tc = createScope('common')
    expect(tc('greeting', undefined, 'ko')).toBe('안녕하세요')
  })

  it('should use current locale', () => {
    setLocale('ko')
    const tc = createScope('common')
    expect(tc('greeting')).toBe('안녕하세요')
    expect(tc('welcome', { name: '유저' })).toBe('환영합니다, 유저님!')
  })

  it('should work with different namespaces', () => {
    const tc = createScope('settings')
    expect(tc('title')).toBe('Settings')
    expect(tc('theme')).toBe('Theme')
  })

  it('should return key for missing namespace', () => {
    const tc = createScope('nonexistent')
    expect(tc('greeting')).toBe('nonexistent:greeting')
  })

  it('should return key for missing key in existing namespace', () => {
    const tc = createScope('common')
    expect(tc('missing.key')).toBe('common:missing.key')
  })

  it('should allow multiple scopes independently', () => {
    const tc = createScope('common')
    const ts = createScope('settings')
    expect(tc('greeting')).toBe('Hello')
    expect(ts('title')).toBe('Settings')
  })
})
