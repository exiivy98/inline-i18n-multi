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

### Validate Translations

Check translation consistency across locales:

```bash
npx inline-i18n validate
npx inline-i18n validate --locales en ko ja
```

### Strict Mode (v0.7.0)

Enable ICU type consistency checking with `--strict`:

```bash
npx inline-i18n validate --strict
```

Strict mode detects:
- **Variable name mismatches** — different variable names across locales
- **ICU type mismatches** — inconsistent ICU types (e.g., `plural` in one locale, `select` in another)

Example output:

```
⚠ ICU type mismatch:
  en: count → plural
  ko: count → select
  Details: Variable "count" has type "plural" in en but "select" in ko

✗ 2 issues found
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
--strict, -s    Enable strict mode (ICU type consistency check)
```

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for:
- Complete CLI reference
- Integration with CI/CD
- Advanced usage examples

## License

MIT
