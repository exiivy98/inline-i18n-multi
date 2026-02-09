# Contributing to inline-i18n-multi

Thank you for your interest in contributing! This guide will help you get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

---

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 9+

### Getting Started

```bash
# Clone the repository
git clone https://github.com/exiivy98/inline-i18n-multi.git
cd inline-i18n-multi

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck
```

---

## Project Structure

```
inline-i18n-multi/
├── packages/
│   ├── core/           # Core translation functions
│   ├── react/          # React hooks & components
│   ├── next/           # Next.js integration
│   ├── cli/            # CLI tools
│   └── vscode/         # VSCode extension
├── docs/               # Internal documentation (not published)
├── turbo.json          # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspace configuration
└── package.json        # Root package.json
```

### Package Dependencies

```
core (no dependencies)
  ↑
react (depends on core)
  ↑
next (depends on react)

cli (depends on core)
vscode (standalone)
```

---

## Development Workflow

### Working on a Package

```bash
# Build a specific package
pnpm --filter inline-i18n-multi build
pnpm --filter inline-i18n-multi-react build

# Run tests for a specific package
pnpm --filter @inline-i18n-multi/cli test

# Watch mode (if available)
pnpm --filter inline-i18n-multi dev
```

### Running the Full Build

```bash
# Build all packages in order
pnpm build

# Clean and rebuild
pnpm clean && pnpm install && pnpm build
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, semicolons, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Scopes

| Scope | Description |
|-------|-------------|
| `core` | Core package |
| `react` | React package |
| `next` | Next.js package |
| `cli` | CLI package |
| `vscode` | VSCode extension |
| `deps` | Dependencies |

### Examples

```bash
feat(core): add support for plural forms
fix(react): resolve hydration mismatch in LocaleProvider
docs: update README with new examples
chore(deps): upgrade TypeScript to 5.7
```

---

## Pull Request Process

### Before Submitting

1. **Create an issue first** - Discuss your idea before implementing
2. **Fork the repository** - Work on your own fork
3. **Create a feature branch** - `git checkout -b feat/your-feature`
4. **Make your changes** - Follow the code style guidelines
5. **Write tests** - Ensure your changes are covered
6. **Run checks locally**:
   ```bash
   pnpm build
   pnpm test
   pnpm typecheck
   pnpm lint
   ```

### Submitting

1. Push your branch to your fork
2. Open a Pull Request against `main`
3. Fill in the PR template
4. Wait for review

### PR Title Format

Follow the commit convention for PR titles:

```
feat(core): add support for plural forms
```

---

## Code Style

### TypeScript

- Use TypeScript for all packages
- Enable strict mode
- Prefer `interface` over `type` for object shapes
- Use JSDoc comments for public APIs

```typescript
/**
 * Translates text based on current locale.
 * @param ko - Korean text
 * @param en - English text
 * @param vars - Optional variables for interpolation
 * @returns Translated string
 */
export function it(ko: string, en: string, vars?: TranslationVars): string {
  // ...
}
```

### Comments

- Use `//` for single-line comments
- Use `/** */` for JSDoc documentation
- Write comments in English

### Testing

- Write unit tests for all public APIs
- Use descriptive test names
- Group related tests with `describe`

```typescript
describe('it()', () => {
  it('returns Korean text when locale is ko', () => {
    setLocale('ko')
    expect(it('안녕', 'Hello')).toBe('안녕')
  })

  it('returns English text when locale is en', () => {
    setLocale('en')
    expect(it('안녕', 'Hello')).toBe('Hello')
  })
})
```

---

## Questions?

If you have questions, feel free to:

- Open an issue on GitHub
- Start a discussion in the repository

Thank you for contributing!
