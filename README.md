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
- **Build-time optimization** - Zero runtime overhead with Babel/SWC plugins
- **Multiple languages** - Support for any number of locales
- **Framework support** - React, Next.js (App Router & Pages Router)
- **Developer tools** - CLI for validation, VSCode extension for navigation
- **i18n compatible** - Support for traditional key-based translations with JSON dictionaries and plural forms

---

## Packages

| Package | Description |
|---------|-------------|
| [`inline-i18n-multi`](./packages/core) | Core translation functions |
| [`inline-i18n-multi-react`](./packages/react) | React hooks & components |
| [`inline-i18n-multi-next`](./packages/next) | Next.js integration |
| [`@inline-i18n-multi/cli`](./packages/cli) | CLI tools |
| [`@inline-i18n-multi/babel-plugin`](./packages/babel-plugin) | Babel plugin |
| [`@inline-i18n-multi/swc-plugin`](./packages/swc-plugin) | SWC plugin |
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

## Build-Time Optimization

Transform `it()` calls at build time for better performance.

### Babel Plugin

```bash
npm install -D @inline-i18n-multi/babel-plugin
```

```javascript
// babel.config.js
module.exports = {
  plugins: ['@inline-i18n-multi/babel-plugin'],
}
```

### SWC Plugin (Next.js 13+)

```bash
npm install -D @inline-i18n-multi/swc-plugin
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [['@inline-i18n-multi/swc-plugin', {}]],
  },
}
```

**Before (source):**
```typescript
it('안녕하세요', 'Hello')
```

**After (build output):**
```typescript
__i18n_lookup('a1b2c3d4', { ko: '안녕하세요', en: 'Hello' })
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
# ⚠️  Inconsistent translations for "안녕하세요"
#    src/Header.tsx:12  en: "Hello"
#    src/Footer.tsx:8   en: "Hi"
#
# 📭 Missing locales: ja
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
| [`with-react`](./examples/with-react) | React app with Vite |
| [`with-nextjs`](./examples/with-nextjs) | Next.js 15 App Router |

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

Install `inline-i18n-multi-vscode` from the VSCode Marketplace.

### Features

- **Hover info** - See all translations when hovering over `it()` calls
- **Find usages** - Search translations across your entire workspace
- **Quick navigation** - Jump to translation usage with `Cmd+Shift+T`

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
| `loadDictionaries(dicts)` | Load translation dictionaries for multiple locales |
| `loadDictionary(locale, dict)` | Load dictionary for a single locale |
| `hasTranslation(key, locale?)` | Check if translation key exists |
| `getLoadedLocales()` | Get array of loaded locale codes |
| `getDictionary(locale)` | Get dictionary for a specific locale |

### React Hooks & Components

| Export | Description |
|--------|-------------|
| `LocaleProvider` | Context provider for locale |
| `useLocale()` | Hook returning `[locale, setLocale]` |
| `useT()` | Hook returning `t` function bound to current locale |
| `T` | Translation component |

### Types

```typescript
type Locale = string
type Translations = Record<Locale, string>
type TranslationVars = Record<string, string | number>
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
