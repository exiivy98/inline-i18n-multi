> **Important:** For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

# inline-i18n-multi-next

Next.js App Router integration for inline-i18n-multi. Full SSR/SSG support with SEO utilities.

## Installation

```bash
npm install inline-i18n-multi-next
```

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

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for complete API reference, SEO best practices, and advanced patterns.

## License

MIT
