import { parse } from '@babel/parser'
import traverse from '@babel/traverse'

export interface TranslationLocation {
  file: string
  line: number
  column: number
  translations: Record<string, string>
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

export function parseCode(code: string, filePath: string): TranslationLocation[] {
  const locations: TranslationLocation[] = []

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

      const location: TranslationLocation = {
        file: filePath,
        line: loc.start.line,
        column: loc.start.column,
        translations: {},
      }

      if (args[0]?.type === 'ObjectExpression') {
        const obj = args[0]
        for (const prop of obj.properties) {
          if (
            prop.type === 'ObjectProperty' &&
            prop.key.type === 'Identifier' &&
            prop.value.type === 'StringLiteral'
          ) {
            location.translations[prop.key.name] = prop.value.value
          }
        }
      } else if (
        args[0]?.type === 'StringLiteral' &&
        args[1]?.type === 'StringLiteral'
      ) {
        const [lang1, lang2] = PAIR_MAPPING[funcName] || ['ko', 'en']
        location.translations[lang1] = args[0].value
        location.translations[lang2] = args[1].value
      }

      if (Object.keys(location.translations).length > 0) {
        locations.push(location)
      }
    },
  })

  return locations
}
