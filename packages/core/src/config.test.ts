import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  configure,
  getConfig,
  resetConfig,
  getParentLocale,
  buildFallbackChain,
  emitWarning,
} from './config'

describe('config', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('getParentLocale', () => {
    test('extracts parent from zh-TW', () => {
      expect(getParentLocale('zh-TW')).toBe('zh')
    })

    test('extracts parent from en-US', () => {
      expect(getParentLocale('en-US')).toBe('en')
    })

    test('extracts parent from pt-BR', () => {
      expect(getParentLocale('pt-BR')).toBe('pt')
    })

    test('returns undefined for simple locale', () => {
      expect(getParentLocale('en')).toBeUndefined()
    })

    test('returns undefined for ko', () => {
      expect(getParentLocale('ko')).toBeUndefined()
    })

    test('handles locale with multiple parts', () => {
      expect(getParentLocale('zh-Hant-TW')).toBe('zh')
    })
  })

  describe('buildFallbackChain', () => {
    test('builds chain with auto parent locale', () => {
      const chain = buildFallbackChain('zh-TW')
      expect(chain).toEqual(['zh-TW', 'zh', 'en'])
    })

    test('builds chain for en-US', () => {
      const chain = buildFallbackChain('en-US')
      expect(chain).toEqual(['en-US', 'en'])
    })

    test('builds chain for simple locale', () => {
      const chain = buildFallbackChain('ko')
      expect(chain).toEqual(['ko', 'en'])
    })

    test('does not duplicate fallback locale', () => {
      const chain = buildFallbackChain('en')
      expect(chain).toEqual(['en'])
    })

    test('uses custom fallback chain when configured', () => {
      configure({
        fallbackChain: {
          'pt-BR': ['pt', 'es', 'en'],
        },
      })
      const chain = buildFallbackChain('pt-BR')
      expect(chain).toEqual(['pt-BR', 'pt', 'es', 'en'])
    })

    test('custom chain overrides auto parent', () => {
      configure({
        fallbackChain: {
          'zh-TW': ['zh-CN', 'zh', 'en'],
        },
      })
      const chain = buildFallbackChain('zh-TW')
      expect(chain).toEqual(['zh-TW', 'zh-CN', 'zh', 'en'])
    })

    test('respects custom fallback locale', () => {
      configure({
        fallbackLocale: 'ko',
      })
      const chain = buildFallbackChain('ja')
      expect(chain).toEqual(['ja', 'ko'])
    })

    test('disabling autoParentLocale', () => {
      configure({
        autoParentLocale: false,
      })
      const chain = buildFallbackChain('zh-TW')
      expect(chain).toEqual(['zh-TW', 'en'])
    })
  })

  describe('configure', () => {
    test('sets fallback locale', () => {
      configure({ fallbackLocale: 'ko' })
      expect(getConfig().fallbackLocale).toBe('ko')
    })

    test('sets warnOnMissing', () => {
      configure({ warnOnMissing: false })
      expect(getConfig().warnOnMissing).toBe(false)
    })

    test('preserves previous config values', () => {
      configure({ fallbackLocale: 'ko' })
      configure({ warnOnMissing: false })
      expect(getConfig().fallbackLocale).toBe('ko')
      expect(getConfig().warnOnMissing).toBe(false)
    })
  })

  describe('resetConfig', () => {
    test('resets to defaults', () => {
      configure({ fallbackLocale: 'ko', warnOnMissing: false })
      resetConfig()
      expect(getConfig().fallbackLocale).toBe('en')
    })
  })

  describe('emitWarning', () => {
    test('calls custom warning handler', () => {
      const handler = vi.fn()
      configure({
        warnOnMissing: true,
        onMissingTranslation: handler,
      })

      emitWarning({
        type: 'missing_translation',
        requestedLocale: 'fr',
        availableLocales: ['en', 'ko'],
      })

      expect(handler).toHaveBeenCalledWith({
        type: 'missing_translation',
        requestedLocale: 'fr',
        availableLocales: ['en', 'ko'],
      })
    })

    test('does not call handler when warnOnMissing is false', () => {
      const handler = vi.fn()
      configure({
        warnOnMissing: false,
        onMissingTranslation: handler,
      })

      emitWarning({
        type: 'missing_translation',
        requestedLocale: 'fr',
        availableLocales: ['en', 'ko'],
      })

      expect(handler).not.toHaveBeenCalled()
    })
  })
})
