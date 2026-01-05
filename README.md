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

### React Hooks & Components

| Export | Description |
|--------|-------------|
| `LocaleProvider` | Context provider for locale |
| `useLocale()` | Hook returning `[locale, setLocale]` |
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

## License

MIT © [exiivy98](https://github.com/exiivy98)
