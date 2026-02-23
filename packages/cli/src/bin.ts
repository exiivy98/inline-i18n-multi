import { Command } from 'commander'
import { find } from './commands/find'
import { validate } from './commands/validate'
import { coverage } from './commands/coverage'
import { typegen } from './commands/typegen'

const program = new Command()

program
  .name('inline-i18n')
  .description('CLI tools for inline-i18n-multi')
  .version('0.8.0')

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
  .action(async (options: { cwd?: string; locales?: string[]; strict?: boolean; unused?: boolean }) => {
    await validate(options)
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
  .action(async (options: { cwd?: string; output?: string }) => {
    await typegen(options)
  })

program.parse()
