# Changelog

All notable changes to this project will be documented in this file.

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
