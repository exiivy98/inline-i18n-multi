import type { TranslationVars } from './types'
import { getConfig } from './config'
import { hasICUPattern, hasCustomFormatter, hasPluralShorthand, interpolateICU } from './icu'

const VARIABLE_PATTERN = /\{(\w+)\}/g

export function interpolate(
  template: string,
  vars?: TranslationVars,
  locale?: string,
): string {
  const resolvedLocale = locale || 'en'

  // ICU Message Format (plural, select) or custom formatters
  if (hasICUPattern(template) || hasCustomFormatter(template) || hasPluralShorthand(template)) {
    if (!vars) {
      // Even without vars, handler should process missing variables
      const cfg = getConfig()
      if (cfg.missingVarHandler) {
        return interpolateICU(template, {}, resolvedLocale)
      }
      return template
    }
    return interpolateICU(template, vars, resolvedLocale)
  }

  // Simple variable substitution
  if (!vars) {
    const cfg = getConfig()
    if (cfg.missingVarHandler) {
      return template.replace(VARIABLE_PATTERN, (_, key) => {
        return cfg.missingVarHandler!(key, resolvedLocale)
      })
    }
    return template
  }

  return template.replace(VARIABLE_PATTERN, (_, key) => {
    const value = vars[key]
    if (value !== undefined) return String(value)
    const cfg = getConfig()
    if (cfg.missingVarHandler) {
      return cfg.missingVarHandler(key, resolvedLocale)
    }
    return `{${key}}`
  })
}
