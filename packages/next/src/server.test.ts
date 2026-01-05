import { describe, it as test, expect, beforeEach } from 'vitest'
import {
  configureI18n,
  getI18nConfig,
  generateLocaleParams,
  getAlternates,
  createMetadata,
  getLocaleFromParams,
} from './server'

describe('configureI18n / getI18nConfig', () => {
  beforeEach(() => {
    // Reset to default config
    configureI18n({
      locales: ['ko', 'en'],
      defaultLocale: 'ko',
    })
  })

  test('should set and get config', () => {
    configureI18n({
      locales: ['en', 'ko', 'ja'],
      defaultLocale: 'en',
      baseUrl: 'https://example.com',
    })

    const config = getI18nConfig()
    expect(config.locales).toEqual(['en', 'ko', 'ja'])
    expect(config.defaultLocale).toBe('en')
    expect(config.baseUrl).toBe('https://example.com')
  })

  test('should merge with existing config', () => {
    configureI18n({
      locales: ['ko', 'en'],
      defaultLocale: 'ko',
    })

    configureI18n({
      locales: ['ko', 'en', 'ja'],
      defaultLocale: 'ko',
      baseUrl: 'https://test.com',
    })

    const config = getI18nConfig()
    expect(config.baseUrl).toBe('https://test.com')
  })
})

describe('generateLocaleParams', () => {
  beforeEach(() => {
    configureI18n({
      locales: ['ko', 'en', 'ja'],
      defaultLocale: 'ko',
    })
  })

  test('should generate params for all locales', () => {
    const params = generateLocaleParams()

    expect(params).toEqual([
      { locale: 'ko' },
      { locale: 'en' },
      { locale: 'ja' },
    ])
  })

  test('should work with different locale configs', () => {
    configureI18n({
      locales: ['en', 'fr', 'de', 'es'],
      defaultLocale: 'en',
    })

    const params = generateLocaleParams()

    expect(params).toHaveLength(4)
    expect(params[0]).toEqual({ locale: 'en' })
    expect(params[3]).toEqual({ locale: 'es' })
  })
})

describe('getLocaleFromParams', () => {
  beforeEach(() => {
    configureI18n({
      locales: ['ko', 'en', 'ja'],
      defaultLocale: 'ko',
    })
  })

  test('should return valid locale', () => {
    expect(getLocaleFromParams({ locale: 'ko' })).toBe('ko')
    expect(getLocaleFromParams({ locale: 'en' })).toBe('en')
    expect(getLocaleFromParams({ locale: 'ja' })).toBe('ja')
  })

  test('should throw for invalid locale', () => {
    expect(() => getLocaleFromParams({ locale: 'fr' })).toThrow(
      'Invalid locale: "fr". Supported: ko, en, ja'
    )
  })
})

describe('getAlternates', () => {
  beforeEach(() => {
    configureI18n({
      locales: ['ko', 'en', 'ja'],
      defaultLocale: 'ko',
      baseUrl: 'https://example.com',
    })
  })

  test('should generate alternate links', () => {
    const alternates = getAlternates('/about', 'en')

    expect(alternates.canonical).toBe('https://example.com/en/about')
    expect(alternates.languages).toEqual({
      ko: 'https://example.com/ko/about',
      en: 'https://example.com/en/about',
      ja: 'https://example.com/ja/about',
      'x-default': 'https://example.com/ko/about',
    })
  })

  test('should handle root path', () => {
    const alternates = getAlternates('/', 'ko')

    expect(alternates.canonical).toBe('https://example.com/ko/')
    expect(alternates.languages['en']).toBe('https://example.com/en/')
  })

  test('should handle path without leading slash', () => {
    const alternates = getAlternates('products', 'en')

    expect(alternates.canonical).toBe('https://example.com/en/products')
  })

  test('should work without baseUrl', () => {
    configureI18n({
      locales: ['ko', 'en'],
      defaultLocale: 'ko',
      baseUrl: undefined,
    })

    const alternates = getAlternates('/about', 'en')

    expect(alternates.canonical).toBe('/en/about')
    expect(alternates.languages['ko']).toBe('/ko/about')
  })
})

describe('createMetadata', () => {
  beforeEach(() => {
    configureI18n({
      locales: ['ko', 'en', 'ja'],
      defaultLocale: 'ko',
      baseUrl: 'https://example.com',
    })
  })

  test('should create metadata with title', () => {
    const metadata = createMetadata(
      {
        title: { ko: '홈', en: 'Home', ja: 'ホーム' },
      },
      'en'
    )

    expect(metadata.title).toBe('Home')
    expect(metadata.description).toBeUndefined()
  })

  test('should create metadata with description', () => {
    const metadata = createMetadata(
      {
        title: { ko: '홈', en: 'Home' },
        description: { ko: '환영합니다', en: 'Welcome' },
      },
      'en'
    )

    expect(metadata.title).toBe('Home')
    expect(metadata.description).toBe('Welcome')
  })

  test('should create metadata with keywords', () => {
    const metadata = createMetadata(
      {
        title: { ko: '홈', en: 'Home' },
        keywords: { ko: '홈, 메인', en: 'home, main' },
      },
      'en'
    )

    expect(metadata.keywords).toBe('home, main')
  })

  test('should fallback to default locale', () => {
    const metadata = createMetadata(
      {
        title: { ko: '홈', en: 'Home' },
        description: { ko: '환영합니다' },
      },
      'en'
    )

    expect(metadata.title).toBe('Home')
    // description only has ko, so fallback to ko (default)
    expect(metadata.description).toBe('환영합니다')
  })

  test('should include alternates when pathname provided', () => {
    const metadata = createMetadata(
      {
        title: { ko: '소개', en: 'About' },
      },
      'en',
      '/about'
    )

    expect(metadata.alternates).toBeDefined()
    expect(metadata.alternates?.canonical).toBe('https://example.com/en/about')
    expect(metadata.alternates?.languages['ko']).toBe('https://example.com/ko/about')
  })

  test('should not include alternates when pathname not provided', () => {
    const metadata = createMetadata(
      {
        title: { ko: '홈', en: 'Home' },
      },
      'en'
    )

    expect(metadata.alternates).toBeUndefined()
  })
})
