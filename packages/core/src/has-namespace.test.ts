import { describe, it, expect, beforeEach } from 'vitest'
import { hasNamespace, loadDictionaries, clearDictionaries, resetConfig } from './index'

describe('hasNamespace (v0.20.0)', () => {
  beforeEach(() => {
    resetConfig()
    clearDictionaries()
  })

  it('returns false for non-existent namespace', () => {
    expect(hasNamespace('unknown')).toBe(false)
  })

  it('returns true for loaded namespace', () => {
    loadDictionaries({ en: { hello: 'Hello' } }, 'common')
    expect(hasNamespace('common')).toBe(true)
  })

  it('returns true for default namespace', () => {
    loadDictionaries({ en: { hello: 'Hello' } })
    expect(hasNamespace('default')).toBe(true)
  })

  it('returns false after clearing namespace', () => {
    loadDictionaries({ en: { hello: 'Hello' } }, 'auth')
    expect(hasNamespace('auth')).toBe(true)
    clearDictionaries('auth')
    expect(hasNamespace('auth')).toBe(false)
  })

  it('handles multiple namespaces', () => {
    loadDictionaries({ en: { a: '1' } }, 'ns1')
    loadDictionaries({ en: { b: '2' } }, 'ns2')
    expect(hasNamespace('ns1')).toBe(true)
    expect(hasNamespace('ns2')).toBe(true)
    expect(hasNamespace('ns3')).toBe(false)
  })
})
