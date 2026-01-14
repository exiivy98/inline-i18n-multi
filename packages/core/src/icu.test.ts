import { describe, expect, test } from 'vitest'
import { interpolateICU, hasICUPattern } from './icu'

describe('ICU Message Format', () => {
  describe('hasICUPattern', () => {
    test('detects plural pattern', () => {
      expect(hasICUPattern('{count, plural, one {# item} other {# items}}')).toBe(true)
    })

    test('detects select pattern', () => {
      expect(hasICUPattern('{gender, select, male {He} female {She} other {They}}')).toBe(true)
    })

    test('detects selectordinal pattern', () => {
      expect(hasICUPattern('{rank, selectordinal, one {#st} two {#nd} other {#th}}')).toBe(true)
    })

    test('returns false for simple variables', () => {
      expect(hasICUPattern('Hello {name}')).toBe(false)
    })

    test('returns false for plain text', () => {
      expect(hasICUPattern('Hello world')).toBe(false)
    })
  })

  describe('plural', () => {
    test('exact match =0', () => {
      const result = interpolateICU(
        '{count, plural, =0 {No items} one {# item} other {# items}}',
        { count: 0 },
        'en'
      )
      expect(result).toBe('No items')
    })

    test('one category', () => {
      const result = interpolateICU(
        '{count, plural, =0 {No items} one {# item} other {# items}}',
        { count: 1 },
        'en'
      )
      expect(result).toBe('1 item')
    })

    test('other category', () => {
      const result = interpolateICU(
        '{count, plural, =0 {No items} one {# item} other {# items}}',
        { count: 5 },
        'en'
      )
      expect(result).toBe('5 items')
    })

    test('Korean plural (always other)', () => {
      const result = interpolateICU(
        '{count, plural, =0 {항목 없음} other {# 개}}',
        { count: 5 },
        'ko'
      )
      expect(result).toBe('5 개')
    })

    test('with offset', () => {
      const result = interpolateICU(
        '{count, plural, offset:1 =0 {Nobody} =1 {Just {name}} one {# other and {name}} other {# others and {name}}}',
        { count: 2, name: 'Alice' },
        'en'
      )
      expect(result).toBe('1 other and Alice')
    })

    test('combined with regular variables', () => {
      const result = interpolateICU(
        '{name} has {count, plural, one {# message} other {# messages}}',
        { name: 'John', count: 3 },
        'en'
      )
      expect(result).toBe('John has 3 messages')
    })
  })

  describe('select', () => {
    test('male selection', () => {
      const result = interpolateICU(
        '{gender, select, male {He} female {She} other {They}}',
        { gender: 'male' },
        'en'
      )
      expect(result).toBe('He')
    })

    test('female selection', () => {
      const result = interpolateICU(
        '{gender, select, male {He} female {She} other {They}}',
        { gender: 'female' },
        'en'
      )
      expect(result).toBe('She')
    })

    test('other fallback', () => {
      const result = interpolateICU(
        '{gender, select, male {He} female {She} other {They}}',
        { gender: 'unknown' },
        'en'
      )
      expect(result).toBe('They')
    })

    test('Korean select', () => {
      const result = interpolateICU(
        '{gender, select, male {그} female {그녀} other {그들}}',
        { gender: 'female' },
        'ko'
      )
      expect(result).toBe('그녀')
    })

    test('nested with text', () => {
      const result = interpolateICU(
        '{gender, select, male {{name} is a good boy} female {{name} is a good girl} other {{name} is great}}',
        { gender: 'male', name: 'Tom' },
        'en'
      )
      expect(result).toBe('Tom is a good boy')
    })
  })

  describe('complex patterns', () => {
    test('nested plural in select', () => {
      const result = interpolateICU(
        '{gender, select, male {He has {count, plural, one {# car} other {# cars}}} female {She has {count, plural, one {# car} other {# cars}}} other {They have {count, plural, one {# car} other {# cars}}}}',
        { gender: 'female', count: 2 },
        'en'
      )
      expect(result).toBe('She has 2 cars')
    })
  })

  describe('edge cases', () => {
    test('missing variable returns placeholder', () => {
      const result = interpolateICU(
        'Hello {name}',
        {},
        'en'
      )
      expect(result).toBe('Hello {name}')
    })

    test('missing plural count returns placeholder', () => {
      const result = interpolateICU(
        '{count, plural, one {# item} other {# items}}',
        {},
        'en'
      )
      expect(result).toBe('{count}')
    })
  })
})
