# Next.js App Router Example

Next.js 15 App Router example using `inline-i18n-multi-next`.

## Features Demonstrated

- Server Components with `it()` from `/server`
- Client Components with `it()`, `T`, `useT` from `/client`
- Middleware for locale detection
- `LocaleProvider` for client-side locale management
- Key-based translations with `loadDictionaries()` and `useT()`

## Run

```bash
# From the repository root
pnpm install
pnpm --filter inline-i18n-multi-nextjs-example dev
```

Then open http://localhost:3000

## Project Structure

```
with-nextjs/
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root layout with LocaleProvider
│   │   └── page.tsx      # Home page (Server Component)
│   ├── components/
│   │   ├── LanguageSwitcher.tsx  # Client Component
│   │   ├── ClientSection.tsx     # Client Component with T
│   │   └── NavMenu.tsx           # Client Component with useT
│   └── middleware.ts     # i18n middleware
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Key Concepts

### 1. Server Components

```tsx
// app/page.tsx
import { it } from 'inline-i18n-multi-next/server'

export default async function Page() {
  return <h1>{await it('안녕하세요', 'Hello')}</h1>
}
```

### 2. Client Components

```tsx
// components/Example.tsx
'use client'

import { it, T, useLocale } from 'inline-i18n-multi-next/client'

export function Example() {
  const [locale, setLocale] = useLocale()

  return (
    <div>
      <p>{it('안녕하세요', 'Hello')}</p>
      <T ko="반갑습니다" en="Nice to meet you" />
      <button onClick={() => setLocale('ko')}>한국어</button>
    </div>
  )
}
```

### 3. Key-Based Translations

```tsx
'use client'

import { useT, loadDictionaries } from 'inline-i18n-multi-next/client'

loadDictionaries({
  en: { nav: { home: 'Home' } },
  ko: { nav: { home: '홈' } },
})

export function NavMenu() {
  const t = useT()
  return <nav><a href="/">{t('nav.home')}</a></nav>
}
```

### 4. Middleware

```typescript
// src/middleware.ts
import { createI18nMiddleware } from 'inline-i18n-multi-next/middleware'

export default createI18nMiddleware({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

## Optional: SWC Plugin

For build-time optimization, add the SWC plugin:

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    swcPlugins: [['@inline-i18n-multi/swc-plugin', {}]],
  },
}
```
