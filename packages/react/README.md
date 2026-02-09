> **Important:** For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

# inline-i18n-multi-react

React bindings for inline-i18n-multi. Write translations inline in your components.

## Installation

```bash
npm install inline-i18n-multi-react
```

## Quick Start

```tsx
import { LocaleProvider, it, T, useT } from 'inline-i18n-multi-react'

function App() {
  return (
    <LocaleProvider locale="ko">
      <MyComponent />
    </LocaleProvider>
  )
}

function MyComponent() {
  return (
    <div>
      {/* Inline function */}
      <p>{it('안녕하세요', 'Hello')}</p>

      {/* T component */}
      <T ko="환영합니다" en="Welcome" ja="ようこそ" />

      {/* With variables */}
      <T ko="{count}개" en="{count} items" count={5} />
    </div>
  )
}
```

## Key-Based Translation with useT

```tsx
import { useT, loadDictionaries } from 'inline-i18n-multi-react'

loadDictionaries({
  en: { nav: { home: 'Home', about: 'About' } },
  ko: { nav: { home: '홈', about: '소개' } },
})

function Nav() {
  const t = useT()
  return (
    <nav>
      <a href="/">{t('nav.home')}</a>
      <a href="/about">{t('nav.about')}</a>
    </nav>
  )
}
```

## Rich Text

Embed React components within translated strings using `<tag>` syntax.

```tsx
import { RichText, useRichText } from 'inline-i18n-multi-react'

// Component approach
function Terms() {
  return (
    <RichText
      translations={{
        en: 'Read <link>terms</link> and <bold>agree</bold>',
        ko: '<link>약관</link>을 읽고 <bold>동의</bold>해주세요',
      }}
      components={{
        link: (text) => <a href="/terms">{text}</a>,
        bold: (text) => <strong>{text}</strong>,
      }}
    />
  )
}

// Hook approach
function Legal() {
  const richT = useRichText({
    link: (text) => <a href="/terms">{text}</a>,
    bold: (text) => <strong>{text}</strong>,
  })

  return <p>{richT({ en: 'Click <link>here</link>', ko: '<link>여기</link> 클릭' })}</p>
}
```

## Lazy Loading with useLoadDictionaries

```tsx
import { useLoadDictionaries, useT } from 'inline-i18n-multi-react'

function Dashboard() {
  const { isLoading, error } = useLoadDictionaries('ko', 'dashboard')
  const t = useT()

  if (isLoading) return <Spinner />
  if (error) return <p>Failed to load translations</p>

  return <h1>{t('dashboard.title')}</h1>
}
```

## Automatic Locale Detection

```tsx
import { LocaleProvider, useDetectedLocale } from 'inline-i18n-multi-react'

function App() {
  return (
    <LocaleProvider locale="en">
      <AutoDetect />
    </LocaleProvider>
  )
}

function AutoDetect() {
  useDetectedLocale({
    supportedLocales: ['en', 'ko', 'ja'],
    defaultLocale: 'en',
    sources: ['cookie', 'navigator'],
  })

  return <Content />
}
```

## API

### React-Specific

| Export | Description |
|---|---|
| `LocaleProvider` | Context provider for locale |
| `useLocale()` | Get/set current locale via context |
| `useT()` | Hook returning key-based `t()` function |
| `T` | Translation component with language props |
| `RichText` | Rich text translation component |
| `useRichText(components)` | Hook for rich text translations |
| `useLoadDictionaries(locale, namespace?)` | Lazy loading hook with loading/error state |
| `useDetectedLocale(options)` | Auto-detect and set locale on mount |

### Re-exported from Core

**Inline translations:**
`it`, `it_ja`, `it_zh`, `it_es`, `it_fr`, `it_de`, `en_ja`, `en_zh`, `en_es`, `en_fr`, `en_de`, `ja_zh`, `ja_es`, `zh_es`

**Locale management:**
`getLocale`, `setLocale`

**Key-based translations:**
`t`, `loadDictionaries`, `loadDictionary`, `clearDictionaries`, `hasTranslation`, `getLoadedLocales`, `getDictionary`, `loadAsync`, `isLoaded`

**Configuration:**
`configure`, `getConfig`, `resetConfig`

**Rich text parsing:**
`parseRichText`

**Custom formatters:**
`registerFormatter`, `clearFormatters`

**Locale detection:**
`detectLocale`

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for complete API reference, advanced patterns, and best practices.

## License

MIT
