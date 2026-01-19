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

export type ICUVars = Record<string, string | number | Date>

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

/**
 * Parse and format an ICU Message Format string
 */
export function interpolateICU(
  template: string,
  vars: ICUVars,
  locale: string
): string {
  const ast = parse(template)
  return formatElements(ast, vars, locale, null)
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

// Pattern to detect ICU format (plural, select, selectordinal, number, date, time)
export const ICU_PATTERN = /\{[^}]+,\s*(plural|select|selectordinal|number|date|time)\s*[,}]/

/**
 * Check if a template contains ICU Message Format patterns
 */
export function hasICUPattern(template: string): boolean {
  return ICU_PATTERN.test(template)
}
