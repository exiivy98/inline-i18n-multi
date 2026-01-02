import { declare } from '@babel/helper-plugin-utils'
import type { PluginObj, PluginPass, NodePath, types as t } from '@babel/core'
import { hashFromTranslations } from './hash'

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

export interface PluginOptions {
  /** Runtime function name to use (default: '__i18n_lookup') */
  runtimeFunction?: string
}

export default declare((api): PluginObj => {
  api.assertVersion(7)

  const t = api.types

  return {
    name: 'inline-i18n-multi',

    visitor: {
      CallExpression(path: NodePath<t.CallExpression>, state: PluginPass) {
        const opts = state.opts as PluginOptions
        const runtimeFunction = opts.runtimeFunction ?? '__i18n_lookup'

        const { node } = path
        const { callee } = node

        // Check if it's an identifier (function name)
        if (callee.type !== 'Identifier') return
        if (!IT_FUNCTION_NAMES.includes(callee.name)) return

        const funcName = callee.name
        const args = node.arguments

        // Extract translations from arguments
        const translations: Record<string, string> = {}

        if (args[0]?.type === 'ObjectExpression') {
          // Object syntax: it({ ko: '...', en: '...' })
          const obj = args[0]
          for (const prop of obj.properties) {
            if (
              prop.type === 'ObjectProperty' &&
              prop.key.type === 'Identifier' &&
              prop.value.type === 'StringLiteral'
            ) {
              translations[prop.key.name] = prop.value.value
            }
          }
        } else if (
          args[0]?.type === 'StringLiteral' &&
          args[1]?.type === 'StringLiteral'
        ) {
          // Shorthand syntax: it('한글', 'English')
          const [lang1, lang2] = PAIR_MAPPING[funcName] || ['ko', 'en']
          translations[lang1] = args[0].value
          translations[lang2] = args[1].value
        } else {
          // Dynamic values - skip transformation
          return
        }

        if (Object.keys(translations).length === 0) return

        // Generate hash
        const hash = hashFromTranslations(translations)

        // Build translations object expression
        const translationsObject = t.objectExpression(
          Object.entries(translations).map(([key, value]) =>
            t.objectProperty(t.identifier(key), t.stringLiteral(value))
          )
        )

        // Check for variables argument
        let variablesArg: t.Expression | null = null

        if (args[0]?.type === 'ObjectExpression' && args[1]) {
          // it({ ko: '...', en: '...' }, { name: 'John' })
          variablesArg = args[1] as t.Expression
        } else if (
          args[0]?.type === 'StringLiteral' &&
          args[1]?.type === 'StringLiteral' &&
          args[2]
        ) {
          // it('안녕 {name}', 'Hello {name}', { name: 'John' })
          variablesArg = args[2] as t.Expression
        }

        // Build new call: __i18n_lookup(hash, translations, variables?)
        const newArgs: t.Expression[] = [
          t.stringLiteral(hash),
          translationsObject,
        ]

        if (variablesArg) {
          newArgs.push(variablesArg)
        }

        const newCall = t.callExpression(
          t.identifier(runtimeFunction),
          newArgs
        )

        path.replaceWith(newCall)
      },
    },
  }
})

export { generateHash, hashFromTranslations } from './hash'
