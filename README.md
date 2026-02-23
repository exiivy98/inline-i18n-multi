# inline-i18n-multi

[![npm version](https://img.shields.io/npm/v/inline-i18n-multi.svg)](https://www.npmjs.com/package/inline-i18n-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Write translations inline. Find them instantly.**

English | [한국어](./README.ko.md) | [日本語](./README.ja.md) | [中文](./README.zh.md)

---

## The Problem

Traditional i18n libraries separate translations from code:

```tsx
// Component.tsx
<p>{t('greeting.hello')}</p>

// en.json
{ "greeting": { "hello": "Hello" } }

// ko.json
{ "greeting": { "hello": "안녕하세요" } }
```

When you see "Hello" in your app and want to find it in the code, you have to:
1. Search for "Hello" in JSON files
2. Find the key `greeting.hello`
3. Search for that key in your code
4. Finally find `t('greeting.hello')`

**This is slow and frustrating.**

---

## The Solution

With `inline-i18n-multi`, translations live in your code:

```tsx
<p>{it('안녕하세요', 'Hello')}</p>
```

See "Hello" in your app? Just search for "Hello" in your codebase. **Done.**

---

## Features

- **Inline translations** - Write translations right where you use them
- **Instant search** - Find any text in your codebase immediately
- **Type-safe** - Full TypeScript support with variable type checking
- **Multiple languages** - Support for any number of locales
- **Framework support** - React, Next.js (App Router & Pages Router)
- **Developer tools** - CLI for validation, VSCode extension for navigation
- **i18n compatible** - Support for traditional key-based translations with JSON dictionaries and plural forms
- **ICU Message Format** - Plural, select, date, number, time, relative time, and list formatting
- **Locale Fallback Chain** - BCP 47 parent locale support (`zh-TW` → `zh` → `en`)
- **Missing Translation Warning** - Development-time diagnostics with customizable handlers
- **Namespace Support** - Organize translations for large apps (`t('common:greeting')`)
- **Debug Mode** - Visual indicators for missing/fallback translations
- **Currency Formatting** - Locale-aware currency display (`{price, currency, USD}`)
- **Compact Number Formatting** - Short number display (`{count, number, compact}`)
- **Rich Text Interpolation** - Embed React components in translations (`<link>text</link>`)
- **Lazy Loading** - Async dictionary loading on demand (`loadAsync()`)
- **Custom Formatter Registry** - Register custom ICU formatters (`registerFormatter('phone', fn)` → `{num, phone}`)
- **Interpolation Guards** - Handle missing variables gracefully (`configure({ missingVarHandler })`)
- **Locale Detection** - Automatic locale detection from cookies/navigator (`detectLocale()` + React `useDetectedLocale()`)
- **Selectordinal** - Full ICU `selectordinal` support for ordinal plurals (`{n, selectordinal, ...}`)
- **ICU Message Cache** - Memoize parsed ICU ASTs for performance (`configure({ icuCacheSize: 500 })`)
- **Plural Shorthand** - Concise plural syntax (`{count, p, item|items}`)
- **Locale Persistence** - Auto-save/restore locale to cookie or localStorage
- **CLI `--strict` Mode** - ICU type consistency checking (`npx inline-i18n validate --strict`)
- **Translation Scope** - Create scoped `t()` functions for namespaces (`createScope('common')`)
- **Unused Key Detection** - CLI detects unused dictionary keys (`npx inline-i18n validate --unused`)
- **TypeScript Type Generation** - Generate `.d.ts` for `t()` key autocomplete (`npx inline-i18n typegen`)

---

## Packages

| Package | Description |
|---------|-------------|
| [`inline-i18n-multi`](./packages/core) | Core translation functions |
| [`inline-i18n-multi-react`](./packages/react) | React hooks & components |
| [`inline-i18n-multi-next`](./packages/next) | Next.js integration |
| [`@inline-i18n-multi/cli`](./packages/cli) | CLI tools |
| [`inline-i18n-multi-vscode`](./packages/vscode) | VSCode extension |

---

## Quick Start

### Installation

```bash
# npm
npm install inline-i18n-multi

# yarn
yarn add inline-i18n-multi

# pnpm
pnpm add inline-i18n-multi
```

### Basic Usage

```typescript
import { it, setLocale } from 'inline-i18n-multi'

// Set current locale
setLocale('en')

// Shorthand syntax (Korean + English)
it('안녕하세요', 'Hello')  // → "Hello"

// Object syntax (multiple languages)
it({ ko: '안녕하세요', en: 'Hello', ja: 'こんにちは' })  // → "Hello"

// With variables
it('안녕, {name}님', 'Hello, {name}', { name: 'John' })  // → "Hello, John"
```

---

## Key-Based Translations (i18n Compatible)

For projects that already use JSON translation files, or when you need traditional key-based translations:

```typescript
import { t, loadDictionaries } from 'inline-i18n-multi'

// Load translation dictionaries
loadDictionaries({
  en: {
    greeting: { hello: 'Hello', goodbye: 'Goodbye' },
    items: { count_one: '{count} item', count_other: '{count} items' },
    welcome: 'Welcome, {name}!'
  },
  ko: {
    greeting: { hello: '안녕하세요', goodbye: '안녕히 가세요' },
    items: { count_other: '{count}개 항목' },
    welcome: '환영합니다, {name}님!'
  }
})

// Basic key-based translation
t('greeting.hello')  // → "Hello" (when locale is 'en')

// With variables
t('welcome', { name: 'John' })  // → "Welcome, John!"

// Plural support (uses Intl.PluralRules)
t('items.count', { count: 1 })  // → "1 item"
t('items.count', { count: 5 })  // → "5 items"

// Override locale
t('greeting.hello', undefined, 'ko')  // → "안녕하세요"
```

### Utility Functions

```typescript
import { hasTranslation, getLoadedLocales, getDictionary } from 'inline-i18n-multi'

// Check if translation exists
hasTranslation('greeting.hello')  // → true
hasTranslation('missing.key')     // → false

// Get loaded locales
getLoadedLocales()  // → ['en', 'ko']

// Get dictionary for a locale
getDictionary('en')  // → { greeting: { hello: 'Hello', ... }, ... }
```

---

## React Integration

```bash
npm install inline-i18n-multi-react
```

```tsx
import { LocaleProvider, useLocale, it, T } from 'inline-i18n-multi-react'

function App() {
  return (
    <LocaleProvider locale="en">
      <MyComponent />
    </LocaleProvider>
  )
}

function MyComponent() {
  const [locale, setLocale] = useLocale()

  return (
    <div>
      {/* Function syntax */}
      <h1>{it('제목', 'Title')}</h1>

      {/* Component syntax */}
      <T ko="환영합니다" en="Welcome" />

      {/* With variables */}
      <T ko="{count}개의 항목" en="{count} items" count={5} />

      {/* Locale switcher */}
      <button onClick={() => setLocale('ko')}>한국어</button>
      <button onClick={() => setLocale('en')}>English</button>
    </div>
  )
}
```

### useT Hook (Key-Based)

```tsx
import { useT, loadDictionaries } from 'inline-i18n-multi-react'

// Load dictionaries (typically in app entry)
loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ko: { greeting: '안녕하세요', items: { count_other: '{count}개 항목' } }
})

function MyComponent() {
  const t = useT()

  return (
    <div>
      <p>{t('greeting')}</p>
      <p>{t('items.count', { count: 5 })}</p>
    </div>
  )
}
```

---

## Next.js Integration

```bash
npm install inline-i18n-multi-next
```

### App Router (Server Components)

```tsx
// app/page.tsx
import { it } from 'inline-i18n-multi-next/server'

export default async function Page() {
  return <h1>{await it('안녕하세요', 'Hello')}</h1>
}
```

### Server Components with Key-Based Translations

```tsx
// app/[locale]/page.tsx
import { t, setLocale, loadDictionaries } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ko: { greeting: '안녕하세요', items: { count_other: '{count}개' } },
})

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setLocale(locale)  // Required before using t()

  return (
    <div>
      <h1>{t('greeting')}</h1>
      <p>{t('items.count', { count: 5 })}</p>
    </div>
  )
}
```

### App Router (Client Components)

```tsx
'use client'
import { it, LocaleProvider } from 'inline-i18n-multi-next/client'

export default function ClientComponent() {
  return <p>{it('클라이언트', 'Client')}</p>
}
```

### Client Components with Key-Based Translations

```tsx
'use client'
import { useT, loadDictionaries } from 'inline-i18n-multi-next/client'

loadDictionaries({
  en: { nav: { home: 'Home', about: 'About' } },
  ko: { nav: { home: '홈', about: '소개' } }
})

export default function NavMenu() {
  const t = useT()
  return <nav><a href="/">{t('nav.home')}</a></nav>
}
```

### Middleware (Locale Detection)

```typescript
// middleware.ts
import { createI18nMiddleware } from 'inline-i18n-multi-next/middleware'

export default createI18nMiddleware({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

### SEO Optimization (App Router)

Server utilities for full SEO support in Next.js App Router:

```tsx
// app/[locale]/layout.tsx
import { configureI18n, generateLocaleParams, createMetadata, getAlternates } from 'inline-i18n-multi-next/server'

// Configure i18n
configureI18n({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
  baseUrl: 'https://example.com'
})

// SSG: Pre-render all locales
export function generateStaticParams() {
  return generateLocaleParams()  // → [{ locale: 'ko' }, { locale: 'en' }, { locale: 'ja' }]
}

// Dynamic metadata
export async function generateMetadata({ params }) {
  const { locale } = await params

  return createMetadata(
    {
      title: { ko: '홈', en: 'Home', ja: 'ホーム' },
      description: { ko: '환영합니다', en: 'Welcome', ja: 'ようこそ' },
    },
    locale,
    ''  // current pathname
  )
}

// Hreflang links (for SEO)
const alternates = getAlternates('/about', 'ko')
// → {
//   canonical: 'https://example.com/ko/about',
//   languages: {
//     ko: 'https://example.com/ko/about',
//     en: 'https://example.com/en/about',
//     ja: 'https://example.com/ja/about',
//     'x-default': 'https://example.com/ko/about'
//   }
// }
```

**SEO Features:**
- **SSG/SSR** - Pre-render all locales with `generateStaticParams()`
- **Dynamic Metadata** - Per-locale title/description with `createMetadata()`
- **Hreflang** - Language alternate links for search engines with `getAlternates()`
- **Cookie Persistence** - Automatically saved when `setLocale()` is called
- **URL Routing** - SEO-friendly URLs with `/[locale]/...` pattern

---

## Language Pair Helpers

For common language combinations, use the shorthand helpers:

```typescript
import { it_ja, en_zh, ja_es } from 'inline-i18n-multi'

// Korean ↔ Japanese
it_ja('안녕하세요', 'こんにちは')

// English ↔ Chinese
en_zh('Hello', '你好')

// Japanese ↔ Spanish
ja_es('こんにちは', 'Hola')
```

Available helpers:
- `it` (ko↔en), `it_ja`, `it_zh`, `it_es`, `it_fr`, `it_de`
- `en_ja`, `en_zh`, `en_es`, `en_fr`, `en_de`
- `ja_zh`, `ja_es`, `zh_es`

---

## ICU Message Format

For complex translations with plurals, conditional text, and formatting:

```typescript
import { it, setLocale } from 'inline-i18n-multi'

setLocale('en')

// Plural
it({
  ko: '{count, plural, =0 {항목 없음} other {# 개}}',
  en: '{count, plural, =0 {No items} one {# item} other {# items}}'
}, { count: 0 })  // → "No items"

it({
  ko: '{count, plural, =0 {항목 없음} other {# 개}}',
  en: '{count, plural, =0 {No items} one {# item} other {# items}}'
}, { count: 1 })  // → "1 item"

it({
  ko: '{count, plural, =0 {항목 없음} other {# 개}}',
  en: '{count, plural, =0 {No items} one {# item} other {# items}}'
}, { count: 5 })  // → "5 items"

// Select
it({
  ko: '{gender, select, male {그} female {그녀} other {그들}}',
  en: '{gender, select, male {He} female {She} other {They}}'
}, { gender: 'female' })  // → "She"

// Combined with text
it({
  ko: '{name}님이 {count, plural, =0 {메시지가 없습니다} other {# 개의 메시지가 있습니다}}',
  en: '{name} has {count, plural, =0 {no messages} one {# message} other {# messages}}'
}, { name: 'John', count: 3 })  // → "John has 3 messages"
```

### Date, Number, and Time Formatting

ICU also supports locale-aware date, number, and time formatting:

```typescript
// Number formatting
it({
  en: 'Price: {price, number}',
  ko: '가격: {price, number}'
}, { price: 1234.56 })  // → "Price: 1,234.56"

it({
  en: 'Discount: {rate, number, percent}',
  ko: '할인율: {rate, number, percent}'
}, { rate: 0.25 })  // → "Discount: 25%"

// Date formatting
it({
  en: 'Created: {date, date, long}',
  ko: '생성일: {date, date, long}'
}, { date: new Date('2024-03-15') })  // → "Created: March 15, 2024"

it({
  en: 'Due: {date, date, short}',
  ko: '마감: {date, date, short}'
}, { date: new Date() })  // → "Due: 3/15/24"

// Time formatting
it({
  en: 'Time: {time, time, short}',
  ko: '시간: {time, time, short}'
}, { time: new Date() })  // → "Time: 2:30 PM"

// Combined
it({
  en: 'Order on {date, date, short}: {total, number, currency}',
  ko: '{date, date, short} 주문: {total, number, currency}'
}, { date: new Date(), total: 99.99 })
```

**Supported styles:**
- `number`: `decimal`, `percent`, `integer`, `currency`, `compact`, `compactLong`
- `date`: `short`, `medium`, `long`, `full`
- `time`: `short`, `medium`, `long`, `full`

### Relative Time Formatting

Human-readable relative time with automatic unit detection:

```typescript
// Relative time
it({
  en: 'Updated {time, relativeTime}',
  ko: '{time, relativeTime} 업데이트됨'
}, { time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) })
// → "Updated 3 days ago" / "3일 전 업데이트됨"

// Style options: long (default), short, narrow
it({ en: '{time, relativeTime, short}' }, { time: pastDate })
// → "3d ago"

it({ en: '{time, relativeTime, narrow}' }, { time: pastDate })
// → "3d ago"
```

### List Formatting

Locale-aware list joining:

```typescript
// List (conjunction - "and")
it({
  en: 'Invited: {names, list}',
  ko: '초대됨: {names, list}'
}, { names: ['Alice', 'Bob', 'Charlie'] })
// en → "Invited: Alice, Bob, and Charlie"
// ko → "초대됨: Alice, Bob, Charlie"

// Disjunction ("or")
it({ en: '{options, list, disjunction}' }, { options: ['A', 'B', 'C'] })
// → "A, B, or C"

// Unit (no conjunction)
it({ en: '{items, list, unit}' }, { items: ['10kg', '5m', '3L'] })
// → "10kg, 5m, 3L"
```

### Currency Formatting

Locale-aware currency formatting with automatic symbol detection:

```typescript
// Currency formatting
it({
  en: 'Total: {price, currency, USD}',
  ko: '합계: {price, currency, KRW}'
}, { price: 42000 })
// en → "Total: $42,000.00"
// ko → "합계: ₩42,000"

// EUR for German locale
it({ de: '{price, currency, EUR}' }, { price: 1234.5 })
// → "1.234,50 €"

// Defaults to USD when currency code omitted
it({ en: '{price, currency}' }, { price: 100 })
// → "$100.00"
```

### Compact Number Formatting

Short number display for large values:

```typescript
// Compact (short)
it({
  en: '{count, number, compact} views',
  ko: '{count, number, compact} 조회'
}, { count: 1500000 })
// en → "1.5M views"
// ko → "150만 조회"

// Compact (long)
it({ en: '{count, number, compactLong}' }, { count: 1500000 })
// → "1.5 million"
```

---

## Namespace Support

Organize translations for large applications:

```typescript
import { loadDictionaries, t, getLoadedNamespaces, clearDictionaries } from 'inline-i18n-multi'

// Load with namespace
loadDictionaries({
  en: { hello: 'Hello', goodbye: 'Goodbye' },
  ko: { hello: '안녕하세요', goodbye: '안녕히 가세요' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme' },
  ko: { title: '설정', theme: '테마' }
}, 'settings')

// Use with namespace prefix
t('common:hello')      // → "Hello"
t('settings:title')    // → "Settings"

// Nested keys work too
t('common:buttons.submit')

// Without namespace = 'default' (backward compatible)
loadDictionaries({ en: { greeting: 'Hi' } })
t('greeting')  // → "Hi"

// Get all loaded namespaces
getLoadedNamespaces()  // → ['common', 'settings', 'default']

// Clear specific namespace
clearDictionaries('settings')

// Clear all
clearDictionaries()
```

---

## Debug Mode

Visual indicators for debugging missing and fallback translations:

```typescript
import { configure, setLocale, it, t } from 'inline-i18n-multi'

// Enable debug mode
configure({ debugMode: true })

// Missing translation shows prefix
setLocale('fr')
it({ en: 'Hello', ko: '안녕하세요' })
// → "[fr -> en] Hello"

t('missing.key')
// → "[MISSING: en] missing.key"

// Custom format
configure({
  debugMode: {
    showMissingPrefix: true,
    showFallbackPrefix: true,
    missingPrefixFormat: (locale, key) => `[!${locale}] `,
    fallbackPrefixFormat: (from, to) => `[${from}=>${to}] `,
  }
})
```

---

## Rich Text Interpolation

Embed React components within translations:

```tsx
import { RichText, useRichText } from 'inline-i18n-multi-react'

// Component syntax
<RichText
  translations={{
    en: 'Read <link>terms</link> and <bold>agree</bold>',
    ko: '<link>약관</link>을 읽고 <bold>동의</bold>해주세요'
  }}
  components={{
    link: (text) => <a href="/terms">{text}</a>,
    bold: (text) => <strong>{text}</strong>
  }}
/>

// Hook syntax
const richT = useRichText({
  link: (text) => <a href="/terms">{text}</a>,
  bold: (text) => <strong>{text}</strong>
})
richT({ en: 'Click <link>here</link>', ko: '<link>여기</link> 클릭' })
```

---

## Lazy Loading

Load dictionaries asynchronously on demand:

```typescript
import { configure, loadAsync, isLoaded, t } from 'inline-i18n-multi'

// Configure loader
configure({
  loader: (locale, namespace) => import(`./locales/${locale}/${namespace}.json`)
})

// Load on demand
await loadAsync('ko', 'dashboard')
t('dashboard:title')

// Check loading state
isLoaded('ko', 'dashboard')  // → true
```

### React Hook

```tsx
import { useLoadDictionaries } from 'inline-i18n-multi-react'

function Dashboard() {
  const { isLoading, error } = useLoadDictionaries('ko', 'dashboard')
  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <Content />
}
```

---

## Custom Formatter Registry

Register custom ICU format functions for domain-specific formatting:

```typescript
import { registerFormatter, it } from 'inline-i18n-multi'

registerFormatter('phone', (value, locale, style?) => {
  const s = String(value)
  return `(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6)}`
})

it({ en: 'Call {num, phone}' }, { num: '2125551234' })
// → "Call (212) 555-1234"
```

Once registered, custom formatters can be used in any ICU message pattern with the syntax `{variable, formatterName}`.

---

## Interpolation Guards

Handle missing variables gracefully instead of leaving raw `{varName}` placeholders:

```typescript
import { configure, it } from 'inline-i18n-multi'

configure({
  missingVarHandler: (varName, locale) => `[${varName}]`
})

it({ en: 'Hello {name}' })
// → "Hello [name]" (instead of "Hello {name}")
```

This is useful in development to catch missing variables early, or in production to provide a safe fallback display.

---

## Locale Detection

Automatically detect the user's preferred locale from multiple sources:

```typescript
import { detectLocale, setLocale } from 'inline-i18n-multi'

const locale = detectLocale({
  supportedLocales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
  sources: ['cookie', 'navigator'],
  cookieName: 'NEXT_LOCALE',
})
setLocale(locale)
```

### React Hook

```tsx
import { useDetectedLocale } from 'inline-i18n-multi-react'

function App() {
  useDetectedLocale({
    supportedLocales: ['en', 'ko'],
    defaultLocale: 'en',
    sources: ['cookie', 'navigator'],
  })
}
```

**Detection sources** (checked in order):
- `cookie` - Read from a named cookie (e.g., `NEXT_LOCALE`)
- `navigator` - Read from `navigator.languages` / `navigator.language`

---

## ICU Message Cache

Memoize parsed ICU ASTs to avoid re-parsing the same message patterns:

```typescript
import { configure, clearICUCache } from 'inline-i18n-multi'

// Configure cache size (default: 500, set 0 to disable)
configure({ icuCacheSize: 500 })

// Uses FIFO eviction when the cache is full
// Repeated messages are served from cache for better performance

// Manually clear the cache
clearICUCache()
```

The cache is enabled by default with a size of 500 entries. When the cache is full, the oldest entry is evicted (FIFO). Set `icuCacheSize: 0` to disable caching entirely.

---

## Plural Shorthand

A concise syntax for common plural patterns, using `p` as the type:

```typescript
import { it, setLocale } from 'inline-i18n-multi'

setLocale('en')

// 2-part: singular | plural
it({
  en: '{count, p, item|items}',
  ko: '{count, p, 항목|항목}'
}, { count: 1 })  // → "1 item"

it({
  en: '{count, p, item|items}',
  ko: '{count, p, 항목|항목}'
}, { count: 5 })  // → "5 items"

// 3-part: zero | singular | plural
it({
  en: '{count, p, none|item|items}',
  ko: '{count, p, 없음|항목|항목}'
}, { count: 0 })  // → "none"

it({
  en: '{count, p, none|item|items}',
  ko: '{count, p, 없음|항목|항목}'
}, { count: 1 })  // → "1 item"

it({
  en: '{count, p, none|item|items}',
  ko: '{count, p, 없음|항목|항목}'
}, { count: 5 })  // → "5 items"
```

The `p` type is syntactic sugar over ICU `plural`. The 2-part form `{count, p, item|items}` expands to `{count, plural, one {# item} other {# items}}`, and the 3-part form adds a `=0` branch.

---

## Locale Persistence

Automatically save and restore the user's locale preference:

```typescript
import { configure, setLocale, restoreLocale } from 'inline-i18n-multi'

// Configure persistence
configure({
  persistLocale: {
    storage: 'cookie',       // 'cookie' | 'localStorage'
    key: 'LOCALE',           // storage key name
    expires: 365,            // cookie expiry in days (cookie only)
  }
})

// Restore locale from storage (returns saved locale or undefined)
const saved = restoreLocale()
if (!saved) {
  setLocale('en')  // default if nothing saved
}

// setLocale() auto-saves to configured storage
setLocale('ko')  // saves 'ko' to cookie/localStorage
```

### localStorage

```typescript
configure({
  persistLocale: {
    storage: 'localStorage',
    key: 'APP_LOCALE',
  }
})
```

When `persistLocale` is configured, every `setLocale()` call automatically writes the locale to the specified storage. Use `restoreLocale()` at app startup to read the saved value.

---

## CLI `--strict` Mode

Validate ICU type consistency across all translations:

```bash
npx inline-i18n validate --strict

# Output:
# ICU type mismatch in src/Dashboard.tsx:25
#    en: {count, plural, one {# item} other {# items}}
#    ko: {count, number}
#    Variable "count" used as "plural" in en but "number" in ko
#
# 148 translations checked, 1 error found
```

The `--strict` flag ensures that ICU variable types (`plural`, `select`, `number`, `date`, etc.) are consistent across all locale variants of each translation. This catches subtle bugs where a variable is treated as a different type in different languages.

---

## Translation Scope

Create scoped `t()` functions to avoid repeating namespace prefixes:

```typescript
import { createScope, loadDictionaries, setLocale } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', nav: { home: 'Home', about: 'About' } },
  ko: { greeting: '안녕하세요', nav: { home: '홈', about: '소개' } },
}, 'common')

const tc = createScope('common')
tc('greeting')    // → "Hello" (same as t('common:greeting'))
tc('nav.home')    // → "Home"

// React hook
import { useScopedT } from 'inline-i18n-multi-react'
const tc = useScopedT('common')
```

A scoped function is equivalent to calling `t('namespace:key')` but removes the repetition when many keys share the same namespace. This is especially useful in large components that reference a single namespace heavily.

---

## CLI Unused Key Detection

Detect dictionary keys that are not referenced anywhere in your source code:

```bash
npx inline-i18n validate --unused
```

The `--unused` flag scans your codebase for `t()` and `createScope()` calls and compares them against all loaded dictionary keys. Any key that is defined in a dictionary but never referenced in code is reported, helping you keep translation files clean and free of dead entries.

---

## TypeScript Type Generation

Generate a `.d.ts` file so that `t()` keys are autocompleted in your editor:

```bash
npx inline-i18n typegen
npx inline-i18n typegen --output src/types/i18n.d.ts
```

Generated file example:

```typescript
declare module 'inline-i18n-multi' {
  export type TranslationKey = 'greeting' | 'nav.home' | 'common:title'
  export function t(key: TranslationKey, vars?: TranslationVars, locale?: string): string
}
```

Run this command after updating your dictionaries to keep types in sync. The generated module augmentation narrows the `key` parameter of `t()` to the exact union of keys found in your dictionaries, giving you compile-time safety and editor autocomplete.

---

## Configuration

Configure global settings for fallback behavior and warnings:

```typescript
import { configure, resetConfig, getConfig } from 'inline-i18n-multi'

configure({
  // Final fallback locale (default: 'en')
  fallbackLocale: 'en',

  // Auto-derive parent locale from BCP 47 tags (default: true)
  // zh-TW → zh → fallbackLocale
  autoParentLocale: true,

  // Custom fallback chains for specific locales
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en'],  // Portuguese (Brazil) → Portuguese → Spanish → English
  },

  // ICU message cache size (default: 500, 0 to disable)
  icuCacheSize: 500,

  // Locale persistence (auto-save/restore)
  persistLocale: {
    storage: 'cookie',    // 'cookie' | 'localStorage'
    key: 'LOCALE',
    expires: 365,         // cookie expiry in days (cookie only)
  },

  // Enable missing translation warnings (default: true in dev mode)
  warnOnMissing: true,

  // Custom warning handler
  onMissingTranslation: (warning) => {
    console.warn(`Missing: ${warning.requestedLocale}`, warning)
  },
})

// Reset to defaults
resetConfig()

// Get current config
const config = getConfig()
```

### Locale Fallback Chain

Automatic locale fallback with BCP 47 parent locale support:

```typescript
import { setLocale, it, t, loadDictionaries } from 'inline-i18n-multi'

// Auto BCP 47 fallback: zh-TW → zh → en
setLocale('zh-TW')
it({ en: 'Hello', zh: '你好' })  // → '你好' (falls back to zh)

// Works with t() too
loadDictionaries({
  en: { greeting: 'Hello' },
  zh: { greeting: '你好' },
})
setLocale('zh-TW')
t('greeting')  // → '你好'

// Custom fallback chain
configure({
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en']
  }
})
setLocale('pt-BR')
it({ en: 'Hello', es: 'Hola' })  // → 'Hola' (falls back through chain)
```

### Missing Translation Warnings

Get notified when translations are missing:

```typescript
import { configure, setLocale, it } from 'inline-i18n-multi'

configure({
  warnOnMissing: true,
  onMissingTranslation: (warning) => {
    // warning: {
    //   type: 'missing_translation',
    //   requestedLocale: 'fr',
    //   availableLocales: ['en', 'ko'],
    //   fallbackUsed: 'en',
    //   key: 'greeting'  // for t() only
    // }
    console.warn(`Missing translation for ${warning.requestedLocale}`)
  }
})

setLocale('fr')
it({ en: 'Hello', ko: '안녕하세요' })  // Warns: Missing translation for fr
```

---

## CLI Tools

```bash
npm install -D @inline-i18n-multi/cli
```

### Find Translations

Search for any text in your translations:

```bash
npx inline-i18n find "Hello"

# Output:
# src/components/Header.tsx:12:5
#   ko: 안녕하세요
#   en: Hello
```

### Validate Translations

Check for inconsistencies:

```bash
npx inline-i18n validate --locales ko,en,ja

# Output:
# Inconsistent translations for "안녕하세요"
#    src/Header.tsx:12  en: "Hello"
#    src/Footer.tsx:8   en: "Hi"
#
# Missing locales: ja
#    src/About.tsx:15
```

### Coverage Report

```bash
npx inline-i18n coverage --locales ko,en,ja

# Output:
# Translation Coverage:
#
# Locale  Coverage   Translated
# ─────────────────────────────
# ko      ██████████ 100%  150/150
# en      ██████████ 100%  150/150
# ja      ████░░░░░░  40%   60/150
```

---

## Examples

Check out the example projects in the [`examples/`](./examples) directory:

| Example | Description |
|---------|-------------|
| [`basic`](./examples/basic) | Basic TypeScript usage |
| [`react`](./examples/react) | React app with Vite |
| [`nextjs`](./examples/nextjs) | Next.js 15 App Router |

### Run Examples

```bash
# Clone and install
git clone https://github.com/exiivy98/inline-i18n-multi.git
cd inline-i18n-multi
pnpm install

# Run basic example
pnpm --filter inline-i18n-multi-basic-example start

# Run React example
pnpm --filter inline-i18n-multi-react-example dev

# Run Next.js example
pnpm --filter inline-i18n-multi-nextjs-example dev
```

---

## VSCode Extension

> **Note:** The VSCode extension will be available on the Marketplace soon.

Install `inline-i18n-multi-vscode` from the VSCode Marketplace.

### Features

- **Hover info** - See all translations when hovering over `it()` calls
- **Find usages** - Search translations across your entire workspace
- **Quick navigation** - Jump to translation usage with `Cmd+Shift+T`

---

## Testing

Tests are run using Vitest.

```bash
# Run all package tests
pnpm test

# Run specific package tests
pnpm --filter inline-i18n-multi test        # core
pnpm --filter inline-i18n-multi-next test   # next

# For CI (run once)
pnpm test -- --run
```

### Test Coverage

| Package | Tests | Status |
|---------|-------|--------|
| `inline-i18n-multi` (core) | 182 | Passed |
| `inline-i18n-multi-next` (server) | 16 | Passed |

See [Testing Documentation](./docs/test.md) for more details.

---

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `it(ko, en, vars?)` | Translate with Korean and English |
| `it(translations, vars?)` | Translate with object syntax |
| `setLocale(locale)` | Set current locale |
| `getLocale()` | Get current locale |
| `t(key, vars?, locale?)` | Key-based translation with optional locale override |
| `loadDictionaries(dicts, namespace?)` | Load translation dictionaries with optional namespace |
| `loadDictionary(locale, dict, namespace?)` | Load dictionary for a single locale with optional namespace |
| `hasTranslation(key, locale?)` | Check if translation key exists (supports namespace:key) |
| `getLoadedLocales()` | Get array of loaded locale codes |
| `getLoadedNamespaces()` | Get array of loaded namespace names |
| `getDictionary(locale, namespace?)` | Get dictionary for a specific locale and namespace |
| `clearDictionaries(namespace?)` | Clear dictionaries (all or specific namespace) |
| `configure(options)` | Configure global settings (fallback, warnings, debug, cache, persistence) |
| `getConfig()` | Get current configuration |
| `resetConfig()` | Reset configuration to defaults |
| `clearICUCache()` | Clear the ICU message parse cache |
| `restoreLocale()` | Restore locale from configured storage (cookie/localStorage) |
| `registerFormatter(name, fn)` | Register a custom ICU formatter |
| `detectLocale(options)` | Detect locale from cookies/navigator |
| `loadAsync(locale, namespace?)` | Asynchronously load dictionary using configured loader |
| `isLoaded(locale, namespace?)` | Check if dictionary has been loaded |
| `createScope(namespace)` | Create a scoped `t()` function bound to a namespace |
| `parseRichText(template, names)` | Parse rich text template into segments |

### React Hooks & Components

| Export | Description |
|--------|-------------|
| `LocaleProvider` | Context provider for locale |
| `useLocale()` | Hook returning `[locale, setLocale]` |
| `useT()` | Hook returning `t` function bound to current locale |
| `T` | Translation component |
| `RichText` | Rich text translation component with embedded components |
| `useRichText(components)` | Hook returning function for rich text translations |
| `useLoadDictionaries(locale, ns?)` | Hook for lazy loading dictionaries with loading state |
| `useDetectedLocale(options)` | Hook for automatic locale detection and setting |
| `useScopedT(namespace)` | Hook returning a scoped `t` function bound to a namespace |

### Types

```typescript
type Locale = string
type Translations = Record<Locale, string>
type TranslationVars = Record<string, string | number | Date | string[]>

interface Config {
  defaultLocale: Locale
  fallbackLocale?: Locale
  autoParentLocale?: boolean
  fallbackChain?: Record<Locale, Locale[]>
  warnOnMissing?: boolean
  onMissingTranslation?: WarningHandler
  debugMode?: boolean | DebugModeOptions
  loader?: (locale: Locale, namespace: string) => Promise<Record<string, unknown>>
  missingVarHandler?: (varName: string, locale: string) => string
  icuCacheSize?: number
  persistLocale?: PersistLocaleOptions
}

interface PersistLocaleOptions {
  storage: 'cookie' | 'localStorage'
  key?: string       // default: 'LOCALE'
  expires?: number   // cookie expiry in days (default: 365, cookie only)
}

interface DebugModeOptions {
  showMissingPrefix?: boolean
  showFallbackPrefix?: boolean
  missingPrefixFormat?: (locale: string, key?: string) => string
  fallbackPrefixFormat?: (requestedLocale: string, usedLocale: string, key?: string) => string
}

interface TranslationWarning {
  type: 'missing_translation'
  key?: string
  requestedLocale: string
  availableLocales: string[]
  fallbackUsed?: string
}

type WarningHandler = (warning: TranslationWarning) => void

interface RichTextSegment {
  type: 'text' | 'component'
  content: string
  componentName?: string
}

type ScopedT = (key: string, vars?: TranslationVars, locale?: string) => string
```

---

## Why Inline Translations?

### Traditional i18n

```
Code → Key → JSON file → Translation
          ↑
     Hard to trace
```

### Inline i18n

```
Code ← Translation (same place!)
```

| Aspect | Traditional | Inline |
|--------|-------------|--------|
| Finding text in code | Hard (key lookup) | Easy (direct search) |
| Adding translations | Create key, add to JSON | Write inline |
| Refactoring | Update key references | Automatic |
| Code review | Check JSON separately | All visible in diff |
| Type safety | Limited | Full support |

---

## Requirements

- Node.js 18+
- TypeScript 5.0+ (recommended)
- React 18+ (for React package)
- Next.js 13+ (for Next.js package)

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

```bash
# Clone the repo
git clone https://github.com/exiivy98/inline-i18n-multi.git

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

---

## Disclaimer

This software is provided "as is", without warranty of any kind. The authors are not responsible for any damages or issues arising from the use of this package. Use at your own risk.

---

## License

MIT © [exiivy98](https://github.com/exiivy98)
