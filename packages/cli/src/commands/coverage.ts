import chalk from 'chalk'
import { parseProject } from '../parser'

interface CoverageOptions {
  cwd?: string
  locales: string[]
}

interface LocaleCoverage {
  locale: string
  total: number
  translated: number
  percentage: number
}

export async function coverage(options: CoverageOptions): Promise<void> {
  const { cwd, locales } = options

  console.log(chalk.blue('\nAnalyzing translation coverage...\n'))

  const entries = await parseProject({ cwd })

  if (entries.length === 0) {
    console.log(chalk.yellow('No translations found.'))
    return
  }

  const coverageData: LocaleCoverage[] = []

  for (const locale of locales) {
    let translated = 0

    for (const entry of entries) {
      if (entry.translations[locale]) {
        translated++
      }
    }

    const percentage = Math.round((translated / entries.length) * 100)

    coverageData.push({
      locale,
      total: entries.length,
      translated,
      percentage,
    })
  }

  // print coverage table
  console.log(chalk.bold('Translation Coverage:\n'))

  const maxLocaleLen = Math.max(...locales.map((l) => l.length), 6)

  console.log(
    chalk.gray(
      `${'Locale'.padEnd(maxLocaleLen)}  ${'Coverage'.padStart(10)}  ${'Translated'.padStart(12)}`
    )
  )
  console.log(chalk.gray('─'.repeat(maxLocaleLen + 26)))

  for (const data of coverageData) {
    const color =
      data.percentage === 100 ? chalk.green :
      data.percentage >= 80 ? chalk.yellow : chalk.red

    const bar = createProgressBar(data.percentage, 10)
    const percentStr = `${data.percentage}%`.padStart(4)

    console.log(
      `${data.locale.padEnd(maxLocaleLen)}  ${color(bar)} ${color(percentStr)}  ${chalk.gray(`${data.translated}/${data.total}`)}`
    )
  }

  console.log()

  // summary
  const fullyCovered = coverageData.filter((d) => d.percentage === 100).length
  const partiallyCovered = coverageData.filter((d) => d.percentage > 0 && d.percentage < 100).length
  const notCovered = coverageData.filter((d) => d.percentage === 0).length

  if (fullyCovered === locales.length) {
    console.log(chalk.green('All locales are fully translated!'))
  } else {
    console.log(chalk.gray(`Full: ${fullyCovered}, Partial: ${partiallyCovered}, Empty: ${notCovered}`))
  }
}

function createProgressBar(percentage: number, width: number): string {
  const filled = Math.round((percentage / 100) * width)
  const empty = width - filled

  return '█'.repeat(filled) + '░'.repeat(empty)
}
