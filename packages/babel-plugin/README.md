> **Important:** For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

# @inline-i18n-multi/babel-plugin

Babel plugin for inline-i18n-multi build-time optimization.

## Installation

```bash
npm install @inline-i18n-multi/babel-plugin --save-dev
```

## Usage

Add to your Babel config:

```json
{
  "plugins": ["@inline-i18n-multi/babel-plugin"]
}
```

### With Options

```json
{
  "plugins": [
    ["@inline-i18n-multi/babel-plugin", {
      "defaultLocale": "en",
      "locales": ["en", "ko", "ja"]
    }]
  ]
}
```

## What It Does

This plugin optimizes `it()` calls at build time by:
- Extracting translations for static analysis
- Enabling dead code elimination for unused locales
- Improving runtime performance

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for:
- Complete API reference
- Framework integrations (React, Next.js)
- Best practices and examples

## License

MIT
