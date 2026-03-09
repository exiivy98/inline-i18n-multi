import type { TranslationVars } from './types'
import { getConfig } from './config'
import { hasICUPattern, hasCustomFormatter, hasPluralShorthand, interpolateICU } from './icu'

const VARIABLE_PATTERN = /\{(\w+)\}/g

/**
 * Strip special underscore-prefixed vars before interpolation
 * _context: dictionary key lookup only (v0.9.0)
 * _fallback: missing key fallback only (v0.10.0)
 */
function stripSpecialVars(vars: TranslationVars): TranslationVars {
  if (!('_context' in vars) && !('_fallback' in vars)) return vars
  const { _context: _c, _fallback: _f, ...rest } = vars
  return rest as TranslationVars
}

export function interpolate(
  template: string,
  vars?: TranslationVars,
  locale?: string,
): string {
  const resolvedLocale = locale || 'en'

  // Strip special vars (_context, _fallback) — not for interpolation output
  const cleanVars = vars ? stripSpecialVars(vars) : vars

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
