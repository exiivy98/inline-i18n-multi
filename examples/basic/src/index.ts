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
 * - Fallback Value (v0.10.0)
 * - Locale Display Names (v0.11.0)
 * - Translation Key Listing (v0.11.0)
 * - Missing Translation Tracker (v0.11.0)
 * - Locale Change Event (v0.12.0)
 * - Formatting Utilities (v0.13.0)
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
  // Utils (v0.11.0)
  getLocaleDisplayName,
  getTranslationKeys,
  trackMissingKeys,
  getMissingKeys,
  clearMissingKeys,
  // Locale change event (v0.12.0)
  onLocaleChange,
  // Formatting utilities (v0.13.0)
  formatNumber,
  formatDate,
  formatList,
  // Raw template access (v0.14.0)
  tRaw,
  // Batch translation (v0.15.0)
  tBatch,
  // Missing locales detection (v0.16.0)
  getMissingLocales,
  // Completeness ratio (v0.17.0)
  getCompletenessRatio,
  // Missing key listener (v0.18.0)
  onMissingKey,
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
// 21. Context System (v0.9.0)
// ============================================

console.log('\n=== Context System (v0.9.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

// Load dictionaries with context-specific keys (key#context format)
loadDictionaries({
  en: {
    greeting: 'Hello',
    'greeting#formal': 'Good day',
    'greeting#casual': 'Hey',
    welcome: 'Welcome, {name}',
    'welcome#formal': 'We are honored to have you, {name}',
  },
  ko: {
    greeting: '안녕하세요',
    'greeting#formal': '안녕하십니까',
    'greeting#casual': '안녕',
    welcome: '{name}님 환영합니다',
    'welcome#formal': '{name}님을 모시게 되어 영광입니다',
  },
})

// Use _context to select context-specific translation
console.log(t('greeting'))                          // → "Hello"
console.log(t('greeting', { _context: 'formal' }))  // → "Good day"
console.log(t('greeting', { _context: 'casual' }))  // → "Hey"

// Unknown context falls back to base key
console.log(t('greeting', { _context: 'unknown' })) // → "Hello"

// Context works with interpolation
console.log(t('welcome', { name: 'John', _context: 'formal' }))
// → "We are honored to have you, John"

// Context works across locales
setLocale('ko')
console.log(t('greeting', { _context: 'formal' }))  // → "안녕하십니까"

resetConfig()
clearDictionaries()

// ============================================
// 22. Fallback Value (v0.10.0)
// ============================================

console.log('\n=== Fallback Value (v0.10.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

loadDictionaries({
  en: { greeting: 'Hello', welcome: 'Welcome, {name}!' },
  ko: { greeting: '안녕하세요', welcome: '{name}님 환영합니다!' },
})

// Without fallback: missing key returns raw key
console.log(t('missing.key'))  // → "missing.key"

// With _fallback: returns fallback text instead of raw key
console.log(t('missing.key', { _fallback: 'Default text' }))  // → "Default text"

// When translation exists, _fallback is ignored
console.log(t('greeting', { _fallback: 'Fallback' }))  // → "Hello"

// Empty string fallback
console.log(t('missing.key', { _fallback: '' }))  // → ""

// _fallback works with _context
console.log(t('greeting', { _context: 'unknown', _fallback: 'Hi there' }))  // → "Hello" (base key found)
console.log(t('nonexistent', { _context: 'formal', _fallback: 'Hi there' }))  // → "Hi there"

resetConfig()
clearDictionaries()

// ============================================
// 23. Locale Display Names (v0.11.0)
// ============================================

console.log('\n=== Locale Display Names (v0.11.0) ===\n')

setLocale('en')

// Display locale names in English
console.log(getLocaleDisplayName('ko', 'en'))  // → "Korean"
console.log(getLocaleDisplayName('ja', 'en'))  // → "Japanese"
console.log(getLocaleDisplayName('zh', 'en'))  // → "Chinese"

// Display in native locale
console.log(getLocaleDisplayName('ko', 'ko'))  // → "한국어"
console.log(getLocaleDisplayName('ja', 'ja'))  // → "日本語"

// Uses current locale by default
console.log(getLocaleDisplayName('ko'))  // → "Korean" (current locale is en)

// ============================================
// 24. Translation Key Listing (v0.11.0)
// ============================================

console.log('\n=== Translation Key Listing (v0.11.0) ===\n')

loadDictionaries({
  en: { greeting: { hello: 'Hello', goodbye: 'Goodbye' }, welcome: 'Welcome' },
  ko: { greeting: { hello: '안녕하세요' } },
})

console.log('EN keys:', getTranslationKeys('en'))
// → ['greeting.hello', 'greeting.goodbye', 'welcome']

console.log('KO keys:', getTranslationKeys('ko'))
// → ['greeting.hello']

clearDictionaries()

// ============================================
// 25. Missing Translation Tracker (v0.11.0)
// ============================================

console.log('\n=== Missing Translation Tracker (v0.11.0) ===\n')

loadDictionaries({ en: { greeting: 'Hello' } })

// Enable tracking
trackMissingKeys(true)

t('greeting')      // exists — not tracked
t('missing.key')   // missing — tracked
t('another.miss')  // missing — tracked

console.log('Missing keys:', getMissingKeys())
// → ['missing.key', 'another.miss']

clearMissingKeys()
console.log('After clear:', getMissingKeys())  // → []

trackMissingKeys(false)
resetConfig()
clearDictionaries()

// ============================================
// 26. Locale Change Event (v0.12.0)
// ============================================

console.log('\n=== Locale Change Event (v0.12.0) ===\n')

setLocale('en')

// Subscribe to locale changes
const unsubscribe = onLocaleChange((newLocale, previousLocale) => {
  console.log(`Locale changed: ${previousLocale} → ${newLocale}`)
})

setLocale('ko')  // → "Locale changed: en → ko"
setLocale('ja')  // → "Locale changed: ko → ja"
setLocale('ja')  // (no output — same locale, no change)

// Unsubscribe
unsubscribe()
setLocale('en')  // (no output — unsubscribed)
console.log('After unsubscribe: no output for locale change')

// ============================================
// 27. Formatting Utilities (v0.13.0)
// ============================================

console.log('\n=== Formatting Utilities (v0.13.0) ===\n')

setLocale('en')

// Number formatting
console.log(formatNumber(1234.5))                                    // → "1,234.5"
console.log(formatNumber(42.5, { style: 'currency', currency: 'USD' })) // → "$42.50"
console.log(formatNumber(0.85, { style: 'percent' }))                // → "85%"

// Date formatting
console.log(formatDate(new Date(), { dateStyle: 'medium' }))         // → "Mar 30, 2026"
console.log(formatDate(new Date(), { dateStyle: 'full' }, 'ja'))     // → "2026年3月30日月曜日"

// List formatting
console.log(formatList(['Apple', 'Banana', 'Cherry']))               // → "Apple, Banana, and Cherry"
console.log(formatList(['A', 'B', 'C'], { type: 'disjunction' }))   // → "A, B, or C"

// Explicit locale override
setLocale('ko')
console.log(formatNumber(1234.5, undefined, 'de'))                   // → "1.234,5"

// ============================================
// 28. Raw Template Access (v0.14.0)
// ============================================

console.log('\n=== Raw Template Access (v0.14.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

loadDictionaries({
  en: { welcome: 'Welcome, {name}!', items_one: '{count} item', items_other: '{count} items' },
  ko: { welcome: '{name}님 환영합니다!' },
})

// Returns raw template without interpolation
console.log(tRaw('welcome'))             // → "Welcome, {name}!"
console.log(tRaw('welcome', 'ko'))       // → "{name}님 환영합니다!"
console.log(tRaw('items_other'))         // → "{count} items"

// Returns undefined for missing keys
console.log(tRaw('missing.key'))         // → undefined

resetConfig()
clearDictionaries()

// ============================================
// 29. Batch Translation (v0.15.0)
// ============================================

console.log('\n=== Batch Translation (v0.15.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

loadDictionaries({
  en: { greeting: 'Hello', farewell: 'Goodbye', welcome: 'Welcome, {name}!' },
  ko: { greeting: '안녕하세요', farewell: '안녕히 가세요', welcome: '{name}님 환영합니다!' },
})

// Translate multiple keys at once
console.log(tBatch(['greeting', 'farewell']))
// → { greeting: 'Hello', farewell: 'Goodbye' }

// With shared variables
console.log(tBatch(['greeting', 'welcome'], { name: 'John' }))
// → { greeting: 'Hello', welcome: 'Welcome, John!' }

// With explicit locale
console.log(tBatch(['greeting', 'farewell'], undefined, 'ko'))
// → { greeting: '안녕하세요', farewell: '안녕히 가세요' }

resetConfig()
clearDictionaries()

// ============================================
// 30. Missing Locales Detection (v0.16.0)
// ============================================

console.log('\n=== Missing Locales Detection (v0.16.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

loadDictionaries({
  en: { greeting: 'Hello', farewell: 'Goodbye' },
  ko: { greeting: '안녕하세요' },          // farewell missing
  ja: {},                                  // both missing
})

// Returns locales where key is absent
console.log(getMissingLocales('greeting'))    // → []  (all locales have it)
console.log(getMissingLocales('farewell'))    // → ['ko', 'ja']
console.log(getMissingLocales('nonexistent')) // → ['en', 'ko', 'ja']

resetConfig()
clearDictionaries()

// ============================================
// 31. Translation Completeness Ratio (v0.17.0)
// ============================================

console.log('\n=== Translation Completeness Ratio (v0.17.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

loadDictionaries({
  en: { greeting: 'Hello', farewell: 'Goodbye', welcome: 'Welcome' },
  ko: { greeting: '안녕하세요', farewell: '안녕히 가세요' },  // 2/3 translated
  ja: { greeting: 'こんにちは' },                              // 1/3 translated
})

console.log('en:', getCompletenessRatio('en'))  // → 1     (base locale)
console.log('ko:', getCompletenessRatio('ko'))  // → 0.666...
console.log('ja:', getCompletenessRatio('ja'))  // → 0.333...

// Custom base locale
console.log('en vs ja:', getCompletenessRatio('en', 'ja'))  // → 1 (en has 'greeting')

resetConfig()
clearDictionaries()

// ============================================
// 32. Missing Key Listener (v0.18.0)
// ============================================

console.log('\n=== Missing Key Listener (v0.18.0) ===\n')

resetConfig()
clearDictionaries()
setLocale('en')

loadDictionaries({ en: { greeting: 'Hello' } })

// Subscribe to missing key events
const off = onMissingKey((key, locale) => {
  console.log(`[missing] key="${key}" locale="${locale}"`)
})

t('greeting')         // exists — no event
t('missing.one')      // → "[missing] key=\"missing.one\" locale=\"en\""
t('missing.two', undefined, 'fr')  // → "[missing] key=\"missing.two\" locale=\"fr\""

// Unsubscribe
off()
t('still.missing')    // (no output — listener removed)

resetConfig()
clearDictionaries()

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

v0.9.0 features:
- Context System (t('greeting', { _context: 'formal' }))
- Translation Extraction (extract command)
- CLI Watch Mode (validate --watch, typegen --watch)

v0.10.0 features:
- Fallback Value (t('key', { _fallback: 'Default' }))
- Translation Diff (diff ko en)
- Translation Stats (stats)

v0.11.0 features:
- Locale Display Names (getLocaleDisplayName())
- Translation Key Listing (getTranslationKeys())
- Missing Translation Tracker (trackMissingKeys(), getMissingKeys())

v0.12.0 features:
- Locale Change Event (onLocaleChange(), clearLocaleListeners())

v0.13.0 features:
- Formatting Utilities (formatNumber(), formatDate(), formatList())

v0.14.0 features:
- Raw Template Access (tRaw())

v0.15.0 features:
- Batch Translation (tBatch())

v0.16.0 features:
- Missing Locales Detection (getMissingLocales())

v0.17.0 features:
- Translation Completeness Ratio (getCompletenessRatio())

v0.18.0 features:
- Missing Key Listener (onMissingKey())
`)
