import chalk from 'chalk'
import { parseProject, type TranslationEntry } from '../parser'

interface FindOptions {
  query: string
  cwd?: string
}

export async function find(options: FindOptions): Promise<void> {
  const { query, cwd } = options

  console.log(chalk.blue(`\nSearching for: "${query}"\n`))

  const entries = await parseProject({ cwd })
  const results: TranslationEntry[] = []

  const lowerQuery = query.toLowerCase()

  for (const entry of entries) {
    const values = Object.values(entry.translations)
    const matches = values.some((v) => v.toLowerCase().includes(lowerQuery))

    if (matches) {
      results.push(entry)
    }
  }

  if (results.length === 0) {
    console.log(chalk.yellow('No results found.'))
    return
  }

  console.log(chalk.green(`Found ${results.length} occurrence(s):\n`))

  for (const result of results) {
    const relativePath = result.file.replace(process.cwd() + '/', '')
    console.log(chalk.gray(`${relativePath}:${result.line}:${result.column}`))

    for (const [locale, text] of Object.entries(result.translations)) {
      const highlighted = text.replace(
        new RegExp(`(${query})`, 'gi'),
        chalk.yellow('$1')
      )
      console.log(`  ${chalk.cyan(locale)}: ${highlighted}`)
    }
    console.log()
  }
}
