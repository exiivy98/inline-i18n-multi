import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as fs from 'fs'
import fg from 'fast-glob'

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
