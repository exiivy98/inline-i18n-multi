# inline-i18n-multi

Inline i18n for JavaScript/TypeScript. Write translations where you use them.

## Installation

```bash
npm install inline-i18n-multi
```

## Quick Start

```ts
import { it, setLocale } from 'inline-i18n-multi'

setLocale('ko')

// Inline translation
it('안녕하세요', 'Hello')  // → '안녕하세요'

// Object syntax for multiple languages
it({ ko: '안녕', en: 'Hi', ja: 'こんにちは' })

// With variables
it('안녕, {name}님', 'Hello, {name}', { name: 'World' })
```

## Key-Based Translation

```ts
import { t, loadDictionaries, setLocale } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ko: { greeting: '안녕하세요', items: { count_other: '{count}개' } },
})

setLocale('en')
t('greeting')  // → 'Hello'
t('items.count', { count: 5 })  // → '5 items'
```

## Framework Integrations

- **React**: [`inline-i18n-multi-react`](https://www.npmjs.com/package/inline-i18n-multi-react)
- **Next.js**: [`inline-i18n-multi-next`](https://www.npmjs.com/package/inline-i18n-multi-next)

## Documentation

Full documentation: [GitHub](https://github.com/jaesukpark/inline-i18n-multi)

## License

MIT
