> **Important:** For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

# @inline-i18n-multi/swc-plugin

SWC plugin for inline-i18n-multi build-time optimization.

## Installation

```bash
npm install @inline-i18n-multi/swc-plugin --save-dev
```

## Usage

Add to your `.swcrc`:

```json
{
  "jsc": {
    "experimental": {
      "plugins": [
        ["@inline-i18n-multi/swc-plugin", {
          "defaultLocale": "en",
          "locales": ["en", "ko", "ja"]
        }]
      ]
    }
  }
}
```

### With Next.js

```js
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [
      ['@inline-i18n-multi/swc-plugin', {
        defaultLocale: 'en',
        locales: ['en', 'ko', 'ja']
      }]
    ]
  }
}
```

## What It Does

This plugin optimizes `it()` calls at build time by:
- Extracting translations for static analysis
- Enabling dead code elimination for unused locales
- Improving runtime performance (faster than Babel)

## Requirements

- SWC 1.3.0+
- Rust toolchain (for building from source)

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for:
- Complete API reference
- Framework integrations (React, Next.js)
- Best practices and examples

## License

MIT
