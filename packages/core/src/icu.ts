import {
  parse,
  TYPE,
  type MessageFormatElement,
  type PluralElement,
  type SelectElement,
  isLiteralElement,
  isArgumentElement,
  isPluralElement,
  isSelectElement,
  isPoundElement,
} from '@formatjs/icu-messageformat-parser'

export type ICUVars = Record<string, string | number>

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

  // Unsupported types (number, date, time, tag) - return as-is for now
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

// Pattern to detect ICU format (plural, select, selectordinal)
export const ICU_PATTERN = /\{[^}]+,\s*(plural|select|selectordinal)\s*,/

/**
 * Check if a template contains ICU Message Format patterns
 */
export function hasICUPattern(template: string): boolean {
  return ICU_PATTERN.test(template)
}
