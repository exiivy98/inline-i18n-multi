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

## API

- `LocaleProvider` - Context provider for locale
- `useLocale()` - Get/set current locale
- `it(ko, en, vars?)` - Inline translation function
- `T` - Translation component with language props
- `useT()` - Hook returning key-based `t()` function
- `loadDictionaries(dict)` - Load translation dictionaries

## Documentation

Full documentation: [GitHub](https://github.com/jaesukpark/inline-i18n-multi)

## License

MIT
