import {
  parse,
  TYPE,
  type MessageFormatElement,
  type PluralElement,
  type SelectElement,
  type NumberElement,
  type DateElement,
  type TimeElement,
  isLiteralElement,
  isArgumentElement,
  isPluralElement,
  isSelectElement,
  isPoundElement,
  isNumberElement,
  isDateElement,
  isTimeElement,
} from '@formatjs/icu-messageformat-parser'

export type ICUVars = Record<string, string | number | Date | string[]>

/**
 * Map ICU date style names to Intl.DateTimeFormat options
 */
const DATE_STYLES: Record<string, Intl.DateTimeFormatOptions> = {
  short: { dateStyle: 'short' },
  medium: { dateStyle: 'medium' },
  long: { dateStyle: 'long' },
  full: { dateStyle: 'full' },
}

/**
 * Map ICU time style names to Intl.DateTimeFormat options
 */
const TIME_STYLES: Record<string, Intl.DateTimeFormatOptions> = {
  short: { timeStyle: 'short' },
  medium: { timeStyle: 'medium' },
  long: { timeStyle: 'long' },
  full: { timeStyle: 'full' },
}

/**
 * Map ICU number style names to Intl.NumberFormat options
 */
const NUMBER_STYLES: Record<string, Intl.NumberFormatOptions> = {
  decimal: { style: 'decimal' },
  percent: { style: 'percent' },
  integer: { style: 'decimal', maximumFractionDigits: 0 },
}

/**
 * Map ICU relative time style names to Intl.RelativeTimeFormat options
 */
const RELATIVE_TIME_STYLES: Record<string, Intl.RelativeTimeFormatOptions> = {
  long: { style: 'long', numeric: 'auto' },
  short: { style: 'short', numeric: 'auto' },
  narrow: { style: 'narrow', numeric: 'auto' },
}

/**
 * Map ICU list type/style names to Intl.ListFormat options
 */
const LIST_TYPES: Record<string, Intl.ListFormatType> = {
  conjunction: 'conjunction',
  disjunction: 'disjunction',
  unit: 'unit',
}

const LIST_STYLES: Record<string, Intl.ListFormatStyle> = {
  long: 'long',
  short: 'short',
  narrow: 'narrow',
}

/**
 * Convert value to Date
 */
function toDate(value: string | number | Date): Date {
  if (value instanceof Date) {
    return value
  }
  return new Date(value)
}

/**
 * Format a number element
 */
function formatNumberElement(
  el: NumberElement,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[el.value]
  if (value === undefined) {
    return `{${el.value}}`
  }

  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num)) {
    return `{${el.value}}`
  }

  let options: Intl.NumberFormatOptions = {}

  if (el.style) {
    if (typeof el.style === 'string') {
      // Check for currency format: "currency" or specific currency like "USD"
      if (el.style === 'currency') {
        options = { style: 'currency', currency: 'USD' }
      } else if (NUMBER_STYLES[el.style]) {
        options = NUMBER_STYLES[el.style]
      }
    } else if ('parsedOptions' in el.style) {
      // NumberSkeleton with parsed options
      options = el.style.parsedOptions as Intl.NumberFormatOptions
    }
  }

  try {
    return new Intl.NumberFormat(locale, options).format(num)
  } catch {
    return String(num)
  }
}

/**
 * Format a date element
 */
function formatDateElement(
  el: DateElement,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[el.value]
  if (value === undefined) {
    return `{${el.value}}`
  }

  let options: Intl.DateTimeFormatOptions = {}

  if (el.style) {
    if (typeof el.style === 'string') {
      options = DATE_STYLES[el.style] || {}
    } else if ('parsedOptions' in el.style) {
      // DateTimeSkeleton with parsed options
      options = el.style.parsedOptions as Intl.DateTimeFormatOptions
    }
  }

  try {
    const date = toDate(value)
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return `{${el.value}}`
  }
}

/**
 * Format a time element
 */
function formatTimeElement(
  el: TimeElement,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[el.value]
  if (value === undefined) {
    return `{${el.value}}`
  }

  let options: Intl.DateTimeFormatOptions = {}

  if (el.style) {
    if (typeof el.style === 'string') {
      options = TIME_STYLES[el.style] || {}
    } else if ('parsedOptions' in el.style) {
      // DateTimeSkeleton with parsed options
      options = el.style.parsedOptions as Intl.DateTimeFormatOptions
    }
  }

  try {
    const date = toDate(value)
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return `{${el.value}}`
  }
}

// ============================================================================
// Relative Time Formatting (v0.4.0)
// ============================================================================

interface RelativeTimeUnit {
  value: number
  unit: Intl.RelativeTimeFormatUnit
}

/**
 * Calculate the best unit for relative time display
 */
function getRelativeTimeUnit(date: Date, now: Date = new Date()): RelativeTimeUnit {
  const diffMs = date.getTime() - now.getTime()
  const diffSeconds = Math.round(diffMs / 1000)
  const diffMinutes = Math.round(diffSeconds / 60)
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)
  const diffWeeks = Math.round(diffDays / 7)
  const diffMonths = Math.round(diffDays / 30)
  const diffYears = Math.round(diffDays / 365)

  if (Math.abs(diffSeconds) < 60) return { value: diffSeconds, unit: 'second' }
  if (Math.abs(diffMinutes) < 60) return { value: diffMinutes, unit: 'minute' }
  if (Math.abs(diffHours) < 24) return { value: diffHours, unit: 'hour' }
  if (Math.abs(diffDays) < 7) return { value: diffDays, unit: 'day' }
  if (Math.abs(diffWeeks) < 4) return { value: diffWeeks, unit: 'week' }
  if (Math.abs(diffMonths) < 12) return { value: diffMonths, unit: 'month' }
  return { value: diffYears, unit: 'year' }
}

interface RelativeTimeReplacement {
  variable: string
  style?: string
}

const RELATIVE_TIME_PATTERN = /\{(\w+),\s*relativeTime(?:,\s*(\w+))?\}/g

/**
 * Preprocess relative time formats before ICU parsing
 */
function preprocessRelativeTime(template: string): {
  processed: string
  replacements: Map<string, RelativeTimeReplacement>
} {
  const replacements = new Map<string, RelativeTimeReplacement>()
  let counter = 0
  const processed = template.replace(RELATIVE_TIME_PATTERN, (_, variable, style) => {
    const placeholder = `__RELTIME_${counter++}__`
    replacements.set(placeholder, { variable, style })
    return `{${placeholder}}`
  })
  return { processed, replacements }
}

/**
 * Format a relative time value
 */
function formatRelativeTimeValue(
  variableName: string,
  style: string | undefined,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[variableName]
  if (value === undefined) {
    return `{${variableName}}`
  }

  try {
    const date = toDate(value as string | number | Date)
    const { value: relValue, unit } = getRelativeTimeUnit(date)
    const options = (style && RELATIVE_TIME_STYLES[style]) || RELATIVE_TIME_STYLES.long
    return new Intl.RelativeTimeFormat(locale, options).format(relValue, unit)
  } catch {
    return `{${variableName}}`
  }
}

// ============================================================================
// List Formatting (v0.4.0)
// ============================================================================

interface ListReplacement {
  variable: string
  type?: string
  style?: string
}

const LIST_PATTERN = /\{(\w+),\s*list(?:,\s*(\w+))?(?:,\s*(\w+))?\}/g

/**
 * Preprocess list formats before ICU parsing
 */
function preprocessList(template: string): {
  processed: string
  replacements: Map<string, ListReplacement>
} {
  const replacements = new Map<string, ListReplacement>()
  let counter = 0
  const processed = template.replace(LIST_PATTERN, (_, variable, arg1, arg2) => {
    const placeholder = `__LIST_${counter++}__`
    let type: string | undefined
    let style: string | undefined

    if (arg1) {
      if (LIST_TYPES[arg1]) {
        type = arg1
        style = arg2
      } else if (LIST_STYLES[arg1]) {
        style = arg1
      }
    }

    replacements.set(placeholder, { variable, type, style })
    return `{${placeholder}}`
  })
  return { processed, replacements }
}

/**
 * Format a list value
 */
function formatListValue(
  variableName: string,
  type: string | undefined,
  style: string | undefined,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[variableName]
  if (value === undefined || !Array.isArray(value)) {
    return `{${variableName}}`
  }

  const options: Intl.ListFormatOptions = {
    type: (type as Intl.ListFormatType) || 'conjunction',
    style: (style as Intl.ListFormatStyle) || 'long',
  }

  try {
    return new Intl.ListFormat(locale, options).format(value)
  } catch {
    return value.join(', ')
  }
}

/**
 * Parse and format an ICU Message Format string
 */
export function interpolateICU(
  template: string,
  vars: ICUVars,
  locale: string
): string {
  // Pre-process relativeTime and list formats (not natively supported by ICU parser)
  const { processed: afterRelTime, replacements: relTimeReplacements } = preprocessRelativeTime(template)
  const { processed: afterList, replacements: listReplacements } = preprocessList(afterRelTime)

  const ast = parse(afterList)
  let result = formatElements(ast, vars, locale, null)

  // Post-process relativeTime placeholders
  for (const [placeholder, { variable, style }] of relTimeReplacements) {
    const formatted = formatRelativeTimeValue(variable, style, vars, locale)
    result = result.replace(`{${placeholder}}`, formatted)
  }

  // Post-process list placeholders
  for (const [placeholder, { variable, type, style }] of listReplacements) {
    const formatted = formatListValue(variable, type, style, vars, locale)
    result = result.replace(`{${placeholder}}`, formatted)
  }

  return result
}

function formatElements(
  elements: MessageFormatElement[],
  vars: ICUVars,
  locale: string,
  currentPluralValue: number | null
): string {
  return elements
    .map((el) => formatElement(el, vars, locale, currentPluralValue))
    .join('')
}

function formatElement(
  el: MessageFormatElement,
  vars: ICUVars,
  locale: string,
  currentPluralValue: number | null
): string {
  if (isLiteralElement(el)) {
    return el.value
  }

  if (isArgumentElement(el)) {
    const value = vars[el.value]
    return value !== undefined ? String(value) : `{${el.value}}`
  }

  if (isPoundElement(el)) {
    // # is replaced with the current plural value
    return currentPluralValue !== null ? String(currentPluralValue) : '#'
  }

  if (isPluralElement(el)) {
    return formatPlural(el, vars, locale)
  }

  if (isSelectElement(el)) {
    return formatSelect(el, vars, locale)
  }

  if (isNumberElement(el)) {
    return formatNumberElement(el, vars, locale)
  }

  if (isDateElement(el)) {
    return formatDateElement(el, vars, locale)
  }

  if (isTimeElement(el)) {
    return formatTimeElement(el, vars, locale)
  }

  // Tag elements - not supported yet
  return ''
}

function formatPlural(
  el: PluralElement,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[el.value]
  if (typeof value !== 'number') {
    return `{${el.value}}`
  }

  const adjustedValue = value - el.offset
  const pluralRules = new Intl.PluralRules(locale, { type: el.pluralType })
  const category = pluralRules.select(adjustedValue)

  // Try exact match first (=0, =1, =2, etc.)
  const exactKey = `=${value}`
  if (el.options[exactKey]) {
    return formatElements(el.options[exactKey].value, vars, locale, adjustedValue)
  }

  // Then try plural category (zero, one, two, few, many, other)
  if (el.options[category]) {
    return formatElements(el.options[category].value, vars, locale, adjustedValue)
  }

  // Fallback to 'other'
  if (el.options.other) {
    return formatElements(el.options.other.value, vars, locale, adjustedValue)
  }

  return `{${el.value}}`
}

function formatSelect(
  el: SelectElement,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[el.value]
  const key = String(value)

  // Try exact match
  if (el.options[key]) {
    return formatElements(el.options[key].value, vars, locale, null)
  }

  // Fallback to 'other'
  if (el.options.other) {
    return formatElements(el.options.other.value, vars, locale, null)
  }

  return `{${el.value}}`
}

// Pattern to detect ICU format (plural, select, selectordinal, number, date, time, relativeTime, list)
export const ICU_PATTERN = /\{[^}]+,\s*(plural|select|selectordinal|number|date|time|relativeTime|list)\s*[,}]/

/**
 * Check if a template contains ICU Message Format patterns
 */
export function hasICUPattern(template: string): boolean {
  return ICU_PATTERN.test(template)
}
