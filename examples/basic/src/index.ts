/**
 * Basic inline-i18n-multi example
 *
 * This example demonstrates:
 * - Inline translations with it()
 * - Key-based translations with t()
 * - Variable interpolation
 * - Plural support
 * - Language pair helpers
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
`)
