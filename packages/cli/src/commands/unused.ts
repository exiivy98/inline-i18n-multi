import chalk from 'chalk'
import { extractProjectDictionaryKeys, extractProjectTCalls } from '../parser'

interface UnusedKey {
  namespace: string
  key: string
  definedIn: string
  line: number
}

const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other']

export async function unused(options: { cwd?: string } = {}): Promise<{ unusedKeys: UnusedKey[] }> {
  const { cwd } = options

  console.log(chalk.blue('\nDetecting unused translations...\n'))

  const dictEntries = await extractProjectDictionaryKeys({ cwd })
  const tCalls = await extractProjectTCalls({ cwd })

  // Build set of used keys (normalized: namespace:key or key for default)
  const usedKeys = new Set<string>()
  for (const call of tCalls) {
    usedKeys.add(call.key)
    // Also add with default namespace if no namespace prefix
    if (!call.key.includes(':')) {
      usedKeys.add(call.key)
    }
  }

  // Check each dictionary key against used keys
  const unusedKeys: UnusedKey[] = []

  for (const entry of dictEntries) {
    for (const key of entry.keys) {
      const fullKey = entry.namespace === 'default' ? key : `${entry.namespace}:${key}`

      // Check if key is directly used
      if (usedKeys.has(fullKey)) continue

      // Check if this is a plural suffix variant (e.g. count_one, count_other)
      // and the base key is used via t('items.count', { count: N })
      let isPluralVariant = false
      for (const suffix of PLURAL_SUFFIXES) {
        if (key.endsWith(suffix)) {
          const baseKey = key.slice(0, -suffix.length)
          const fullBaseKey = entry.namespace === 'default' ? baseKey : `${entry.namespace}:${baseKey}`
          if (usedKeys.has(fullBaseKey)) {
            isPluralVariant = true
            break
          }
        }
      }
      if (isPluralVariant) continue

      unusedKeys.push({
        namespace: entry.namespace,
        key: fullKey,
        definedIn: entry.file,
        line: entry.line,
      })
    }
  }

  // Report results
  if (unusedKeys.length === 0) {
    const totalKeys = dictEntries.reduce((sum, e) => sum + e.keys.length, 0)
    console.log(chalk.green('No unused translations found!\n'))
    console.log(chalk.gray(`Checked ${totalKeys} dictionary key(s) against ${tCalls.length} t() call(s)`))
    return { unusedKeys }
  }

  console.log(chalk.yellow(`Found ${unusedKeys.length} unused translation key(s):\n`))
  for (const item of unusedKeys) {
    const relativePath = item.definedIn.replace(process.cwd() + '/', '')
    console.log(`  ${chalk.red('-')} ${chalk.cyan(item.key)}`)
    console.log(chalk.gray(`    defined in ${relativePath}:${item.line}`))
  }

  console.log()
  return { unusedKeys }
}
