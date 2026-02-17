> **Important:** For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

# inline-i18n-multi-next

Next.js App Router integration for inline-i18n-multi. Full SSR/SSG support with SEO utilities, rich text, locale detection, and i18n middleware.

## Installation

```bash
npm install inline-i18n-multi-next
```

## Entry Points

| Entry point | Environment | Key exports |
|---|---|---|
| `inline-i18n-multi-next/server` | Server Components | `it`, `t`, `configureI18n`, `generateLocaleParams`, `createMetadata`, `getAlternates`, `createI18nMiddleware` |
| `inline-i18n-multi-next/client` | Client Components | `LocaleProvider`, `useLocale`, `useT`, `it`, `T`, `RichText`, `useRichText`, `useLoadDictionaries`, `useDetectedLocale`, `registerFormatter`, `clearFormatters`, `detectLocale`, `clearICUCache`, `restoreLocale`, `configure`, `resetConfig` |

## Quick Start

### Layout Setup

```tsx
// app/[locale]/layout.tsx
import { LocaleProvider } from 'inline-i18n-multi-next/client'
import { configureI18n, generateLocaleParams } from 'inline-i18n-multi-next/server'

configureI18n({
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
  baseUrl: 'https://example.com',
})

export function generateStaticParams() {
  return generateLocaleParams()
}

export default async function Layout({ children, params }) {
  const { locale } = await params
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
```

### Server Components

```tsx
// app/[locale]/page.tsx
import { it } from 'inline-i18n-multi-next/server'

export default async function Page() {
  return <h1>{await it('안녕하세요', 'Hello')}</h1>
}
```

### Server Components with Key-Based Translation

```tsx
import { t, setLocale, loadDictionaries } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello' },
  ko: { greeting: '안녕하세요' },
})

export default async function Page({ params }) {
  const { locale } = await params
  setLocale(locale)  // Required before using t()

  return <h1>{t('greeting')}</h1>
}
```

### Client Components

```tsx
'use client'
import { it, T, useT } from 'inline-i18n-multi-next/client'

export function ClientComponent() {
  const t = useT()
  return (
    <div>
      <p>{it('클라이언트', 'Client')}</p>
      <T ko="환영" en="Welcome" />
      <p>{t('nav.home')}</p>
    </div>
  )
}
```

## Rich Text (Client Components)

Use `RichText` or `useRichText` to embed React components inside translated strings. Tags like `<link>text</link>` are mapped to component renderers.

### RichText Component

```tsx
'use client'
import { RichText } from 'inline-i18n-multi-next/client'

export function TermsNotice() {
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
```

### useRichText Hook

```tsx
'use client'
import { useRichText } from 'inline-i18n-multi-next/client'

export function RichContent() {
  const richT = useRichText({
    link: (text) => <a href="/terms">{text}</a>,
    bold: (text) => <strong>{text}</strong>,
  })

  return <p>{richT({ en: 'Click <link>here</link>', ko: '<link>여기</link> 클릭' })}</p>
}
```

## Lazy Loading (Client Components)

Use `useLoadDictionaries` to load translations on demand in client components.

```tsx
'use client'
import { useLoadDictionaries, useT } from 'inline-i18n-multi-next/client'
import { useLocale } from 'inline-i18n-multi-next/client'

export function LazySection() {
  const locale = useLocale()
  const { isLoading, error } = useLoadDictionaries(locale, 'dashboard')
  const t = useT()

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Failed to load translations</p>

  return <h2>{t('dashboard.title')}</h2>
}
```

## Locale Detection

### Client-Side: useDetectedLocale

Automatically detect and set the user's locale from browser signals (navigator, cookie, URL).

```tsx
'use client'
import { useDetectedLocale } from 'inline-i18n-multi-next/client'

export function LocaleDetector() {
  useDetectedLocale({
    supportedLocales: ['en', 'ko', 'ja'],
    defaultLocale: 'en',
    sources: ['cookie', 'navigator'],
    cookieName: 'NEXT_LOCALE',
  })

  return null // detection runs on mount, updates context automatically
}
```

Detection sources (checked in order):

| Source | Description |
|---|---|
| `'navigator'` | Browser `navigator.languages` |
| `'cookie'` | Read from `document.cookie` |
| `'url'` | First path segment (e.g., `/ko/about`) |
| `'header'` | `Accept-Language` header (SSR) |

### Server-Side: createI18nMiddleware

Redirect users to locale-prefixed routes based on cookies or `Accept-Language` header.

```ts
// middleware.ts
import { createI18nMiddleware } from 'inline-i18n-multi-next/server'

export default createI18nMiddleware({
  locales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
  localeDetection: true,   // detect from Accept-Language (default: true)
  cookieName: 'NEXT_LOCALE', // cookie for user preference (default: 'NEXT_LOCALE')
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

The middleware checks in order: URL locale prefix, cookie preference, then `Accept-Language` header. If no locale prefix is found, it redirects to the detected locale path.

## SEO Utilities

```tsx
import { createMetadata, getAlternates } from 'inline-i18n-multi-next/server'

export async function generateMetadata({ params }) {
  const { locale } = await params
  return createMetadata(
    {
      title: { en: 'My Site', ko: '내 사이트' },
      description: { en: 'Welcome', ko: '환영합니다' },
    },
    locale,
    '/about'
  )
}
```

## Plural Shorthand (v0.7.0)

Concise plural syntax:

```tsx
// Server Component
export default async function Page() {
  return (
    <p>
      {await it({
        en: '{count, p, item|items}',
        ko: '{count}개',
      }, { count: 5 })}
    </p>
  )
}

// Client Component - also supports 3-part (zero|singular|plural)
<T en="{count, p, no items|item|items}" ko="{count, p, 없음|개|개}" count={0} />
```

## Locale Persistence (v0.7.0)

Auto-save and restore locale:

```tsx
'use client'
import { configure, restoreLocale } from 'inline-i18n-multi-next/client'

configure({
  persistLocale: { storage: 'cookie', key: 'LOCALE', expires: 365 }
})

// Restore on app init
const saved = restoreLocale() // returns locale string or undefined
```

## Custom Formatters

Register custom ICU formatters via the core re-exports.

```tsx
'use client'
import { registerFormatter, clearFormatters } from 'inline-i18n-multi-next/client'

registerFormatter('uppercase', (value) => String(value).toUpperCase())

// Use in translations: {name, uppercase}
```

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for complete API reference, SEO best practices, and advanced patterns.

## License

MIT
