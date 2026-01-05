# Basic Example

Basic TypeScript example demonstrating core `inline-i18n-multi` features.

## Features Demonstrated

- Inline translations with `it()`
- Key-based translations with `t()`
- Variable interpolation
- Plural support
- Language pair helpers (`it_ja`, `en_zh`, etc.)

## Run

```bash
# From the repository root
pnpm install
pnpm --filter inline-i18n-multi-basic-example start
```

## Output

```
=== Inline Translations ===

Current locale: en
Hello
Hello, John
Hello

Current locale: ko
안녕하세요

=== Language Pair Helpers ===

こんにちは
你好

=== Key-Based Translations ===

Loaded locales: [ 'en', 'ko' ]
Hello
Welcome, John!
1 item
5 items
안녕하세요
Has greeting.hello: true
Has missing.key: false
```
