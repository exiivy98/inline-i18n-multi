import { describe, it, expect, beforeEach } from 'vitest'
import {
  tBatch,
  loadDictionaries,
  clearDictionaries,
  setLocale,
  resetConfig,
} from './index'

beforeEach(() => {
  resetConfig()
  clearDictionaries()
  setLocale('en')
})

describe('tBatch (v0.15.0)', () => {
  it('translates multiple keys at once', () => {
    loadDictionaries({ en: { greeting: 'Hello', farewell: 'Goodbye' } })
    expect(tBatch(['greeting', 'farewell'])).toEqual({
      greeting: 'Hello',
      farewell: 'Goodbye',
    })
  })

  it('applies shared vars to all keys', () => {
    loadDictionaries({ en: { welcome: 'Hi {name}', bye: 'Bye {name}' } })
    expect(tBatch(['welcome', 'bye'], { name: 'John' })).toEqual({
      welcome: 'Hi John',
      bye: 'Bye John',
    })
  })

  it('respects explicit locale', () => {
    loadDictionaries({
      en: { greeting: 'Hello' },
      ko: { greeting: '안녕하세요' },
    })
    expect(tBatch(['greeting'], undefined, 'ko')).toEqual({
      greeting: '안녕하세요',
    })
  })

  it('returns raw key for missing translations', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    const result = tBatch(['greeting', 'missing'])
    expect(result.greeting).toBe('Hello')
    expect(result.missing).toBe('missing')
  })

  it('works with namespaced keys', () => {
    loadDictionaries({ en: { hello: 'Hello' } }, 'common')
    loadDictionaries({ en: { title: 'Settings' } }, 'settings')
    expect(tBatch(['common:hello', 'settings:title'])).toEqual({
      'common:hello': 'Hello',
      'settings:title': 'Settings',
    })
  })

  it('returns empty object for empty array', () => {
    expect(tBatch([])).toEqual({})
  })

  it('works with nested keys', () => {
    loadDictionaries({ en: { greeting: { hello: 'Hello', bye: 'Bye' } } })
    expect(tBatch(['greeting.hello', 'greeting.bye'])).toEqual({
      'greeting.hello': 'Hello',
      'greeting.bye': 'Bye',
    })
  })
})
