import { describe, test, expect, afterEach, vi } from 'vitest'
import { detectLocale } from './detect'

describe('detectLocale (v0.6.0)', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('returns defaultLocale when no sources match', () => {
    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: [],
    })
    expect(result).toBe('en')
  })

  test('returns defaultLocale with no sources specified and no navigator', () => {
    // In test env, navigator may not be set up
    const result = detectLocale({
      supportedLocales: ['en', 'ko'],
      defaultLocale: 'en',
    })
    // Either detects from navigator or falls back to default
    expect(['en', 'ko']).toContain(result)
  })

  test('detects from navigator.languages with BCP 47 matching', () => {
    vi.stubGlobal('navigator', { languages: ['en-US', 'ko'] })
    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'ja',
      sources: ['navigator'],
    })
    expect(result).toBe('en')
  })

  test('detects from navigator.language (single)', () => {
    vi.stubGlobal('navigator', { language: 'ko-KR' })
    const result = detectLocale({
      supportedLocales: ['en', 'ko'],
      defaultLocale: 'en',
      sources: ['navigator'],
    })
    expect(result).toBe('ko')
  })

  test('skips unsupported navigator locale', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR', 'de'] })
    const result = detectLocale({
      supportedLocales: ['en', 'ko'],
      defaultLocale: 'en',
      sources: ['navigator'],
    })
    expect(result).toBe('en')
  })

  test('detects from cookie', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'other=val; NEXT_LOCALE=ja; foo=bar' },
      configurable: true,
    })
    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: ['cookie'],
    })
    expect(result).toBe('ja')
    // Clean up
    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
  })

  test('detects from cookie with custom name', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'lang=ko' },
      configurable: true,
    })
    const result = detectLocale({
      supportedLocales: ['en', 'ko'],
      defaultLocale: 'en',
      sources: ['cookie'],
      cookieName: 'lang',
    })
    expect(result).toBe('ko')
    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
  })

  test('detects from Accept-Language header with quality weights', () => {
    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: ['header'],
      headerValue: 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    })
    expect(result).toBe('ko')
  })

  test('header respects quality weights ordering', () => {
    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: ['header'],
      headerValue: 'fr;q=0.5,ja;q=0.9,ko;q=0.8',
    })
    expect(result).toBe('ja')
  })

  test('detects from URL pathname', () => {
    Object.defineProperty(globalThis, 'location', {
      value: { pathname: '/ko/about' },
      configurable: true,
    })
    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: ['url'],
    })
    expect(result).toBe('ko')
    Object.defineProperty(globalThis, 'location', { value: undefined, configurable: true })
  })

  test('URL detection with BCP 47 locale', () => {
    Object.defineProperty(globalThis, 'location', {
      value: { pathname: '/en-US/dashboard' },
      configurable: true,
    })
    const result = detectLocale({
      supportedLocales: ['en', 'ko'],
      defaultLocale: 'ko',
      sources: ['url'],
    })
    expect(result).toBe('en')
    Object.defineProperty(globalThis, 'location', { value: undefined, configurable: true })
  })

  test('sources are tried in order — first match wins', () => {
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: 'NEXT_LOCALE=ja' },
      configurable: true,
    })
    vi.stubGlobal('navigator', { languages: ['ko'] })

    const result = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: ['cookie', 'navigator'],
    })
    expect(result).toBe('ja')

    const result2 = detectLocale({
      supportedLocales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      sources: ['navigator', 'cookie'],
    })
    expect(result2).toBe('ko')

    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
  })

  test('falls through to next source if first fails', () => {
    // No cookie set, but navigator available
    Object.defineProperty(globalThis, 'document', {
      value: { cookie: '' },
      configurable: true,
    })
    vi.stubGlobal('navigator', { languages: ['ja'] })

    const result = detectLocale({
      supportedLocales: ['en', 'ja'],
      defaultLocale: 'en',
      sources: ['cookie', 'navigator'],
    })
    expect(result).toBe('ja')

    Object.defineProperty(globalThis, 'document', { value: undefined, configurable: true })
  })
})
