import type { TranslationVars } from './types'

const VARIABLE_PATTERN = /\{(\w+)\}/g

export function interpolate(
  template: string,
  vars?: TranslationVars,
): string {
  if (!vars) return template

  return template.replace(VARIABLE_PATTERN, (_, key) => {
    const value = vars[key]
    return value !== undefined ? String(value) : `{${key}}`
  })
}
