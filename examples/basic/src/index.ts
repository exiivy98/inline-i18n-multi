/**
 * Basic inline-i18n-multi example
 *
 * This example demonstrates:
 * - Inline translations with it()
 * - Key-based translations with t()
 * - Variable interpolation
 * - Plural support
 * - Language pair helpers
 * - ICU Message Format (date, number, time, relativeTime, list)
 * - Locale Fallback Chain
 * - Missing Translation Warning
 * - Namespace Support (v0.4.0)
 * - Debug Mode (v0.4.0)
 * - Currency Formatting (v0.5.0)
 * - Compact Number Formatting (v0.5.0)
 * - Lazy Loading (v0.5.0)
 * - Custom Formatter Registry (v0.6.0)
 * - Interpolation Guards (v0.6.0)
 * - Locale Detection (v0.6.0)
 * - ICU Message Cache (v0.7.0)
 * - Plural Shorthand (v0.7.0)
 * - Locale Persistence (v0.7.0)
 * - Translation Scope (v0.8.0)
 */

import {
  // Inline translations
  it,
  setLocale,
  getLocale,
  // Language pair helpers
  it_ja,
  en_zh,
  // Key-based translations
  t,
  loadDictionaries,
  hasTranslation,
  getLoadedLocales,
  getLoadedNamespaces,
  clearDictionaries,
  // Configuration
  configure,
  resetConfig,
  // Lazy loading (v0.5.0)
  loadAsync,
  isLoaded,
  // Custom formatters (v0.6.0)
  registerFormatter,
  clearFormatters,
  // Locale detection (v0.6.0)
  detectLocale,
  // ICU cache (v0.7.0)
  clearICUCache,
  // Locale persistence (v0.7.0)
  restoreLocale,
  // Translation scope (v0.8.0)
  createScope,
} from 'inline-i18n-multi'

// ============================================
// 1. Inline Translations (it)
// ============================================

console.log('=== Inline Translations ===\n')

// Set locale to English
setLocale('en')
console.log(`Current locale: ${getLocale()}`)

// Basic usage: Korean as primary, English as secondary
console.log(it('안녕하세요', 'Hello'))  // → "Hello"

// With variables
console.log(it('안녕, {name}님', 'Hello, {name}', { name: 'John' }))  // → "Hello, John"

// Object syntax for multiple languages
console.log(it({ ko: '안녕하세요', en: 'Hello', ja: 'こんにちは' }))  // → "Hello"

// Switch to Korean
setLocale('ko')
console.log(`\nCurrent locale: ${getLocale()}`)
console.log(it('안녕하세요', 'Hello'))  // → "안녕하세요"

// ============================================
// 2. Language Pair Helpers
// ============================================

console.log('\n=== Language Pair Helpers ===\n')

// Korean ↔ Japanese
setLocale('ja')
console.log(it_ja('안녕하세요', 'こんにちは'))  // → "こんにちは"

// English ↔ Chinese
setLocale('zh')
console.log(en_zh('Hello', '你好'))  // → "你好"

// ============================================
// 3. Key-Based Translations (t)
// ============================================

console.log('\n=== Key-Based Translations ===\n')

// Load translation dictionaries
loadDictionaries({
  en: {
    greeting: {
      hello: 'Hello',
      goodbye: 'Goodbye',
    },
    items: {
      count_one: '{count} item',
      count_other: '{count} items',
    },
    welcome: 'Welcome, {name}!',
  },
  ko: {
    greeting: {
      hello: '안녕하세요',
      goodbye: '안녕히 가세요',
    },
    items: {
      count_other: '{count}개 항목',
    },
    welcome: '환영합니다, {name}님!',
  },
})

console.log('Loaded locales:', getLoadedLocales())  // → ['en', 'ko']

// Basic key-based translation
setLocale('en')
console.log(t('greeting.hello'))  // → "Hello"

// With variables
console.log(t('welcome', { name: 'John' }))  // → "Welcome, John!"

// Plural support (uses Intl.PluralRules)
console.log(t('items.count', { count: 1 }))  // → "1 item"
console.log(t('items.count', { count: 5 }))  // → "5 items"

// Override locale
console.log(t('greeting.hello', undefined, 'ko'))  // → "안녕하세요"

// Check if translation exists
console.log('Has greeting.hello:', hasTranslation('greeting.hello'))  // → true
console.log('Has missing.key:', hasTranslation('missing.key'))  // → false

// ============================================
// 4. ICU Date/Number/Time Formatting (v0.3.0)
// ============================================

console.log('\n=== ICU Date/Number/Time Formatting ===\n')

setLocale('en')

// Date formatting
console.log(it({
  en: 'Today: {date, date, long}',
  ko: '오늘: {date, date, long}'
}, { date: new Date() }))

// Number formatting
console.log(it({
  en: 'Price: {price, number}',
  ko: '가격: {price, number}'
}, { price: 1234.56 }))

// Percent formatting
console.log(it({
  en: 'Discount: {rate, number, percent}',
  ko: '할인율: {rate, number, percent}'
}, { rate: 0.25 }))

// Time formatting
console.log(it({
  en: 'Current time: {time, time, short}',
  ko: '현재 시간: {time, time, short}'
}, { time: new Date() }))

// ============================================
// 5. Locale Fallback Chain (v0.3.0)
// ============================================

console.log('\n=== Locale Fallback Chain ===\n')

// BCP 47 automatic fallback: zh-TW → zh → en
setLocale('zh-TW')
console.log('Locale: zh-TW')
console.log(it({ en: 'Hello', zh: '你好' }))  // → '你好' (falls back to zh)

// Reset and configure custom fallback
resetConfig()
configure({
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en']
  }
})

setLocale('pt-BR')
console.log('\nLocale: pt-BR (custom chain: pt-BR → pt → es → en)')
console.log(it({ en: 'Hello', es: 'Hola' }))  // → 'Hola' (falls back through chain)

// ============================================
// 6. Missing Translation Warning (v0.3.0)
// ============================================

console.log('\n=== Missing Translation Warning ===\n')

resetConfig()
configure({
  warnOnMissing: true,
  onMissingTranslation: (warning) => {
    console.log(`Warning: Missing translation`)
    console.log(`   Requested: ${warning.requestedLocale}`)
    console.log(`   Available: ${warning.availableLocales.join(', ')}`)
    console.log(`   Fallback used: ${warning.fallbackUsed}`)
  }
})

setLocale('fr')  // French not available
console.log('Locale: fr (not available)')
console.log('Result:', it({ en: 'Hello', ko: '안녕하세요' }))  // Triggers warning

// ============================================
// 7. Relative Time Formatting (v0.4.0)
// ============================================

console.log('\n=== Relative Time Formatting (v0.4.0) ===\n')

resetConfig()
setLocale('en')

// Past time
const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
console.log(it({
  en: 'Updated {time, relativeTime}',
  ko: '{time, relativeTime} 업데이트됨'
}, { time: threeDaysAgo }))

// Future time
const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000)
console.log(it({
  en: 'Expires {time, relativeTime}',
  ko: '{time, relativeTime} 만료'
}, { time: inTwoHours }))

// Short style
console.log(it({
  en: '{time, relativeTime, short}',
  ko: '{time, relativeTime, short}'
}, { time: threeDaysAgo }))

// ============================================
// 8. List Formatting (v0.4.0)
// ============================================

console.log('\n=== List Formatting (v0.4.0) ===\n')

// Conjunction (and)
console.log(it({
  en: 'Invited: {names, list}',
  ko: '초대됨: {names, list}'
}, { names: ['Alice', 'Bob', 'Charlie'] }))

// Disjunction (or)
console.log(it({
  en: 'Choose: {options, list, disjunction}',
  ko: '선택: {options, list, disjunction}'
}, { options: ['A', 'B', 'C'] }))

// Unit (no conjunction)
console.log(it({
  en: 'Sizes: {sizes, list, unit}',
  ko: '사이즈: {sizes, list, unit}'
}, { sizes: ['S', 'M', 'L', 'XL'] }))

// ============================================
// 9. Namespace Support (v0.4.0)
// ============================================

console.log('\n=== Namespace Support (v0.4.0) ===\n')

// Clear previous dictionaries
clearDictionaries()

// Load with namespaces
loadDictionaries({
  en: { hello: 'Hello', goodbye: 'Goodbye' },
  ko: { hello: '안녕하세요', goodbye: '안녕히 가세요' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme', darkMode: 'Dark Mode' },
  ko: { title: '설정', theme: '테마', darkMode: '다크 모드' }
}, 'settings')

console.log('Loaded namespaces:', getLoadedNamespaces())  // → ['common', 'settings']

setLocale('en')
console.log(t('common:hello'))       // → "Hello"
console.log(t('settings:title'))     // → "Settings"
console.log(t('settings:darkMode'))  // → "Dark Mode"

setLocale('ko')
console.log(t('common:hello'))       // → "안녕하세요"
console.log(t('settings:title'))     // → "설정"

// Clear specific namespace
clearDictionaries('settings')
console.log('\nAfter clearing "settings" namespace:')
console.log('Loaded namespaces:', getLoadedNamespaces())  // → ['common']

// ============================================
// 10. Debug Mode (v0.4.0)
// ============================================

console.log('\n=== Debug Mode (v0.4.0) ===\n')

// Enable debug mode
configure({ debugMode: true })

// When translation is missing, shows fallback prefix
setLocale('fr')
console.log('With debugMode (missing fr):')
console.log(it({ en: 'Hello', ko: '안녕하세요' }))  // → "[fr -> en] Hello"

// When key is missing
console.log(t('common:missing.key'))  // → "[MISSING: fr] common:missing.key"

// Disable debug mode
configure({ debugMode: false })

// ============================================
// 11. Currency Formatting (v0.5.0)
// ============================================

console.log('\n=== Currency Formatting (v0.5.0) ===\n')

resetConfig()
setLocale('en')

// USD formatting
console.log(it({
  en: 'Total: {price, currency, USD}',
  ko: '합계: {price, currency, KRW}'
}, { price: 42000 }))
// → "Total: $42,000.00"

// EUR with Korean locale
setLocale('ko')
console.log(it({
  en: 'Total: {price, currency, USD}',
  ko: '합계: {price, currency, KRW}'
}, { price: 42000 }))
// → "합계: ₩42,000"

// Default currency (USD) when code omitted
setLocale('en')
console.log(it({ en: '{price, currency}' }, { price: 100 }))
// → "$100.00"

// ============================================
// 12. Compact Number Formatting (v0.5.0)
// ============================================

console.log('\n=== Compact Number Formatting (v0.5.0) ===\n')

// Compact (short)
setLocale('en')
console.log(it({
  en: '{count, number, compact} views',
  ko: '{count, number, compact} 조회'
}, { count: 1500000 }))
// → "1.5M views"

setLocale('ko')
console.log(it({
  en: '{count, number, compact} views',
  ko: '{count, number, compact} 조회'
}, { count: 1500000 }))
// → "150만 조회"

// Compact long
setLocale('en')
console.log(it({ en: '{count, number, compactLong}' }, { count: 1500000 }))
// → "1.5 million"

// Small numbers stay as-is
console.log(it({ en: '{count, number, compact}' }, { count: 42 }))
// → "42"

// ============================================
// 13. Lazy Loading (v0.5.0)
// ============================================

console.log('\n=== Lazy Loading (v0.5.0) ===\n')

// Configure a loader
clearDictionaries()
configure({
  loader: async (locale, namespace) => {
    // Simulating async loading (in real apps, use dynamic import)
    console.log(`  Loading ${locale}/${namespace}...`)
    const dictionaries: Record<string, Record<string, Record<string, string>>> = {
      en: { dashboard: { title: 'Dashboard', welcome: 'Welcome to dashboard' } },
      ko: { dashboard: { title: '대시보드', welcome: '대시보드에 오신 것을 환영합니다' } },
    }
    return dictionaries[locale]?.[namespace] ?? {}
  }
})

// Check before loading
console.log('Before load - isLoaded("en", "dashboard"):', isLoaded('en', 'dashboard'))  // → false

// Load asynchronously
setLocale('en')
await loadAsync('en', 'dashboard')
console.log('After load - isLoaded("en", "dashboard"):', isLoaded('en', 'dashboard'))  // → true
console.log(t('dashboard:title'))  // → "Dashboard"
console.log(t('dashboard:welcome'))  // → "Welcome to dashboard"

// Load Korean
await loadAsync('ko', 'dashboard')
setLocale('ko')
console.log(t('dashboard:title'))  // → "대시보드"

// ============================================
// 14. Custom Formatter Registry (v0.6.0)
// ============================================

console.log('\n=== Custom Formatter Registry (v0.6.0) ===\n')

resetConfig()
setLocale('en')

// Register a phone number formatter
registerFormatter('phone', (value) => {
  const s = String(value)
  return `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`
})

console.log(it({ en: 'Call {num, phone}' }, { num: '2125551234' }))
// → "Call (212) 555-1234"

// Register a credit card mask formatter with style
registerFormatter('mask', (value, _locale, style) => {
  const s = String(value)
  if (style === 'last4') return '****' + s.slice(-4)
  return '****'
})

console.log(it({ en: 'Card: {card, mask, last4}' }, { card: '4111111111111234' }))
// → "Card: ****1234"

// Combined with built-in ICU
console.log(it(
  { en: '{count, plural, one {# call} other {# calls}} to {num, phone}' },
  { count: 3, num: '2125551234' }
))
// → "3 calls to (212) 555-1234"

clearFormatters()

// ============================================
// 15. Interpolation Guards (v0.6.0)
// ============================================

console.log('\n=== Interpolation Guards (v0.6.0) ===\n')

// Default behavior: missing var shows {name}
console.log('Default:', it({ en: 'Hello {name}' }))
// → "Hello {name}"

// Custom handler
configure({
  missingVarHandler: (varName, locale) => `[${varName}:${locale}]`
})

console.log('With handler:', it({ en: 'Hello {name}' }))
// → "Hello [name:en]"

// Works with partial vars
console.log('Partial:', it({ en: 'Hi {name}, age {age}' }, { name: 'World' }))
// → "Hi World, age [age:en]"

resetConfig()

// ============================================
// 16. Locale Detection (v0.6.0)
// ============================================

console.log('\n=== Locale Detection (v0.6.0) ===\n')

// Detect from Accept-Language header (useful for SSR)
const detected = detectLocale({
  supportedLocales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
  sources: ['header'],
  headerValue: 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
})
console.log('Detected locale:', detected)  // → "ko"

// No matching source → falls back to default
const fallback = detectLocale({
  supportedLocales: ['en', 'ko'],
  defaultLocale: 'en',
  sources: ['header'],
  headerValue: 'fr-FR,fr;q=0.9',
})
console.log('Fallback locale:', fallback)  // → "en"

// ============================================
// 17. ICU Message Cache (v0.7.0)
// ============================================

console.log('\n=== ICU Message Cache (v0.7.0) ===\n')

resetConfig()
setLocale('en')

// Cache is enabled by default (size: 500)
// Same ICU template reuses cached AST for performance
const template = { en: '{count, plural, one {# item} other {# items}}', ko: '{count, plural, other {#개}}' }
console.log(it(template, { count: 1 }))  // → "1 item" (parse + cache)
console.log(it(template, { count: 5 }))  // → "5 items" (cache hit!)

// Configure cache size
configure({ icuCacheSize: 100 })
console.log('Cache size configured to 100')

// Disable cache
configure({ icuCacheSize: 0 })
console.log('Cache disabled (icuCacheSize: 0)')

// Clear cache manually
configure({ icuCacheSize: 500 })
clearICUCache()
console.log('Cache cleared with clearICUCache()')

// ============================================
// 18. Plural Shorthand (v0.7.0)
// ============================================

console.log('\n=== Plural Shorthand (v0.7.0) ===\n')

resetConfig()
setLocale('en')

// 2-part shorthand: {var, p, singular|plural}
console.log(it({ en: '{count, p, item|items}' }, { count: 1 }))  // → "1 item"
console.log(it({ en: '{count, p, item|items}' }, { count: 5 }))  // → "5 items"

// 3-part shorthand: {var, p, zero|singular|plural}
console.log(it({ en: '{count, p, none|item|items}' }, { count: 0 }))  // → "none"
console.log(it({ en: '{count, p, none|item|items}' }, { count: 1 }))  // → "1 item"
console.log(it({ en: '{count, p, none|item|items}' }, { count: 5 }))  // → "5 items"

// Mixed with other text
console.log(it({
  en: 'You have {count, p, message|messages}',
  ko: '{count, p, 메시지가 없습니다|개의 메시지|개의 메시지}',
}, { count: 3 }))

// ============================================
// 19. Locale Persistence (v0.7.0)
// ============================================

console.log('\n=== Locale Persistence (v0.7.0) ===\n')

resetConfig()

// Note: localStorage/cookie are not available in Node.js
// These examples show the API — they work in browser environments

// Configure persistence (would work in browser)
configure({
  persistLocale: { storage: 'localStorage', key: 'MY_LOCALE' }
})
console.log('Configured persistLocale with localStorage')

// restoreLocale() returns undefined in Node.js (no storage available)
const saved = restoreLocale()
console.log('restoreLocale() in Node.js:', saved)  // → undefined

// In a browser environment:
// setLocale('ko')          → auto-saves 'ko' to localStorage
// restoreLocale()          → reads from localStorage, returns 'ko'

// Cookie example
configure({
  persistLocale: { storage: 'cookie', key: 'LOCALE', expires: 365 }
})
console.log('Configured persistLocale with cookie (expires: 365 days)')

resetConfig()

// ============================================
// 20. Translation Scope (v0.8.0)
// ============================================

console.log('\n=== Translation Scope (v0.8.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

// Load namespaced dictionaries
loadDictionaries({
  en: { hello: 'Hello', goodbye: 'Goodbye' },
  ko: { hello: '안녕하세요', goodbye: '안녕히 가세요' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme' },
  ko: { title: '설정', theme: '테마' }
}, 'settings')

// Create scoped translation functions
const tc = createScope('common')
const ts = createScope('settings')

// Use scoped functions — no need to prefix with namespace
console.log(tc('hello'))     // → "Hello" (same as t('common:hello'))
console.log(tc('goodbye'))   // → "Goodbye"
console.log(ts('title'))     // → "Settings"
console.log(ts('theme'))     // → "Theme"

// Switch locale
setLocale('ko')
console.log(tc('hello'))     // → "안녕하세요"
console.log(ts('title'))     // → "설정"

// ============================================
// Summary
// ============================================

console.log('\n=== Summary ===')
console.log(`
inline-i18n-multi provides two translation approaches:

1. Inline translations (it):
   - Write translations directly in code
   - Searchable in your codebase
   - Great for small to medium projects

2. Key-based translations (t):
   - Traditional i18n approach
   - Compatible with existing JSON files
   - Plural support with Intl.PluralRules
   - Good for large projects with many translations

v0.3.0 features:
- ICU Date/Number/Time formatting
- Locale Fallback Chain (BCP 47)
- Missing Translation Warnings

v0.4.0 features:
- Relative Time formatting ({time, relativeTime})
- List formatting ({names, list})
- Namespace support (t('common:greeting'))
- Debug mode for visual debugging

v0.5.0 features:
- Currency formatting ({price, currency, USD})
- Compact number formatting ({count, number, compact})
- Lazy loading (loadAsync(), isLoaded())
- Rich Text interpolation (React only - see react example)

v0.6.0 features:
- Custom Formatter Registry (registerFormatter(), clearFormatters())
- Interpolation Guards (missingVarHandler)
- Locale Detection (detectLocale())
- Selectordinal (ordinal plural rules)

v0.7.0 features:
- ICU Message Cache (cachedParse, clearICUCache())
- Plural Shorthand ({count, p, item|items})
- Locale Persistence (persistLocale, restoreLocale())

v0.8.0 features:
- Translation Scope (createScope, useScopedT)
- Unused Key Detection (validate --unused)
- TypeScript Type Generation (typegen)
`)
