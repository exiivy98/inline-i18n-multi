import chalk from 'chalk'
import { parseProject, type TranslationEntry } from '../parser'

interface DiffOptions {
  locale1: string
  locale2: string
  cwd?: string
  all?: boolean
}

export async function diff(options: DiffOptions): Promise<void> {
  const { locale1, locale2, cwd, all } = options
  const basePath = cwd || process.cwd()

  console.log(chalk.blue(`\nComparing ${locale1} vs ${locale2}...\n`))

  const entries = await parseProject({ cwd })

  if (entries.length === 0) {
    console.log(chalk.yellow('No translations found.'))
    return
  }

  const onlyIn1: TranslationEntry[] = []
  const onlyIn2: TranslationEntry[] = []
  const shared: TranslationEntry[] = []

  for (const entry of entries) {
    const has1 = !!entry.translations[locale1]
    const has2 = !!entry.translations[locale2]

    if (has1 && has2) shared.push(entry)
    else if (has1 && !has2) onlyIn1.push(entry)
    else if (!has1 && has2) onlyIn2.push(entry)
  }

  if (onlyIn1.length > 0) {
    console.log(chalk.red(`Only in ${locale1} (${onlyIn1.length}):\n`))
    for (const entry of onlyIn1) {
      const relativePath = entry.file.replace(basePath + '/', '')
      console.log(chalk.gray(`  ${relativePath}:${entry.line}`))
      console.log(`    ${chalk.cyan(locale1)}: ${entry.translations[locale1]}`)
      console.log()
    }
  }

  if (onlyIn2.length > 0) {
    console.log(chalk.red(`Only in ${locale2} (${onlyIn2.length}):\n`))
    for (const entry of onlyIn2) {
      const relativePath = entry.file.replace(basePath + '/', '')
      console.log(chalk.gray(`  ${relativePath}:${entry.line}`))
      console.log(`    ${chalk.cyan(locale2)}: ${entry.translations[locale2]}`)
      console.log()
    }
  }

  if (all && shared.length > 0) {
    console.log(chalk.green(`Shared (${shared.length}):\n`))
    for (const entry of shared) {
      const relativePath = entry.file.replace(basePath + '/', '')
      console.log(chalk.gray(`  ${relativePath}:${entry.line}`))
      console.log(`    ${chalk.cyan(locale1)}: ${entry.translations[locale1]}`)
      console.log(`    ${chalk.cyan(locale2)}: ${entry.translations[locale2]}`)
      console.log()
    }
  }

  console.log(chalk.bold('Summary:'))
  console.log(chalk.green(`  Shared: ${shared.length}`))
  console.log(onlyIn1.length > 0
    ? chalk.red(`  Only in ${locale1}: ${onlyIn1.length}`)
    : chalk.gray(`  Only in ${locale1}: 0`))
  console.log(onlyIn2.length > 0
    ? chalk.red(`  Only in ${locale2}: ${onlyIn2.length}`)
    : chalk.gray(`  Only in ${locale2}: 0`))
  console.log()
}
