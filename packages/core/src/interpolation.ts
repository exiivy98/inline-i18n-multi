import type { TranslationVars } from './types'
import { hasICUPattern, interpolateICU } from './icu'

const VARIABLE_PATTERN = /\{(\w+)\}/g

export function interpolate(
  template: string,
  vars?: TranslationVars,
  locale?: string,
): string {
  if (!vars) return template

  // ICU Message Format (plural, select)
  if (hasICUPattern(template)) {
    return interpolateICU(template, vars, locale || 'en')
  }

  // Simple variable substitution
  return template.replace(VARIABLE_PATTERN, (_, key) => {
    const value = vars[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}
