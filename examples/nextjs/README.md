# Next.js App Router Example (SEO Optimized)

Next.js 15 App Router example with full SEO support using `inline-i18n-multi-next`.

## SEO Features

- **SSG/SSR Support** - `generateStaticParams()` pre-renders all locales
- **Dynamic Metadata** - `generateMetadata()` with per-locale title/description
- **Hreflang Links** - `getAlternates()` for proper language alternates
- **Cookie Persistence** - Locale preference saved automatically
- **URL-Based Routing** - `/[locale]/...` pattern for SEO-friendly URLs
- **Plural Shorthand** (v0.7.0) - `{count, p, item|items}` concise syntax
- **ICU Message Cache** (v0.7.0) - Parsed AST memoization
- **Locale Persistence** (v0.7.0) - Auto-save/restore locale
- **Translation Scope** (v0.8.0) - `createScope()` for namespace scoping

## Run

```bash
# From the repository root
pnpm install
pnpm --filter inline-i18n-multi-nextjs-example dev
```

Then open http://localhost:3000

## Project Structure

```
nextjs/
├── src/
│   ├── app/
│   │   └── [locale]/
│   │       ├── layout.tsx    # Root layout with SEO metadata
│   │       └── page.tsx      # Home page with SEO info
│   ├── components/
│   │   ├── LanguageSwitcher.tsx  # URL-based locale switching
│   │   ├── ClientSection.tsx     # T component examples
│   │   └── NavMenu.tsx           # useT hook examples
│   ├── middleware.ts     # i18n routing middleware
│   └── i18n.config.ts    # Shared locale configuration
└── next.config.ts
```

## Key SEO Patterns

### 1. Configure i18n

```typescript
// src/i18n.config.ts
export const locales = ['ko', 'en', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ko'
export const baseUrl = 'https://example.com'
```

### 2. Static Generation (SSG)

```tsx
// app/[locale]/layout.tsx
import { configureI18n, generateLocaleParams } from 'inline-i18n-multi-next/server'

configureI18n({ locales, defaultLocale, baseUrl })

export function generateStaticParams() {
  return generateLocaleParams()
}
```

### 3. Dynamic Metadata

```tsx
import { createMetadata } from 'inline-i18n-multi-next/server'

export async function generateMetadata({ params }) {
  const { locale } = await params

  return createMetadata(
    {
      title: { ko: '홈', en: 'Home', ja: 'ホーム' },
      description: { ko: '환영합니다', en: 'Welcome', ja: 'ようこそ' },
    },
    locale,
    '' // pathname for hreflang
  )
}
```

### 4. Hreflang Alternates

```tsx
import { getAlternates } from 'inline-i18n-multi-next/server'

const alternates = getAlternates('/about', locale)
// {
//   canonical: 'https://example.com/en/about',
//   languages: {
//     ko: 'https://example.com/ko/about',
//     en: 'https://example.com/en/about',
//     ja: 'https://example.com/ja/about',
//     'x-default': 'https://example.com/ko/about'
//   }
// }
```

### 5. URL-Based Language Switching

```tsx
'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'inline-i18n-multi-next/client'

function LanguageSwitcher() {
  const [locale, setLocale] = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (newLocale: string) => {
    setLocale(newLocale) // Updates state + saves cookie
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }
}
```

## Build Output

```
Route (app)                              Size  First Load JS
├ ○ /_not-found                         988 B         103 kB
└ ● /[locale]                          3.13 kB        105 kB
    ├ /ko   (SSG)
    ├ /en   (SSG)
    └ /ja   (SSG)
```

All locale pages are pre-rendered at build time for optimal SEO and performance.
