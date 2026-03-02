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

### Extract Translations (v0.9.0)

Extract all inline translations from your codebase into a structured JSON file:

```bash
npx inline-i18n extract --output translations.json
npx inline-i18n extract --src ./src --output i18n/translations.json
```

The extracted file contains all `it()`, `T`, and key-based translations found in source files, grouped by file path:

```json
{
  "src/Header.tsx": [
    { "key": "greeting", "translations": { "en": "Hello", "ko": "안녕하세요" } }
  ]
}
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
npx inline-i18n validate --unused
```

### Detect Unused Keys (v0.8.0)

Find translation keys defined in dictionaries but never referenced in source code:

```bash
npx inline-i18n validate --unused
```

Example output:

```
Found 2 unused translation key(s):

  - old.feature.title
    defined in src/locales.ts:5
  - deprecated.banner
    defined in src/locales.ts:12
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
ICU type mismatch between translations
  src/Header.tsx:12
    en: {count, plural, one {# item} other {# items}}
    ko: {count, select, male {He} female {She}}

Found 1 issue(s)
```

### Generate Types (v0.8.0)

Generate TypeScript type definitions from your translation keys for type-safe `t()` calls:

```bash
npx inline-i18n typegen --output src/i18n.d.ts
```

This scans your dictionaries and produces a `.d.ts` file with autocomplete-ready key types.

### Generate Report

Generate a translation coverage report:

```bash
npx inline-i18n report
```

### Watch Mode (v0.9.0)

Run `validate` or `typegen` in watch mode to automatically re-run on file changes:

```bash
npx inline-i18n validate --watch
npx inline-i18n typegen --output src/i18n.d.ts --watch
```

Watch mode monitors your source directory for changes and re-executes the command on each save. Useful during development to catch translation issues or regenerate types in real time.

### Context System Support (v0.9.0)

The CLI commands (`extract`, `validate`, `typegen`) recognize contextual translation keys using the `key#context` convention:

```json
{
  "greeting": "Hello",
  "greeting#formal": "Good day",
  "greeting#casual": "Hey"
}
```

Validation checks context variants for completeness across locales. Type generation includes context-aware overloads for `t()`.

## Options

```
--src, -s       Source directory (default: ./src)
--output, -o    Output file path
--locales, -l   Comma-separated list of locales
--format, -f    Output format: json, csv (default: json)
--strict        Enable strict mode (ICU type consistency check)
--unused        Detect unused translation keys (validate command)
--watch, -w     Watch mode for validate/typegen (re-run on file changes)
```

## Documentation

**Please read the [full documentation on GitHub](https://github.com/exiivy98/inline-i18n-multi)** for:
- Complete CLI reference
- Integration with CI/CD
- Advanced usage examples

## License

MIT
