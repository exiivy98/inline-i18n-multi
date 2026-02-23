import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as fs from 'fs'
import fg from 'fast-glob'

// v0.8.0: Dictionary key and t() call extraction

export interface DictionaryKeyEntry {
  file: string
  line: number
  namespace: string
  keys: string[]
}

export interface TCallEntry {
  file: string
  line: number
  key: string
}

export interface ICUTypeInfo {
  variable: string
  type: string
}

export interface TranslationEntry {
  file: string
  line: number
  column: number
  translations: Record<string, string>
  variables: string[]
  /** ICU type information per locale (v0.7.0) */
  icuTypes?: Record<string, ICUTypeInfo[]>
}

interface ParseOptions {
  cwd?: string
  include?: string[]
  exclude?: string[]
}

const IT_FUNCTION_NAMES = [
  'it',
  'it_ja', 'it_zh', 'it_es', 'it_fr', 'it_de',
  'en_ja', 'en_zh', 'en_es', 'en_fr', 'en_de',
  'ja_zh', 'ja_es', 'zh_es',
]

const PAIR_MAPPING: Record<string, [string, string]> = {
  it: ['ko', 'en'],
  it_ja: ['ko', 'ja'],
  it_zh: ['ko', 'zh'],
  it_es: ['ko', 'es'],
  it_fr: ['ko', 'fr'],
  it_de: ['ko', 'de'],
  en_ja: ['en', 'ja'],
  en_zh: ['en', 'zh'],
  en_es: ['en', 'es'],
  en_fr: ['en', 'fr'],
  en_de: ['en', 'de'],
  ja_zh: ['ja', 'zh'],
  ja_es: ['ja', 'es'],
  zh_es: ['zh', 'es'],
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\{(\w+)\}/g)
  if (!matches) return []
  return matches.map((m) => m.slice(1, -1))
}

const ICU_TYPE_PATTERN = /\{(\w+),\s*(\w+)/g

function extractICUTypes(text: string): ICUTypeInfo[] {
  const types: ICUTypeInfo[] = []
  let match: RegExpExecArray | null
  ICU_TYPE_PATTERN.lastIndex = 0
  while ((match = ICU_TYPE_PATTERN.exec(text)) !== null) {
    types.push({ variable: match[1]!, type: match[2]! })
  }
  return types
}

function parseFile(filePath: string): TranslationEntry[] {
  const entries: TranslationEntry[] = []
  const code = fs.readFileSync(filePath, 'utf-8')

  let ast
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
  } catch {
    return []
  }

  traverse(ast, {
    CallExpression(nodePath) {
      const { node } = nodePath
      const { callee } = node

      if (callee.type !== 'Identifier') return
      if (!IT_FUNCTION_NAMES.includes(callee.name)) return

      const funcName = callee.name
      const args = node.arguments
      const loc = node.loc

      if (!loc) return

      const entry: TranslationEntry = {
        file: filePath,
        line: loc.start.line,
        column: loc.start.column,
        translations: {},
        variables: [],
      }

      if (args[0]?.type === 'ObjectExpression') {
        const obj = args[0]
        for (const prop of obj.properties) {
          if (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.value.type === 'StringLiteral'
          ) {
            entry.translations[prop.key.name] = prop.value.value
            entry.variables.push(...extractVariables(prop.value.value))
            // Extract ICU type info (v0.7.0)
            const types = extractICUTypes(prop.value.value)
            if (types.length > 0) {
              if (!entry.icuTypes) entry.icuTypes = {}
              entry.icuTypes[prop.key.name] = types
            }
          }
        }
      } else if (
        args[0]?.type === 'StringLiteral' &&
        args[1]?.type === 'StringLiteral'
      ) {
        const [lang1, lang2] = PAIR_MAPPING[funcName] || ['ko', 'en']
        entry.translations[lang1] = args[0].value
        entry.translations[lang2] = args[1].value
        entry.variables.push(...extractVariables(args[0].value))
        entry.variables.push(...extractVariables(args[1].value))
        // Extract ICU type info (v0.7.0)
        const types1 = extractICUTypes(args[0].value)
        if (types1.length > 0) {
          if (!entry.icuTypes) entry.icuTypes = {}
          entry.icuTypes[lang1] = types1
        }
        const types2 = extractICUTypes(args[1].value)
        if (types2.length > 0) {
          if (!entry.icuTypes) entry.icuTypes = {}
          entry.icuTypes[lang2] = types2
        }
      }

      entry.variables = [...new Set(entry.variables)]

      if (Object.keys(entry.translations).length > 0) {
        entries.push(entry)
      }
    },
  })

  return entries
}

// v0.8.0: Flatten nested ObjectExpression to dot-notation keys
function flattenObjectKeys(
  node: { type: string; properties?: unknown[] },
  prefix: string = '',
): string[] {
  const keys: string[] = []
  if (node.type !== 'ObjectExpression' || !node.properties) return keys

  for (const prop of node.properties as Array<{
    type: string
    key: { type: string; name?: string; value?: string }
    value: { type: string; properties?: unknown[] }
  }>) {
    if (prop.type !== 'ObjectProperty') continue

    let propName: string | undefined
    if (prop.key.type === 'Identifier') propName = prop.key.name
    else if (prop.key.type === 'StringLiteral') propName = prop.key.value

    if (!propName) continue

    const fullKey = prefix ? `${prefix}.${propName}` : propName

    if (prop.value.type === 'StringLiteral') {
      keys.push(fullKey)
    } else if (prop.value.type === 'ObjectExpression') {
      keys.push(...flattenObjectKeys(prop.value, fullKey))
    }
  }
  return keys
}

// v0.8.0: Extract dictionary keys from loadDictionaries() calls
export function parseDictionaryKeys(filePath: string): DictionaryKeyEntry[] {
  const entries: DictionaryKeyEntry[] = []
  const code = fs.readFileSync(filePath, 'utf-8')

  let ast
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
  } catch {
    return []
  }

  traverse(ast, {
    CallExpression(nodePath) {
      const { node } = nodePath
      const { callee } = node

      if (callee.type !== 'Identifier' || callee.name !== 'loadDictionaries') return

      const args = node.arguments
      const loc = node.loc
      if (!loc || !args[0] || args[0].type !== 'ObjectExpression') return

      // Second argument is optional namespace
      let namespace = 'default'
      if (args[1]?.type === 'StringLiteral') {
        namespace = args[1].value
      }

      // First argument: { locale: { key: value } }
      // Collect keys from the first locale's dict (all locales should have same keys)
      const dictObj = args[0]
      const allKeys = new Set<string>()

      for (const localeProp of dictObj.properties as Array<{
        type: string
        value: { type: string; properties?: unknown[] }
      }>) {
        if (localeProp.type !== 'ObjectProperty') continue
        if (localeProp.value.type !== 'ObjectExpression') continue

        const localeKeys = flattenObjectKeys(localeProp.value)
        for (const key of localeKeys) {
          allKeys.add(key)
        }
      }

      if (allKeys.size > 0) {
        entries.push({
          file: filePath,
          line: loc.start.line,
          namespace,
          keys: [...allKeys],
        })
      }
    },
  })

  return entries
}

// v0.8.0: Extract t() call sites
export function parseTCalls(filePath: string): TCallEntry[] {
  const entries: TCallEntry[] = []
  const code = fs.readFileSync(filePath, 'utf-8')

  let ast
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
  } catch {
    return []
  }

  traverse(ast, {
    CallExpression(nodePath) {
      const { node } = nodePath
      const { callee } = node

      if (callee.type !== 'Identifier' || callee.name !== 't') return

      const args = node.arguments
      const loc = node.loc
      if (!loc || !args[0] || args[0].type !== 'StringLiteral') return

      entries.push({
        file: filePath,
        line: loc.start.line,
        key: args[0].value,
      })
    },
  })

  return entries
}

export async function extractProjectDictionaryKeys(options: ParseOptions = {}): Promise<DictionaryKeyEntry[]> {
  const {
    cwd = process.cwd(),
    include = ['**/*.{ts,tsx,js,jsx}'],
    exclude = ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  } = options

  const files = await fg(include, { cwd, ignore: exclude, absolute: true })
  const allEntries: DictionaryKeyEntry[] = []

  for (const file of files) {
    allEntries.push(...parseDictionaryKeys(file))
  }

  return allEntries
}

export async function extractProjectTCalls(options: ParseOptions = {}): Promise<TCallEntry[]> {
  const {
    cwd = process.cwd(),
    include = ['**/*.{ts,tsx,js,jsx}'],
    exclude = ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  } = options

  const files = await fg(include, { cwd, ignore: exclude, absolute: true })
  const allEntries: TCallEntry[] = []

  for (const file of files) {
    allEntries.push(...parseTCalls(file))
  }

  return allEntries
}

export async function parseProject(options: ParseOptions = {}): Promise<TranslationEntry[]> {
  const {
    cwd = process.cwd(),
    include = ['**/*.{ts,tsx,js,jsx}'],
    exclude = ['**/node_modules/**', '**/dist/**', '**/.next/**'],
  } = options

  const files = await fg(include, {
    cwd,
    ignore: exclude,
    absolute: true,
  })

  const allEntries: TranslationEntry[] = []

  for (const file of files) {
    const entries = parseFile(file)
    allEntries.push(...entries)
  }

  return allEntries
}
