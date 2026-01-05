# inline-i18n-multi

[![npm version](https://img.shields.io/npm/v/inline-i18n-multi.svg)](https://www.npmjs.com/package/inline-i18n-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Write translations inline. Find them instantly.**

> For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

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
- **i18n compatible** - Support for traditional key-based translations with JSON dictionaries
- **Plural support** - Built-in plural forms using `Intl.PluralRules`
- **Variable interpolation** - `{name}` syntax for dynamic values

---

## Installation

```bash
# npm
npm install inline-i18n-multi

# yarn
yarn add inline-i18n-multi

# pnpm
pnpm add inline-i18n-multi
```

---

## Quick Start

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

---

## Utility Functions

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

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `it(ko, en, vars?)` | Translate with Korean and English |
| `it(translations, vars?)` | Translate with object syntax |
| `setLocale(locale)` | Set current locale |
| `getLocale()` | Get current locale |

### Key-Based Translation

| Function | Description |
|----------|-------------|
| `t(key, vars?, locale?)` | Key-based translation with optional locale override |
| `loadDictionaries(dicts)` | Load translation dictionaries for multiple locales |
| `loadDictionary(locale, dict)` | Load dictionary for a single locale |
| `hasTranslation(key, locale?)` | Check if translation key exists |
| `getLoadedLocales()` | Get array of loaded locale codes |
| `getDictionary(locale)` | Get dictionary for a specific locale |

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

## Framework Integrations

### React

React hooks and components for inline translations. Includes `LocaleProvider` for context management, `useLocale()` hook for locale state, and `T` component for JSX translations. Automatic cookie persistence when locale changes.

```bash
npm install inline-i18n-multi-react
```

[View React package →](https://www.npmjs.com/package/inline-i18n-multi-react)

### Next.js

Full Next.js App Router integration with SSR/SSG support. Server Components use async `it()`, Client Components use React bindings. Includes SEO utilities: `createMetadata()` for dynamic metadata, `getAlternates()` for hreflang links, and `createI18nMiddleware()` for locale detection.

```bash
npm install inline-i18n-multi-next
```

[View Next.js package →](https://www.npmjs.com/package/inline-i18n-multi-next)

---

## Build-Time Optimization

### Babel Plugin

Transform `it()` calls at build time for better performance. Extracts translations for static analysis and enables dead code elimination for unused locales.

```bash
npm install -D @inline-i18n-multi/babel-plugin
```

[View Babel plugin →](https://www.npmjs.com/package/@inline-i18n-multi/babel-plugin)

### SWC Plugin

SWC plugin for Next.js 13+ projects. Faster than Babel with the same optimization benefits. Configure in `next.config.js` under `experimental.swcPlugins`.

```bash
npm install -D @inline-i18n-multi/swc-plugin
```

[View SWC plugin →](https://www.npmjs.com/package/@inline-i18n-multi/swc-plugin)

---

## Developer Tools

### CLI

Command-line tools for translation management. Find translations with `inline-i18n find "text"`, validate consistency with `inline-i18n validate`, and generate coverage reports with `inline-i18n coverage`.

```bash
npm install -D @inline-i18n-multi/cli
```

[View CLI package →](https://www.npmjs.com/package/@inline-i18n-multi/cli)

---

## Requirements

- Node.js 18+
- TypeScript 5.0+ (recommended)

---

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for:
- Complete API reference
- Framework integrations (React, Next.js)
- Build-time optimization
- CLI tools
- Best practices and examples

---

## License

MIT
