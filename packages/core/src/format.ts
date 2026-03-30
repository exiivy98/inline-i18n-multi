import { getLocale } from './context'
import type { Locale } from './types'

/**
 * Format a number for the given locale using Intl.NumberFormat.
 *
 * @example
 * formatNumber(1234.5) // "1,234.5" (en)
 * formatNumber(1234.5, { style: 'currency', currency: 'USD' }) // "$1,234.50"
 * formatNumber(0.85, { style: 'percent' }, 'ko') // "85%"
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: Locale,
): string {
  return new Intl.NumberFormat(locale ?? getLocale(), options).format(value)
}

/**
 * Format a date for the given locale using Intl.DateTimeFormat.
 *
 * @example
 * formatDate(new Date()) // "3/30/2026" (en)
 * formatDate(new Date(), { dateStyle: 'full' }, 'ja') // "2026年3月30日月曜日"
 */
export function formatDate(
  value: Date | number,
  options?: Intl.DateTimeFormatOptions,
  locale?: Locale,
): string {
  return new Intl.DateTimeFormat(locale ?? getLocale(), options).format(value)
}

/**
 * Format a list for the given locale using Intl.ListFormat.
 *
 * @example
 * formatList(['A', 'B', 'C']) // "A, B, and C" (en)
 * formatList(['A', 'B', 'C'], { type: 'disjunction' }) // "A, B, or C"
 * formatList(['りんご', 'みかん'], {}, 'ja') // "りんごとみかん"
 */
export function formatList(
  values: string[],
  options?: Intl.ListFormatOptions,
  locale?: Locale,
): string {
  return new Intl.ListFormat(locale ?? getLocale(), options).format(values)
}
