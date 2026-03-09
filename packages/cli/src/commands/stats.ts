import chalk from 'chalk'
import { parseProject, extractProjectDictionaryKeys, extractProjectTCalls } from '../parser'

interface StatsOptions {
  cwd?: string
}

export async function stats(options: StatsOptions = {}): Promise<void> {
  const { cwd } = options
  const basePath = cwd || process.cwd()

  console.log(chalk.blue('\nGathering translation statistics...\n'))

  const entries = await parseProject({ cwd })
  const dictEntries = await extractProjectDictionaryKeys({ cwd })
  const tCalls = await extractProjectTCalls({ cwd })

  const totalDictKeys = dictEntries.reduce((sum, e) => sum + e.keys.length, 0)

  // Overview
  console.log(chalk.bold('Overview:\n'))
  console.log(`  Inline translations (it):    ${chalk.cyan(String(entries.length))}`)
  console.log(`  Dictionary keys:             ${chalk.cyan(String(totalDictKeys))}`)
  console.log(`  t() call sites:              ${chalk.cyan(String(tCalls.length))}`)
  console.log()

  // Locale breakdown
  const localeCounts: Record<string, number> = {}
  for (const entry of entries) {
    for (const locale of Object.keys(entry.translations)) {
      localeCounts[locale] = (localeCounts[locale] || 0) + 1
    }
  }

  if (Object.keys(localeCounts).length > 0) {
    console.log(chalk.bold('Locale Breakdown (inline):\n'))
    const sortedLocales = Object.entries(localeCounts).sort((a, b) => b[1] - a[1])
    for (const [locale, count] of sortedLocales) {
      console.log(`  ${chalk.cyan(locale.padEnd(10))} ${count} translations`)
    }
    console.log()
  }

  // Namespace summary
  const namespaces = new Set(dictEntries.map(e => e.namespace))
  if (namespaces.size > 0) {
    console.log(chalk.bold('Namespaces:\n'))
    for (const entry of dictEntries) {
      console.log(`  ${chalk.yellow(entry.namespace.padEnd(15))} ${entry.keys.length} keys`)
    }
    console.log()
  }

  // Top files
  const fileCounts: Record<string, number> = {}
  for (const entry of entries) {
    const relativePath = entry.file.replace(basePath + '/', '')
    fileCounts[relativePath] = (fileCounts[relativePath] || 0) + 1
  }

  if (Object.keys(fileCounts).length > 0) {
    console.log(chalk.bold('Top Files:\n'))
    const sortedFiles = Object.entries(fileCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    for (const [file, count] of sortedFiles) {
      console.log(`  ${chalk.gray(file.padEnd(50))} ${chalk.cyan(String(count))}`)
    }
    console.log()
  }

  // ICU pattern usage
  const icuUsage: Record<string, number> = {}
  for (const entry of entries) {
    if (!entry.icuTypes) continue
    for (const types of Object.values(entry.icuTypes)) {
      for (const info of types) {
        icuUsage[info.type] = (icuUsage[info.type] || 0) + 1
      }
    }
  }

  if (Object.keys(icuUsage).length > 0) {
    console.log(chalk.bold('ICU Pattern Usage:\n'))
    const sortedICU = Object.entries(icuUsage).sort((a, b) => b[1] - a[1])
    for (const [type, count] of sortedICU) {
      console.log(`  ${chalk.yellow(type.padEnd(20))} ${count} usage(s)`)
    }
    console.log()
  }
}
