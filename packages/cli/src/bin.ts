import { Command } from 'commander'
import { find } from './commands/find'
import { validate } from './commands/validate'
import { coverage } from './commands/coverage'

const program = new Command()

program
  .name('inline-i18n')
  .description('CLI tools for inline-i18n-multi')
  .version('0.1.0')

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
  .action(async (options: { cwd?: string; locales?: string[] }) => {
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

program.parse()
