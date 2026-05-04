import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  onMissingKey,
  clearMissingKeyListeners,
  t,
  loadDictionaries,
  clearDictionaries,
  resetConfig,
  setLocale,
} from './index'

beforeEach(() => {
  resetConfig()
  clearDictionaries()
  clearMissingKeyListeners()
  setLocale('en')
})

describe('onMissingKey (v0.18.0)', () => {
  it('fires callback for each missing key', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    const cb = vi.fn()
    onMissingKey(cb)

    t('missing.one')
    t('missing.two')

    expect(cb).toHaveBeenCalledTimes(2)
    expect(cb).toHaveBeenNthCalledWith(1, 'missing.one', 'en')
    expect(cb).toHaveBeenNthCalledWith(2, 'missing.two', 'en')
  })

  it('does not fire for existing keys', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    const cb = vi.fn()
    onMissingKey(cb)

    t('greeting')

    expect(cb).not.toHaveBeenCalled()
  })

  it('passes the requested locale to callback', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    const cb = vi.fn()
    onMissingKey(cb)

    t('missing', undefined, 'fr')

    expect(cb).toHaveBeenCalledWith('missing', 'fr')
  })

  it('returns unsubscribe function', () => {
    loadDictionaries({ en: { greeting: 'Hello' } })
    const cb = vi.fn()
    const off = onMissingKey(cb)

    t('missing.one')
    off()
    t('missing.two')

    expect(cb).toHaveBeenCalledTimes(1)
    expect(cb).toHaveBeenCalledWith('missing.one', 'en')
  })

  it('supports multiple listeners', () => {
    loadDictionaries({ en: {} })
    const cb1 = vi.fn()
    const cb2 = vi.fn()
    onMissingKey(cb1)
    onMissingKey(cb2)

    t('missing')

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(1)
  })

  it('fires for repeated missing keys (no dedup)', () => {
    loadDictionaries({ en: {} })
    const cb = vi.fn()
    onMissingKey(cb)

    t('missing')
    t('missing')
    t('missing')

    expect(cb).toHaveBeenCalledTimes(3)
  })

  it('clearMissingKeyListeners removes all listeners', () => {
    loadDictionaries({ en: {} })
    const cb = vi.fn()
    onMissingKey(cb)
    clearMissingKeyListeners()

    t('missing')

    expect(cb).not.toHaveBeenCalled()
  })

  it('fires with namespaced key as-is', () => {
    loadDictionaries({ en: { hello: 'Hi' } }, 'common')
    const cb = vi.fn()
    onMissingKey(cb)

    t('common:nonexistent')

    expect(cb).toHaveBeenCalledWith('common:nonexistent', 'en')
  })
})
