import chalk from 'chalk'
import { parseProject, type TranslationEntry } from '../parser'

interface ValidateOptions {
  cwd?: string
  locales?: string[]
}

interface Issue {
  type: 'inconsistent' | 'missing' | 'variable_mismatch'
  message: string
  entries: TranslationEntry[]
}

export async function validate(options: ValidateOptions = {}): Promise<void> {
  const { cwd, locales } = options

  console.log(chalk.blue('\nValidating translations...\n'))

  const entries = await parseProject({ cwd })
  const issues: Issue[] = []

  // group by first language text (usually ko)
  const groups = new Map<string, TranslationEntry[]>()

  for (const entry of entries) {
    const key = Object.values(entry.translations)[0] || ''
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(entry)
  }

  // check for inconsistent translations
  for (const [key, group] of groups) {
    if (group.length < 2) continue

    const translationSets = group.map((e) => JSON.stringify(e.translations))
    const uniqueSets = [...new Set(translationSets)]

    if (uniqueSets.length > 1) {
      issues.push({
        type: 'inconsistent',
        message: `Inconsistent translations for "${key}"`,
        entries: group,
      })
    }
  }

  // check for missing locales
  if (locales && locales.length > 0) {
    for (const entry of entries) {
      const missing = locales.filter((l) => !entry.translations[l])

      if (missing.length > 0) {
        issues.push({
          type: 'missing',
          message: `Missing locales: ${missing.join(', ')}`,
          entries: [entry],
        })
      }
    }
  }

  // check for variable mismatches
  for (const entry of entries) {
    const variableSets = Object.entries(entry.translations).map(([locale, text]) => {
      const vars = text.match(/\{(\w+)\}/g) || []
      return { locale, vars: vars.sort().join(',') }
    })

    const uniqueVarSets = [...new Set(variableSets.map((v) => v.vars))]

    if (uniqueVarSets.length > 1) {
      issues.push({
        type: 'variable_mismatch',
        message: 'Variable mismatch between translations',
        entries: [entry],
      })
    }
  }

  // print results
  if (issues.length === 0) {
    console.log(chalk.green('✅ All translations are valid!\n'))
    console.log(chalk.gray(`Checked ${entries.length} translation(s)`))
    return
  }

  console.log(chalk.red(`❌ Found ${issues.length} issue(s):\n`))

  for (const issue of issues) {
    const icon =
      issue.type === 'inconsistent' ? '⚠️' :
      issue.type === 'missing' ? '📭' : '🔀'

    console.log(`${icon}  ${chalk.yellow(issue.message)}`)

    for (const entry of issue.entries) {
      const relativePath = entry.file.replace(process.cwd() + '/', '')
      console.log(chalk.gray(`   ${relativePath}:${entry.line}`))

      for (const [locale, text] of Object.entries(entry.translations)) {
        console.log(`     ${chalk.cyan(locale)}: ${text}`)
      }
    }
    console.log()
  }

  process.exit(1)
}
