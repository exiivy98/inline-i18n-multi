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

  describe('number formatting', () => {
    test('formats basic number', () => {
      const result = interpolateICU(
        'Price: {price, number}',
        { price: 1234.56 },
        'en-US'
      )
      expect(result).toBe('Price: 1,234.56')
    })

    test('formats number with decimal style', () => {
      const result = interpolateICU(
        'Value: {num, number, decimal}',
        { num: 1234.5 },
        'en-US'
      )
      expect(result).toBe('Value: 1,234.5')
    })

    test('formats percent', () => {
      const result = interpolateICU(
        'Discount: {rate, number, percent}',
        { rate: 0.25 },
        'en-US'
      )
      expect(result).toBe('Discount: 25%')
    })

    test('formats integer (no decimals)', () => {
      const result = interpolateICU(
        'Count: {num, number, integer}',
        { num: 42.7 },
        'en-US'
      )
      expect(result).toBe('Count: 43')
    })

    test('formats currency', () => {
      const result = interpolateICU(
        'Total: {amount, number, currency}',
        { amount: 99.99 },
        'en-US'
      )
      expect(result).toContain('99.99')
    })

    test('formats number for German locale', () => {
      const result = interpolateICU(
        'Preis: {price, number}',
        { price: 1234.56 },
        'de-DE'
      )
      // German uses . as thousands separator and , as decimal
      expect(result).toContain('1.234,56')
    })

    test('missing number value returns placeholder', () => {
      const result = interpolateICU(
        'Price: {price, number}',
        {},
        'en-US'
      )
      expect(result).toBe('Price: {price}')
    })
  })

  describe('date formatting', () => {
    // Use a fixed date for consistent testing
    const testDate = new Date('2024-03-15T10:30:00Z')

    test('formats date with short style', () => {
      const result = interpolateICU(
        'Date: {date, date, short}',
        { date: testDate },
        'en-US'
      )
      expect(result).toMatch(/3\/15\/24/)
    })

    test('formats date with medium style', () => {
      const result = interpolateICU(
        'Date: {date, date, medium}',
        { date: testDate },
        'en-US'
      )
      expect(result).toContain('Mar')
      expect(result).toContain('2024')
    })

    test('formats date with long style', () => {
      const result = interpolateICU(
        'Date: {date, date, long}',
        { date: testDate },
        'en-US'
      )
      expect(result).toContain('March')
      expect(result).toContain('2024')
    })

    test('accepts timestamp number', () => {
      const timestamp = new Date('2024-06-01').getTime()
      const result = interpolateICU(
        'Timestamp: {ts, date, short}',
        { ts: timestamp },
        'en-US'
      )
      expect(result).toMatch(/6\/1\/24/)
    })

    test('formats date for Korean locale', () => {
      const result = interpolateICU(
        '날짜: {date, date, long}',
        { date: testDate },
        'ko-KR'
      )
      expect(result).toContain('2024')
      expect(result).toContain('3')
      expect(result).toContain('15')
    })

    test('missing date value returns placeholder', () => {
      const result = interpolateICU(
        'Date: {date, date}',
        {},
        'en-US'
      )
      expect(result).toBe('Date: {date}')
    })
  })

  describe('time formatting', () => {
    const testDate = new Date('2024-03-15T14:30:45Z')

    test('formats time with short style', () => {
      const result = interpolateICU(
        'Time: {time, time, short}',
        { time: testDate },
        'en-US'
      )
      // Should contain hour and minute
      expect(result).toMatch(/\d+:\d+/)
    })

    test('formats time with medium style', () => {
      const result = interpolateICU(
        'Time: {time, time, medium}',
        { time: testDate },
        'en-US'
      )
      // Should contain seconds too
      expect(result).toMatch(/\d+:\d+:\d+/)
    })

    test('missing time value returns placeholder', () => {
      const result = interpolateICU(
        'Time: {time, time}',
        {},
        'en-US'
      )
      expect(result).toBe('Time: {time}')
    })
  })

  describe('combined formatting', () => {
    test('combines date and number in same message', () => {
      const result = interpolateICU(
        'Order on {date, date, short}: {total, number}',
        { date: new Date('2024-03-15'), total: 99.99 },
        'en-US'
      )
      expect(result).toMatch(/3\/15/)
      expect(result).toContain('99.99')
    })

    test('combines plural with number formatting', () => {
      const result = interpolateICU(
        'You have {count, plural, one {# item} other {# items}} worth {value, number}',
        { count: 3, value: 150 },
        'en-US'
      )
      expect(result).toContain('3 items')
      expect(result).toContain('150')
    })
  })
})
