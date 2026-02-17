# Changelog

All notable changes to this project will be documented in this file.

## [0.7.0] - 2026-02-17

### Added

- **ICU Message Cache** - Memoize parsed ICU ASTs for performance
  - Automatic caching with configurable size: `configure({ icuCacheSize: 500 })`
  - FIFO eviction when cache limit reached
  - Cache key = preprocessed template (locale/variable independent)
  - `clearICUCache()` to manually reset cache
  - Set `icuCacheSize: 0` to disable caching
- **Plural Shorthand** - Concise plural syntax sugar
  - 2-part: `{count, p, item|items}` → "1 item" / "5 items"
  - 3-part: `{count, p, none|item|items}` → "none" / "1 item" / "5 items"
  - Preprocessed to standard ICU plural format before parsing
  - Works with `it()`, `t()`, and all existing ICU features
- **Locale Persistence** - Auto-save/restore locale to storage
  - Configure: `configure({ persistLocale: { storage: 'cookie' | 'localStorage' } })`
  - `setLocale()` auto-saves to configured storage
  - `restoreLocale()` reads from storage and sets locale
  - Custom key: `{ key: 'MY_LOCALE' }` (default: `'LOCALE'`)
  - Cookie expiry: `{ expires: 365 }` (default: 365 days)
  - SSR-safe with `typeof` guards
- **CLI Validation Enhancement** - ICU type consistency checking
  - `--strict` flag enables ICU type mismatch detection
  - Enhanced variable mismatch reporting with detailed diff output
  - ICU type extraction from parsed translations
- New core exports: `clearICUCache`, `restoreLocale`
- New React/Next re-exports: `clearICUCache`, `restoreLocale`

### Changed

- `Config` type extended with `icuCacheSize` and `persistLocale` options
- `FullConfig` updated to include `persistLocale` as optional field
- CLI `validate` command now shows detailed variable mismatch info

## [0.6.0] - 2026-02-09

### Added

- **Custom Formatter Registry** - Register custom ICU-style formatters
  - Register: `registerFormatter('phone', (value, locale, style?) => formatted)`
  - Use in templates: `{num, phone}` or `{card, mask, last4}`
  - Rejects reserved ICU type names (plural, select, number, etc.)
  - `clearFormatters()` to reset registry
  - Works with `it()`, `t()`, and all ICU combinations
- **Interpolation Guards** - Custom handler for missing variables
  - Configure: `configure({ missingVarHandler: (varName, locale) => '[missing]' })`
  - Applies to simple `{var}` interpolation and all ICU format types
  - Default behavior unchanged (`{varName}` placeholder)
- **Locale Detection** - Auto-detect user's locale from multiple sources
  - `detectLocale({ supportedLocales, defaultLocale, sources })`
  - Sources: `navigator`, `cookie`, `url`, `header` (tried in priority order)
  - BCP 47 parent matching (e.g., `en-US` → `en`)
  - SSR-safe with `typeof` guards
  - Cookie name configurable (default: `NEXT_LOCALE`)
  - Accept-Language header parsing with quality weights
  - React: `useDetectedLocale()` hook for auto-setting locale on mount
- **Selectordinal** - Ordinal plural rules (1st, 2nd, 3rd, 4th...)
  - Already supported via ICU parser — now with full test coverage
  - `{rank, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}`
- New core exports: `registerFormatter`, `clearFormatters`, `detectLocale`, `CustomFormatter`, `DetectLocaleOptions`, `DetectSource`
- New React exports: `useDetectedLocale`

### Removed

- **babel-plugin package** — Removed unused placeholder package
- **swc-plugin package** — Removed unused placeholder package
- Removed `@swc/cli` and `@swc/core` root dependencies

### Changed

- `missingVarHandler` added to `Config` type (optional)
- `__i18n_lookup` marked as `@deprecated` — will be removed in v1.0.0

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
