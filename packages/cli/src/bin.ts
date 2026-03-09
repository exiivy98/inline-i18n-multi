import { Command } from 'commander'
import { find } from './commands/find'
import { validate } from './commands/validate'
import { coverage } from './commands/coverage'
import { typegen } from './commands/typegen'
import { extract } from './commands/extract'
import { diff } from './commands/diff'
import { stats } from './commands/stats'
import { startWatch } from './watch'

const program = new Command()

program
  .name('inline-i18n')
  .description('CLI tools for inline-i18n-multi')
  .version('0.10.0')

program
  .command('find <query>')
  .description('Find translations containing the query text')
  .option('-c, --cwd <path>', 'Working directory')
  .action(async (query: string, options: { cwd?: string }) => {
    await find({ query, cwd: options.cwd })
  })

program
  .command('validate')
  .description('Validate translation consistency')
  .option('-c, --cwd <path>', 'Working directory')
  .option('-l, --locales <locales...>', 'Required locales to check')
  .option('-s, --strict', 'Enable strict mode (ICU type consistency check)')
  .option('-u, --unused', 'Detect unused dictionary keys')
  .option('-w, --watch', 'Watch mode - re-validate on file changes')
  .action(async (options: { cwd?: string; locales?: string[]; strict?: boolean; unused?: boolean; watch?: boolean }) => {
    await validate(options.watch ? { ...options, noExit: true } : options)
    if (options.watch) {
      const cwd = options.cwd || process.cwd()
      startWatch({
        cwd,
        patterns: ['**/*.{ts,tsx,js,jsx}'],
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        onChange: () => validate({ ...options, noExit: true }),
        label: 'validate',
      })
    }
  })

program
  .command('coverage')
  .description('Show translation coverage by locale')
  .option('-c, --cwd <path>', 'Working directory')
  .option('-l, --locales <locales...>', 'Locales to check', ['ko', 'en'])
  .action(async (options: { cwd?: string; locales: string[] }) => {
    await coverage(options)
  })

program
  .command('typegen')
  .description('Generate TypeScript types for translation keys')
  .option('-c, --cwd <path>', 'Working directory')
  .option('-o, --output <path>', 'Output file path', 'src/i18n.d.ts')
  .option('-w, --watch', 'Watch mode - regenerate types on file changes')
  .action(async (options: { cwd?: string; output?: string; watch?: boolean }) => {
    await typegen(options)
    if (options.watch) {
      const cwd = options.cwd || process.cwd()
      startWatch({
        cwd,
        patterns: ['**/*.{ts,tsx,js,jsx}'],
        ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
        onChange: () => typegen(options),
        label: 'typegen',
      })
    }
  })

program
  .command('extract')
  .description('Extract inline translations to JSON files')
  .option('-c, --cwd <path>', 'Working directory')
  .option('-o, --output <path>', 'Output directory', 'translations')
  .option('-f, --format <format>', 'Output format (flat|nested)', 'flat')
  .action(async (options: { cwd?: string; output?: string; format?: 'flat' | 'nested' }) => {
    await extract(options)
  })

program
  .command('diff <locale1> <locale2>')
  .description('Compare translations between two locales')
  .option('-c, --cwd <path>', 'Working directory')
  .option('-a, --all', 'Show all entries including shared translations')
  .action(async (locale1: string, locale2: string, options: { cwd?: string; all?: boolean }) => {
    await diff({ locale1, locale2, cwd: options.cwd, all: options.all })
  })

program
  .command('stats')
  .description('Show translation statistics overview')
  .option('-c, --cwd <path>', 'Working directory')
  .action(async (options: { cwd?: string }) => {
    await stats(options)
  })

program.parse()
