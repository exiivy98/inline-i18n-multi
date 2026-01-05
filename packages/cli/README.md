> **Important:** For complete documentation, examples, and best practices, please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi).

# @inline-i18n-multi/cli

CLI tool for inline-i18n-multi translation management.

## Installation

```bash
npm install @inline-i18n-multi/cli --save-dev
# or globally
npm install -g @inline-i18n-multi/cli
```

## Commands

### Extract Translations

Extract all translations from your codebase:

```bash
npx inline-i18n extract --output translations.json
```

### Check Missing Translations

Find missing translations for specific locales:

```bash
npx inline-i18n check --locales en,ko,ja
```

### Generate Report

Generate a translation coverage report:

```bash
npx inline-i18n report
```

## Options

```
--src, -s       Source directory (default: ./src)
--output, -o    Output file path
--locales, -l   Comma-separated list of locales
--format, -f    Output format: json, csv (default: json)
```

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for:
- Complete CLI reference
- Integration with CI/CD
- Advanced usage examples

## License

MIT
