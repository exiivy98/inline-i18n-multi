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
    console.log(`⚠️  Warning: Missing translation`)
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
`)
