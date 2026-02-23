import type { Locale, TranslationVars } from './types'
import { t } from './dictionary'

/**
 * Create a scoped translation function for a given namespace.
 * Returns a `t()` wrapper that auto-prepends the namespace prefix.
 *
 * @param namespace - Namespace to scope to
 * @returns Scoped translation function
 *
 * @example
 * const tc = createScope('common')
 * tc('greeting')      // equivalent to t('common:greeting')
 * tc('nav.home')      // equivalent to t('common:nav.home')
 * tc('welcome', { name: 'John' })
 */
export function createScope(
  namespace: string
): (key: string, vars?: TranslationVars, locale?: Locale) => string {
  return (key: string, vars?: TranslationVars, locale?: Locale): string => {
    return t(`${namespace}:${key}`, vars, locale)
  }
}
