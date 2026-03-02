import { watch } from 'chokidar'
import chalk from 'chalk'

interface WatchOptions {
  cwd: string
  patterns: string[]
  ignore: string[]
  onChange: () => Promise<void>
  label: string
}

export function startWatch(options: WatchOptions): void {
  const { cwd, patterns, ignore, onChange, label } = options

  console.log(chalk.blue(`\nWatching for changes (${label})...\n`))
  console.log(chalk.gray('Press Ctrl+C to stop\n'))

  const watcher = watch(patterns, {
    cwd,
    ignored: ignore,
    ignoreInitial: true,
  })

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  const handleChange = (filePath: string) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      console.log(chalk.gray(`\nChange detected: ${filePath}`))
      console.log(chalk.gray('-'.repeat(40)))
      try {
        await onChange()
      } catch {
        // Error already printed by the command
      }
      console.log(chalk.gray(`\nWatching for changes (${label})...`))
    }, 300)
  }

  watcher.on('change', handleChange)
  watcher.on('add', handleChange)
}
