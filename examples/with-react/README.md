# React Example

React example using `inline-i18n-multi-react` with Vite.

## Features Demonstrated

- `LocaleProvider` for context-based locale management
- `useLocale()` hook for reading and setting locale
- `useT()` hook for key-based translations
- `it()` function for inline translations
- `T` component for JSX-friendly translations
- Variable interpolation
- Plural support

## Run

```bash
# From the repository root
pnpm install
pnpm --filter inline-i18n-multi-react-example dev
```

Then open http://localhost:5173

## Project Structure

```
with-react/
├── src/
│   ├── main.tsx      # Entry point with LocaleProvider
│   └── App.tsx       # Main component with all examples
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Concepts

### 1. Setup with LocaleProvider

```tsx
import { LocaleProvider, loadDictionaries } from 'inline-i18n-multi-react'

// Load dictionaries for key-based translations
loadDictionaries({
  en: { greeting: 'Hello' },
  ko: { greeting: '안녕하세요' },
})

createRoot(document.getElementById('root')!).render(
  <LocaleProvider locale="en">
    <App />
  </LocaleProvider>
)
```

### 2. Using Translations

```tsx
import { useLocale, useT, it, T } from 'inline-i18n-multi-react'

function App() {
  const [locale, setLocale] = useLocale()
  const t = useT()

  return (
    <div>
      {/* Inline translation */}
      <p>{it('안녕하세요', 'Hello')}</p>

      {/* Component syntax */}
      <T ko="안녕하세요" en="Hello" />

      {/* Key-based translation */}
      <p>{t('greeting')}</p>

      {/* Language switcher */}
      <button onClick={() => setLocale('ko')}>한국어</button>
    </div>
  )
}
```
