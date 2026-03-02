import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import { parseProject } from '../parser'

interface ExtractOptions {
  cwd?: string
  output?: string
  format?: 'flat' | 'nested'
}

export async function extract(options: ExtractOptions = {}): Promise<void> {
  const { cwd, output = 'translations', format = 'flat' } = options

  console.log(chalk.blue('\nExtracting inline translations...\n'))

  const entries = await parseProject({ cwd })

  if (entries.length === 0) {
    console.log(chalk.yellow('No translations found.'))
    return
  }

  // Group translations by locale
  const byLocale: Record<string, Record<string, string>> = {}
  const basePath = cwd || process.cwd()

  for (const entry of entries) {
    for (const [locale, text] of Object.entries(entry.translations)) {
      if (!byLocale[locale]) byLocale[locale] = {}

      const relativePath = entry.file.replace(basePath + '/', '')
      const key = `${relativePath}:${entry.line}`
      byLocale[locale][key] = text
    }
  }

  // Write output files
  const outputDir = path.resolve(basePath, output)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const locales = Object.keys(byLocale).sort()
  for (const locale of locales) {
    const translations = byLocale[locale]!
    let content: string

    if (format === 'nested') {
      const nested = buildNestedObject(translations)
      content = JSON.stringify(nested, null, 2) + '\n'
    } else {
      content = JSON.stringify(translations, null, 2) + '\n'
    }

    const filePath = path.join(outputDir, `${locale}.json`)
    fs.writeFileSync(filePath, content)
    console.log(
      chalk.green(`  ${locale}.json`) +
      chalk.gray(` (${Object.keys(translations).length} keys)`)
    )
  }

  console.log(chalk.gray(`\nExtracted ${entries.length} translation(s) to ${output}/`))
}

/**
 * Build a nested object from flat dot-notation keys
 */
function buildNestedObject(flat: Record<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.')
    let current: Record<string, unknown> = result

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part] as Record<string, unknown>
    }

    current[parts[parts.length - 1]!] = value
  }

  return result
}
