import chalk from 'chalk'
import { parseProject, type TranslationEntry } from '../parser'
import { unused } from './unused'

interface ValidateOptions {
  cwd?: string
  locales?: string[]
  strict?: boolean
  unused?: boolean
}

interface Issue {
  type: 'inconsistent' | 'missing' | 'variable_mismatch' | 'icu_type_mismatch'
  message: string
  entries: TranslationEntry[]
  details?: string[]
}

function checkVariableConsistency(entry: TranslationEntry): Issue | null {
  const varsByLocale: { locale: string; vars: string[] }[] = []

  for (const [locale, text] of Object.entries(entry.translations)) {
    const matches = text.match(/\{(\w+)\}/g) || []
    const varNames = [...new Set(matches.map((v) => v.slice(1, -1)))].sort()
    varsByLocale.push({ locale, vars: varNames })
  }

  if (varsByLocale.length < 2) return null

  const reference = varsByLocale[0]!
  const details: string[] = []

  for (let i = 1; i < varsByLocale.length; i++) {
    const current = varsByLocale[i]!
    const refSet = new Set(reference.vars)
    const curSet = new Set(current.vars)

    const onlyInRef = reference.vars.filter((v) => !curSet.has(v))
    const onlyInCur = current.vars.filter((v) => !refSet.has(v))

    if (onlyInRef.length > 0) {
      details.push(
        `${reference.locale} has {${onlyInRef.join('}, {')}} missing in ${current.locale}`,
      )
    }
    if (onlyInCur.length > 0) {
      details.push(
        `${current.locale} has {${onlyInCur.join('}, {')}} missing in ${reference.locale}`,
      )
    }
  }

  if (details.length === 0) return null

  return {
    type: 'variable_mismatch',
    message: 'Variable mismatch between translations',
    entries: [entry],
    details,
  }
}

function checkICUTypeConsistency(entry: TranslationEntry): Issue | null {
  if (!entry.icuTypes) return null

  const locales = Object.keys(entry.icuTypes)
  if (locales.length < 2) return null

  const details: string[] = []
  const reference = locales[0]!
  const refTypes = entry.icuTypes[reference]!

  for (let i = 1; i < locales.length; i++) {
    const locale = locales[i]!
    const curTypes = entry.icuTypes[locale]!

    for (const refType of refTypes) {
      const match = curTypes.find((t: { variable: string; type: string }) => t.variable === refType.variable)
      if (match && match.type !== refType.type) {
        details.push(
          `{${refType.variable}} is "${refType.type}" in ${reference} but "${match.type}" in ${locale}`,
        )
      }
    }
  }

  if (details.length === 0) return null

  return {
    type: 'icu_type_mismatch',
    message: 'ICU type mismatch between translations',
    entries: [entry],
    details,
  }
}

export async function validate(options: ValidateOptions = {}): Promise<void> {
  const { cwd, locales, strict, unused: checkUnused } = options

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

  // check for variable name consistency (enhanced in v0.7.0)
  for (const entry of entries) {
    const issue = checkVariableConsistency(entry)
    if (issue) issues.push(issue)
  }

  // check for ICU type consistency (strict mode, v0.7.0)
  if (strict) {
    for (const entry of entries) {
      const issue = checkICUTypeConsistency(entry)
      if (issue) issues.push(issue)
    }
  }

  // unused key detection (v0.8.0)
  let unusedCount = 0
  if (checkUnused) {
    const result = await unused({ cwd })
    unusedCount = result.unusedKeys.length
  }

  // print results
  if (issues.length === 0 && unusedCount === 0) {
    console.log(chalk.green('All translations are valid!\n'))
    console.log(chalk.gray(`Checked ${entries.length} translation(s)`))
    if (strict) {
      console.log(chalk.gray('(strict mode enabled)'))
    }
    if (checkUnused) {
      console.log(chalk.gray('(unused key detection enabled)'))
    }
    return
  }

  console.log(chalk.red(`Found ${issues.length} issue(s):\n`))

  for (const issue of issues) {
    console.log(`  ${chalk.yellow(issue.message)}`)

    for (const entry of issue.entries) {
      const relativePath = entry.file.replace(process.cwd() + '/', '')
      console.log(chalk.gray(`   ${relativePath}:${entry.line}`))

      for (const [locale, text] of Object.entries(entry.translations)) {
        console.log(`     ${chalk.cyan(locale)}: ${text}`)
      }
    }

    if (issue.details && issue.details.length > 0) {
      for (const detail of issue.details) {
        console.log(chalk.gray(`     → ${detail}`))
      }
    }

    console.log()
  }

  if (issues.length > 0 || unusedCount > 0) {
    process.exit(1)
  }
}
