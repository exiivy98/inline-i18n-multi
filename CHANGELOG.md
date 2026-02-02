# Changelog

All notable changes to this project will be documented in this file.

## [0.5.0] - 2026-02-02

### Added

- **Currency Formatting** - Locale-aware currency display
  - ICU format: `{price, currency, USD}` → "$42,000.00"
  - Auto-detects currency symbol per locale: `{price, currency, KRW}` → "₩42,000"
  - Defaults to USD when currency code omitted
  - Locale-aware via `Intl.NumberFormat`
- **Compact Number Formatting** - Short number display
  - ICU format: `{count, number, compact}` → "1.5M" / "150만"
  - Long format: `{count, number, compactLong}` → "1.5 million"
  - Locale-aware via `Intl.NumberFormat` with compact notation
- **Rich Text Interpolation** - Embed React components in translations
  - Core: `parseRichText()` framework-agnostic parser
  - React: `<RichText>` component and `useRichText()` hook
  - Tag syntax: `<link>text</link>` mapped to component renderers
  - Works with variable interpolation (`{name}` + `<bold>text</bold>`)
- **Lazy Loading** - Async dictionary loading on demand
  - Configure loader: `configure({ loader: (locale, ns) => import(...) })`
  - Load async: `await loadAsync('ko', 'dashboard')`
  - Check state: `isLoaded('ko', 'dashboard')`
  - Promise deduplication for concurrent calls
  - React: `useLoadDictionaries(locale, namespace?)` hook with `{ isLoading, error }`
- New core exports: `loadAsync`, `isLoaded`, `parseRichText`, `RichTextSegment`
- New React exports: `RichText`, `useRichText`, `useLoadDictionaries`

## [0.4.0] - 2025-01-26

### Added

- **Relative Time Formatting** - Human-readable relative time support
  - ICU format: `{time, relativeTime}` → "3 days ago" / "3일 전"
  - Style options: `long` (default), `short`, `narrow`
  - Auto-detects best unit (seconds → years)
  - Locale-aware via `Intl.RelativeTimeFormat`
- **List Formatting** - Locale-aware list joins
  - ICU format: `{names, list}` → "Alice, Bob, and Charlie"
  - Type options: `conjunction` (and), `disjunction` (or), `unit`
  - Style options: `long` (default), `short`, `narrow`
  - Locale-aware via `Intl.ListFormat`
- **Namespace Support** - Organize translations for large apps
  - Load with namespace: `loadDictionaries({...}, 'common')`
  - Use with prefix: `t('common:greeting')`
  - New `getLoadedNamespaces()` function
  - `clearDictionaries(namespace?)` supports selective clearing
  - Backward compatible: omitting namespace uses `'default'`
- **Debug Mode** - Visual indicators for missing/fallback translations
  - Enable: `configure({ debugMode: true })`
  - Missing: `"[MISSING: fr] key"`
  - Fallback: `"[fr -> en] Hello"`
  - Customizable prefix formats via `DebugModeOptions`
- New exports: `getLoadedNamespaces`, `DebugModeOptions`

### Changed

- `TranslationVars` type now accepts `string[]` for list formatting
- Dictionary storage refactored to support namespaces internally

## [0.3.0] - 2025-01-19

### Added

- **Locale Fallback Chain** - BCP 47 parent locale support
  - Auto-derive parent locale: `zh-TW` → `zh` → `en`
  - Custom fallback chain configuration
  - Works with both `it()` and `t()` functions
- **Missing Translation Warning** - Development-time diagnostics
  - Warns when translation is missing and fallback is used
  - Customizable warning handler via `onMissingTranslation`
  - Shows requested locale, available locales, and fallback used
- **ICU Date/Number/Time Formatting** - Extended ICU support
  - Date formatting: `{date, date, short|medium|long|full}`
  - Time formatting: `{time, time, short|medium|long|full}`
  - Number formatting: `{price, number, decimal|percent|integer|currency}`
  - Locale-aware formatting via `Intl.DateTimeFormat` and `Intl.NumberFormat`
- New `configure()` function for global settings
- New exports: `getConfig()`, `resetConfig()`, `TranslationWarning`, `WarningHandler`

### Changed

- Fallback behavior now uses configurable chain instead of hardcoded `en`
- `TranslationVars` type now accepts `Date` objects
- Improved warning messages with more context

## [0.2.0] - 2025-01-14

### Added

- **ICU Message Format** support for complex translations
  - Plural syntax: `{count, plural, =0 {none} one {# item} other {# items}}`
  - Select syntax: `{gender, select, male {He} female {She} other {They}}`
  - Uses `@formatjs/icu-messageformat-parser` for standard ICU parsing
  - Works with both `it()` and `t()` functions
- ICU examples in Next.js example app

### Changed

- Updated README with ICU Message Format documentation
- Refactored interpolation to support ICU patterns

## [0.1.3] - 2025-01-05

### Changed

- Expanded core package README to comprehensive documentation level
- Added detailed descriptions for React, Next.js, Babel, SWC, CLI packages in core README

## [0.1.2] - 2025-01-05

### Added

- README files for all packages (`babel-plugin`, `cli`, `swc-plugin`)
- GitHub documentation link prominently displayed at top of all package READMEs

## [0.1.1] - 2025-01-05

### Added

- README files for main packages (`core`, `react`, `next`) for npm display
- Server-side `t()` with `setLocale()` example in Next.js example
- Server Components key-based translation documentation in all language READMEs

### Changed

- VSCode extension marked as private (not published to npm)

## [0.1.0] - 2025-01-05

### Added

#### Core (`inline-i18n-multi`)

- `it()` function for inline translations (shorthand and object syntax)
- `t()` function for key-based translations (i18n compatible)
- Variable interpolation with `{name}` syntax
- Plural support using `Intl.PluralRules`
- Language pair helpers (`it_ja`, `en_zh`, etc.)
- Dictionary utilities (`loadDictionaries`, `hasTranslation`, etc.)

#### React (`inline-i18n-multi-react`)

- `LocaleProvider` component
- `useLocale()` hook
- `useT()` hook for key-based translations
- `T` component for JSX translations
- Automatic cookie persistence on locale change

#### Next.js (`inline-i18n-multi-next`)

- Server component support (`it()` async)
- Client component support (re-exports from react package)
- `createI18nMiddleware()` for locale detection
- SEO utilities:
  - `configureI18n()` for global configuration
  - `generateLocaleParams()` for SSG
  - `createMetadata()` for dynamic metadata
  - `getAlternates()` for hreflang links

#### Build Tools

- `@inline-i18n-multi/babel-plugin` for build-time optimization
- `@inline-i18n-multi/swc-plugin` for Next.js 13+
- `@inline-i18n-multi/cli` for validation and coverage

#### Developer Tools

- `inline-i18n-multi-vscode` extension

### Documentation

- Multi-language READMEs (English, Korean, Japanese, Chinese)
- Examples (basic, react, nextjs)
- Test documentation (`docs/test.md`)
- Planned features (`docs/features.md`)
