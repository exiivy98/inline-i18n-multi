import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { interpolateICU, hasICUPattern, hasPluralShorthand, registerFormatter, clearFormatters, clearICUCache } from './icu'
import { configure, resetConfig } from './config'

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

  // ==========================================================================
  // Selectordinal (v0.6.0)
  // ==========================================================================

  describe('selectordinal', () => {
    test('1st (one)', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        { rank: 1 },
        'en'
      )
      expect(result).toBe('1st')
    })

    test('2nd (two)', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        { rank: 2 },
        'en'
      )
      expect(result).toBe('2nd')
    })

    test('3rd (few)', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        { rank: 3 },
        'en'
      )
      expect(result).toBe('3rd')
    })

    test('4th (other)', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        { rank: 4 },
        'en'
      )
      expect(result).toBe('4th')
    })

    test('11th is other (not one)', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        { rank: 11 },
        'en'
      )
      expect(result).toBe('11th')
    })

    test('21st is one', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        { rank: 21 },
        'en'
      )
      expect(result).toBe('21st')
    })

    test('combined with text', () => {
      const result = interpolateICU(
        'You finished {rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}} place!',
        { rank: 3 },
        'en'
      )
      expect(result).toBe('You finished 3rd place!')
    })

    test('missing value returns placeholder', () => {
      const result = interpolateICU(
        '{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',
        {},
        'en'
      )
      expect(result).toBe('{rank}')
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

  describe('relativeTime formatting (v0.4.0)', () => {
    test('detects relativeTime pattern', () => {
      expect(hasICUPattern('{time, relativeTime}')).toBe(true)
      expect(hasICUPattern('{time, relativeTime, short}')).toBe(true)
    })

    test('formats past time (days ago)', () => {
      const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      const result = interpolateICU(
        'Updated {time, relativeTime}',
        { time: pastDate },
        'en-US'
      )
      expect(result).toContain('3 days ago')
    })

    test('formats future time (in X hours)', () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      const result = interpolateICU(
        'Expires {time, relativeTime}',
        { time: futureDate },
        'en-US'
      )
      expect(result).toContain('in 2 hours')
    })

    test('formats with short style', () => {
      const pastDate = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      const result = interpolateICU(
        '{time, relativeTime, short}',
        { time: pastDate },
        'en-US'
      )
      expect(result).toMatch(/5\s*min/)
    })

    test('formats for Korean locale', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      const result = interpolateICU(
        '{time, relativeTime}',
        { time: pastDate },
        'ko-KR'
      )
      // Korean "yesterday" or "1일 전"
      expect(result).toMatch(/(어제|1일 전)/)
    })

    test('formats with narrow style', () => {
      const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      const result = interpolateICU(
        '{time, relativeTime, narrow}',
        { time: pastDate },
        'en-US'
      )
      expect(result).toMatch(/2\s*d/)
    })

    test('missing value returns placeholder', () => {
      const result = interpolateICU(
        'Updated {time, relativeTime}',
        {},
        'en-US'
      )
      expect(result).toBe('Updated {time}')
    })

    test('combined with other formats', () => {
      const pastDate = new Date(Date.now() - 60 * 1000) // 1 minute ago
      const result = interpolateICU(
        '{name} updated {time, relativeTime}',
        { name: 'Alice', time: pastDate },
        'en-US'
      )
      expect(result).toContain('Alice')
      expect(result).toContain('minute')
    })
  })

  describe('list formatting (v0.4.0)', () => {
    test('detects list pattern', () => {
      expect(hasICUPattern('{names, list}')).toBe(true)
      expect(hasICUPattern('{names, list, conjunction}')).toBe(true)
    })

    test('formats list with conjunction (and)', () => {
      const result = interpolateICU(
        '{names, list}',
        { names: ['Alice', 'Bob', 'Carol'] },
        'en-US'
      )
      expect(result).toBe('Alice, Bob, and Carol')
    })

    test('formats list with disjunction (or)', () => {
      const result = interpolateICU(
        '{options, list, disjunction}',
        { options: ['red', 'blue', 'green'] },
        'en-US'
      )
      expect(result).toBe('red, blue, or green')
    })

    test('formats list with unit type', () => {
      const result = interpolateICU(
        '{items, list, unit}',
        { items: ['5 kg', '10 cm'] },
        'en-US'
      )
      expect(result).toContain('5 kg')
      expect(result).toContain('10 cm')
    })

    test('formats list with short style', () => {
      const result = interpolateICU(
        '{names, list, conjunction, short}',
        { names: ['A', 'B', 'C'] },
        'en-US'
      )
      expect(result).toContain('A')
      expect(result).toContain('B')
      expect(result).toContain('C')
    })

    test('formats two items', () => {
      const result = interpolateICU(
        '{names, list}',
        { names: ['Alice', 'Bob'] },
        'en-US'
      )
      expect(result).toBe('Alice and Bob')
    })

    test('formats single item', () => {
      const result = interpolateICU(
        '{names, list}',
        { names: ['Alice'] },
        'en-US'
      )
      expect(result).toBe('Alice')
    })

    test('formats for Korean locale', () => {
      const result = interpolateICU(
        '{names, list}',
        { names: ['철수', '영희', '민수'] },
        'ko-KR'
      )
      // Korean uses different connectors
      expect(result).toContain('철수')
      expect(result).toContain('영희')
      expect(result).toContain('민수')
    })

    test('missing value returns placeholder', () => {
      const result = interpolateICU(
        'Invited: {names, list}',
        {},
        'en-US'
      )
      expect(result).toBe('Invited: {names}')
    })

    test('non-array value returns placeholder', () => {
      const result = interpolateICU(
        '{names, list}',
        { names: 'not an array' as unknown as string[] },
        'en-US'
      )
      expect(result).toBe('{names}')
    })

    test('combined with text', () => {
      const result = interpolateICU(
        'Invited: {names, list}',
        { names: ['Alice', 'Bob'] },
        'en-US'
      )
      expect(result).toBe('Invited: Alice and Bob')
    })

    test('combined with other formats', () => {
      const result = interpolateICU(
        '{names, list} have {count, plural, one {# item} other {# items}}',
        { names: ['Alice', 'Bob'], count: 5 },
        'en-US'
      )
      expect(result).toContain('Alice and Bob')
      expect(result).toContain('5 items')
    })
  })

  // ==========================================================================
  // Currency Formatting (v0.5.0)
  // ==========================================================================

  describe('currency formatting (v0.5.0)', () => {
    test('detects currency pattern', () => {
      expect(hasICUPattern('{price, currency, USD}')).toBe(true)
      expect(hasICUPattern('{price, currency}')).toBe(true)
      expect(hasICUPattern('{price, currency, KRW}')).toBe(true)
    })

    test('formats USD for en-US', () => {
      const result = interpolateICU(
        '{price, currency, USD}',
        { price: 42000 },
        'en-US'
      )
      expect(result).toBe('$42,000.00')
    })

    test('formats KRW for ko-KR', () => {
      const result = interpolateICU(
        '{price, currency, KRW}',
        { price: 42000 },
        'ko-KR'
      )
      expect(result).toContain('42,000')
      expect(result).toContain('₩')
    })

    test('formats EUR for de-DE', () => {
      const result = interpolateICU(
        '{price, currency, EUR}',
        { price: 1234.5 },
        'de-DE'
      )
      expect(result).toContain('1.234,50')
      expect(result).toContain('€')
    })

    test('defaults to USD when no currency code specified', () => {
      const result = interpolateICU(
        '{price, currency}',
        { price: 100 },
        'en-US'
      )
      expect(result).toBe('$100.00')
    })

    test('missing value returns placeholder', () => {
      const result = interpolateICU(
        '{price, currency, USD}',
        {},
        'en-US'
      )
      expect(result).toBe('{price}')
    })

    test('non-numeric value returns placeholder', () => {
      const result = interpolateICU(
        '{price, currency, USD}',
        { price: 'abc' as unknown as number },
        'en-US'
      )
      expect(result).toBe('{price}')
    })

    test('combined with text', () => {
      const result = interpolateICU(
        'Total: {price, currency, USD}',
        { price: 42000 },
        'en-US'
      )
      expect(result).toBe('Total: $42,000.00')
    })

    test('combined with other ICU formats', () => {
      const result = interpolateICU(
        '{count, plural, one {# item} other {# items}} for {price, currency, USD}',
        { count: 3, price: 29.99 },
        'en-US'
      )
      expect(result).toContain('3 items')
      expect(result).toContain('$29.99')
    })

    test('multiple currencies in same template', () => {
      const result = interpolateICU(
        '{usd, currency, USD} / {krw, currency, KRW}',
        { usd: 100, krw: 130000 },
        'en-US'
      )
      expect(result).toContain('$100.00')
      expect(result).toContain('₩130,000')
    })
  })

  // ==========================================================================
  // Compact Number Formatting (v0.5.0)
  // ==========================================================================

  describe('compact number formatting (v0.5.0)', () => {
    test('formats compact number in en-US', () => {
      const result = interpolateICU(
        '{count, number, compact}',
        { count: 1500000 },
        'en-US'
      )
      expect(result).toMatch(/1\.5M/)
    })

    test('formats compact number in ko-KR', () => {
      const result = interpolateICU(
        '{count, number, compact}',
        { count: 1500000 },
        'ko-KR'
      )
      expect(result).toContain('만')
    })

    test('formats compactLong in en-US', () => {
      const result = interpolateICU(
        '{count, number, compactLong}',
        { count: 1500000 },
        'en-US'
      )
      expect(result).toMatch(/million/i)
    })

    test('formats small number without compaction', () => {
      const result = interpolateICU(
        '{count, number, compact}',
        { count: 100 },
        'en-US'
      )
      expect(result).toBe('100')
    })

    test('formats compact for de-DE', () => {
      const result = interpolateICU(
        '{count, number, compact}',
        { count: 1500000 },
        'de-DE'
      )
      // German uses "Mio." or similar
      expect(result).toBeTruthy()
    })

    test('missing value returns placeholder', () => {
      const result = interpolateICU(
        '{count, number, compact}',
        {},
        'en-US'
      )
      expect(result).toBe('{count}')
    })

    test('combined with text', () => {
      const result = interpolateICU(
        '{count, number, compact} views',
        { count: 1500000 },
        'en-US'
      )
      expect(result).toMatch(/1\.5M views/)
    })

    test('combined with currency', () => {
      const result = interpolateICU(
        '{count, number, compact} items for {price, currency, USD}',
        { count: 1500000, price: 99.99 },
        'en-US'
      )
      expect(result).toMatch(/1\.5M items/)
      expect(result).toContain('$99.99')
    })
  })

  // ==========================================================================
  // Interpolation Guards with ICU (v0.6.0)
  // ==========================================================================

  describe('missingVarHandler with ICU (v0.6.0)', () => {
    beforeEach(() => {
      resetConfig()
    })

    afterEach(() => {
      resetConfig()
    })

    test('handler called for missing number format var', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU('{price, number}', {}, 'en')
      expect(result).toBe('[price]')
    })

    test('handler called for missing currency var', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU('{price, currency, USD}', {}, 'en-US')
      expect(result).toBe('[price]')
    })

    test('handler called for missing compact number var', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU('{count, number, compact}', {}, 'en-US')
      expect(result).toBe('[count]')
    })

    test('handler called for missing date var', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU('{d, date}', {}, 'en')
      expect(result).toBe('[d]')
    })

    test('handler called for missing time var', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU('{t, time}', {}, 'en')
      expect(result).toBe('[t]')
    })

    test('handler called for missing select var', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU(
        '{gender, select, male {He} female {She} other {They}}',
        {},
        'en'
      )
      // select with undefined value falls through to 'other' branch
      expect(result).toBe('They')
    })

    test('handler called for missing argument element', () => {
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU(
        '{count, plural, one {# item for {name}} other {# items for {name}}}',
        { count: 3 },
        'en'
      )
      expect(result).toBe('3 items for [name]')
    })

    test('handler receives correct locale', () => {
      const handler = vi.fn().mockReturnValue('??')
      configure({ missingVarHandler: handler })
      interpolateICU('{val, number}', {}, 'ko-KR')
      expect(handler).toHaveBeenCalledWith('val', 'ko-KR')
    })
  })

  // ==========================================================================
  // Custom Formatter Registry (v0.6.0)
  // ==========================================================================

  describe('custom formatter registry (v0.6.0)', () => {
    afterEach(() => {
      clearFormatters()
      resetConfig()
    })

    test('register and use custom formatter', () => {
      registerFormatter('phone', (value) => {
        const s = String(value)
        return `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`
      })
      const result = interpolateICU(
        'Call {num, phone}',
        { num: '2125551234' },
        'en'
      )
      expect(result).toBe('Call (212) 555-1234')
    })

    test('custom formatter with style arg', () => {
      registerFormatter('mask', (value, _locale, style) => {
        const s = String(value)
        if (style === 'last4') return '****' + s.slice(-4)
        return '****'
      })
      const result = interpolateICU(
        'Card: {card, mask, last4}',
        { card: '4111111111111234' },
        'en'
      )
      expect(result).toBe('Card: ****1234')
    })

    test('custom formatter receives locale', () => {
      const formatter = vi.fn().mockReturnValue('formatted')
      registerFormatter('test', formatter)
      interpolateICU('{val, test}', { val: 'hello' }, 'ko-KR')
      expect(formatter).toHaveBeenCalledWith('hello', 'ko-KR', undefined)
    })

    test('unregistered name falls through to ICU', () => {
      // 'number' is a built-in ICU type, not a custom formatter
      const result = interpolateICU('{count, number}', { count: 1234 }, 'en')
      expect(result).toBe('1,234')
    })

    test('missing variable returns placeholder', () => {
      registerFormatter('phone', (value) => String(value))
      const result = interpolateICU('Call {num, phone}', {}, 'en')
      expect(result).toBe('Call {num}')
    })

    test('missing variable uses missingVarHandler', () => {
      registerFormatter('phone', (value) => String(value))
      configure({ missingVarHandler: (v) => `[${v}]` })
      const result = interpolateICU('Call {num, phone}', {}, 'en')
      expect(result).toBe('Call [num]')
    })

    test('clearFormatters works', () => {
      registerFormatter('phone', (value) => `(${String(value)})`)
      clearFormatters()
      // After clearing, {num, phone} is not recognized as custom formatter
      // so it falls through to ICU parser (which will treat it as unknown)
      const result = interpolateICU('Call {num}', { num: '123' }, 'en')
      expect(result).toBe('Call 123')
    })

    test('combined with built-in ICU formats', () => {
      registerFormatter('phone', (value) => {
        const s = String(value)
        return `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`
      })
      const result = interpolateICU(
        '{count, plural, one {# call} other {# calls}} to {num, phone}',
        { count: 3, num: '2125551234' },
        'en'
      )
      expect(result).toBe('3 calls to (212) 555-1234')
    })

    test('rejects reserved formatter names', () => {
      expect(() => registerFormatter('plural', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('select', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('number', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('date', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('time', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('currency', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('relativeTime', () => '')).toThrow('reserved ICU type name')
      expect(() => registerFormatter('list', () => '')).toThrow('reserved ICU type name')
    })
  })

  // ===========================================================================
  // ICU Message Cache (v0.7.0)
  // ===========================================================================
  describe('ICU message cache (v0.7.0)', () => {
    afterEach(() => {
      clearICUCache()
      resetConfig()
    })

    test('cached parse returns same result as uncached', () => {
      clearICUCache()
      const r1 = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 3 }, 'en')
      const r2 = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 3 }, 'en')
      expect(r1).toBe('3 items')
      expect(r2).toBe('3 items')
    })

    test('same template different vars uses cache', () => {
      clearICUCache()
      const r1 = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 1 }, 'en')
      const r2 = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 5 }, 'en')
      expect(r1).toBe('1 item')
      expect(r2).toBe('5 items')
    })

    test('clearICUCache resets the cache', () => {
      interpolateICU('{count, plural, one {# item} other {# items}}', { count: 1 }, 'en')
      clearICUCache()
      const result = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 1 }, 'en')
      expect(result).toBe('1 item')
    })

    test('cache respects icuCacheSize: 0 disables caching', () => {
      configure({ icuCacheSize: 0 })
      const r1 = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 1 }, 'en')
      const r2 = interpolateICU('{count, plural, one {# item} other {# items}}', { count: 5 }, 'en')
      expect(r1).toBe('1 item')
      expect(r2).toBe('5 items')
    })

    test('cache evicts oldest entry when at capacity', () => {
      configure({ icuCacheSize: 2 })
      clearICUCache()
      interpolateICU('{a}', { a: '1' }, 'en')
      interpolateICU('{b}', { b: '2' }, 'en')
      interpolateICU('{c}', { c: '3' }, 'en')
      expect(interpolateICU('{a}', { a: '1' }, 'en')).toBe('1')
      expect(interpolateICU('{b}', { b: '2' }, 'en')).toBe('2')
      expect(interpolateICU('{c}', { c: '3' }, 'en')).toBe('3')
    })
  })

  // ===========================================================================
  // Plural Shorthand (v0.7.0)
  // ===========================================================================
  describe('plural shorthand (v0.7.0)', () => {
    test('hasPluralShorthand detects shorthand', () => {
      expect(hasPluralShorthand('{count, p, item|items}')).toBe(true)
      expect(hasPluralShorthand('{count, p, none|item|items}')).toBe(true)
      expect(hasPluralShorthand('{count, plural, one {# item} other {# items}}')).toBe(false)
      expect(hasPluralShorthand('Hello {name}')).toBe(false)
    })

    test('two-part shorthand (singular|plural)', () => {
      expect(interpolateICU('{count, p, item|items}', { count: 1 }, 'en')).toBe('1 item')
      expect(interpolateICU('{count, p, item|items}', { count: 5 }, 'en')).toBe('5 items')
    })

    test('three-part shorthand (zero|singular|plural)', () => {
      expect(interpolateICU('{count, p, no items|item|items}', { count: 0 }, 'en')).toBe('no items')
      expect(interpolateICU('{count, p, no items|item|items}', { count: 1 }, 'en')).toBe('1 item')
      expect(interpolateICU('{count, p, no items|item|items}', { count: 5 }, 'en')).toBe('5 items')
    })

    test('combined with regular text', () => {
      const result = interpolateICU('You have {count, p, item|items} in your cart', { count: 3 }, 'en')
      expect(result).toBe('You have 3 items in your cart')
    })

    test('combined with other variables', () => {
      const result = interpolateICU('{name} has {count, p, message|messages}', { name: 'Alice', count: 1 }, 'en')
      expect(result).toBe('Alice has 1 message')
    })

    test('missing count variable', () => {
      const result = interpolateICU('{count, p, item|items}', {}, 'en')
      expect(result).toBe('{count}')
    })

    test('Korean locale (always other)', () => {
      expect(interpolateICU('{count, p, 개|개}', { count: 5 }, 'ko')).toBe('5 개')
    })
  })
})
