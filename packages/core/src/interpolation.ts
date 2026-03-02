import type { TranslationVars } from './types'
import { getConfig } from './config'
import { hasICUPattern, hasCustomFormatter, hasPluralShorthand, interpolateICU } from './icu'

const VARIABLE_PATTERN = /\{(\w+)\}/g

/**
 * Strip _context from vars before interpolation (v0.9.0)
 * _context is only used for dictionary key lookup, not for output
 */
function stripContext(vars: TranslationVars): TranslationVars {
  if (!('_context' in vars)) return vars
  const { _context: _, ...rest } = vars
  return rest as TranslationVars
}

export function interpolate(
  template: string,
  vars?: TranslationVars,
  locale?: string,
): string {
  const resolvedLocale = locale || 'en'

  // Strip _context from vars — it's only for key resolution (v0.9.0)
  const cleanVars = vars ? stripContext(vars) : vars

  // ICU Message Format (plural, select) or custom formatters
  if (hasICUPattern(template) || hasCustomFormatter(template) || hasPluralShorthand(template)) {
    if (!cleanVars) {
      // Even without vars, handler should process missing variables
      const cfg = getConfig()
      if (cfg.missingVarHandler) {
        return interpolateICU(template, {}, resolvedLocale)
      }
      return template
    }
    return interpolateICU(template, cleanVars, resolvedLocale)
  }

  // Simple variable substitution
  if (!cleanVars) {
    const cfg = getConfig()
    if (cfg.missingVarHandler) {
      return template.replace(VARIABLE_PATTERN, (_, key) => {
        return cfg.missingVarHandler!(key, resolvedLocale)
      })
    }
    return template
  }

  return template.replace(VARIABLE_PATTERN, (_, key) => {
    const value = cleanVars[key]
    if (value !== undefined) return String(value)
    const cfg = getConfig()
    if (cfg.missingVarHandler) {
      return cfg.missingVarHandler(key, resolvedLocale)
    }
    return `{${key}}`
  })
}
