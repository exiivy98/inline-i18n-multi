import {
  parse,
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

import { getConfig } from './config'

export type ICUVars = Record<string, string | number | Date | string[]>

/**
 * Handle a missing variable — uses custom handler if configured, otherwise returns {varName}
 */
function handleMissingVar(varName: string, locale: string): string {
  const cfg = getConfig()
  if (cfg.missingVarHandler) {
    return cfg.missingVarHandler(varName, locale)
  }
  return `{${varName}}`
}

// ============================================================================
// Custom Formatter Registry (v0.6.0)
// ============================================================================

export type CustomFormatter = (value: unknown, locale: string, style?: string) => string

const customFormatters = new Map<string, CustomFormatter>()

const RESERVED_FORMATTER_NAMES = new Set([
  'plural', 'select', 'selectordinal',
  'number', 'date', 'time',
  'relativeTime', 'list', 'currency',
])

/**
 * Register a custom formatter
 *
 * @example
 * registerFormatter('phone', (value, locale, style?) => {
 *   const s = String(value)
 *   return `(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6)}`
 * })
 */
export function registerFormatter(name: string, formatter: CustomFormatter): void {
  if (RESERVED_FORMATTER_NAMES.has(name)) {
    throw new Error(`Cannot register formatter "${name}": reserved ICU type name`)
  }
  customFormatters.set(name, formatter)
}

/**
 * Clear all custom formatters
 */
export function clearFormatters(): void {
  customFormatters.clear()
}

interface CustomFormatterReplacement {
  variable: string
  formatterName: string
  style?: string
}

/**
 * Build a regex that matches custom formatter patterns
 */
function buildCustomFormatterPattern(): RegExp | null {
  if (customFormatters.size === 0) return null
  const names = [...customFormatters.keys()].map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  return new RegExp(`\\{(\\w+),\\s*(${names})(?:,\\s*(\\w+))?\\}`, 'g')
}

/**
 * Preprocess custom formatter patterns before ICU parsing
 */
function preprocessCustomFormatters(template: string): {
  processed: string
  replacements: Map<string, CustomFormatterReplacement>
} {
  const replacements = new Map<string, CustomFormatterReplacement>()
  const pattern = buildCustomFormatterPattern()
  if (!pattern) return { processed: template, replacements }

  let counter = 0
  const processed = template.replace(pattern, (_, variable, formatterName, style) => {
    const placeholder = `__CUSTOM_${counter++}__`
    replacements.set(placeholder, { variable, formatterName, style })
    return `{${placeholder}}`
  })
  return { processed, replacements }
}

/**
 * Check if template contains custom formatter patterns
 */
export function hasCustomFormatter(template: string): boolean {
  const pattern = buildCustomFormatterPattern()
  if (!pattern) return false
  return pattern.test(template)
}

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
    return handleMissingVar(el.value, locale)
  }

  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num)) {
    return handleMissingVar(el.value, locale)
  }

  let options: Intl.NumberFormatOptions = {}

  if (el.style) {
    if (typeof el.style === 'string') {
      // Check for currency format: "currency" or specific currency like "USD"
      if (el.style === 'currency') {
        options = { style: 'currency', currency: 'USD' }
      } else if (NUMBER_STYLES[el.style]) {
        options = NUMBER_STYLES[el.style]!
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
    return handleMissingVar(el.value, locale)
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
    const date = toDate(value as string | number | Date)
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return handleMissingVar(el.value, locale)
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
    return handleMissingVar(el.value, locale)
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
    const date = toDate(value as string | number | Date)
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return handleMissingVar(el.value, locale)
  }
}

// ============================================================================
// Currency Formatting (v0.5.0)
// ============================================================================

interface CurrencyReplacement {
  variable: string
  currencyCode: string
}

const CURRENCY_PATTERN = /\{(\w+),\s*currency(?:,\s*(\w+))?\}/g

/**
 * Preprocess currency formats before ICU parsing
 */
function preprocessCurrency(template: string): {
  processed: string
  replacements: Map<string, CurrencyReplacement>
} {
  const replacements = new Map<string, CurrencyReplacement>()
  let counter = 0
  const processed = template.replace(CURRENCY_PATTERN, (_, variable, currencyCode) => {
    const placeholder = `__CURRENCY_${counter++}__`
    replacements.set(placeholder, { variable, currencyCode: currencyCode || 'USD' })
    return `{${placeholder}}`
  })
  return { processed, replacements }
}

/**
 * Format a currency value
 */
function formatCurrencyValue(
  variableName: string,
  currencyCode: string,
  vars: ICUVars,
  locale: string
): string {
  const value = vars[variableName]
  if (value === undefined) {
    return handleMissingVar(variableName, locale)
  }

  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num)) {
    return handleMissingVar(variableName, locale)
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(num)
  } catch {
    return String(num)
  }
}

// ============================================================================
// Compact Number Formatting (v0.5.0)
// ============================================================================

interface CompactNumberReplacement {
  variable: string
  display: 'short' | 'long'
}

const COMPACT_NUMBER_PATTERN = /\{(\w+),\s*number,\s*(compact|compactLong)\}/g

/**
 * Preprocess compact number formats before ICU parsing
 */
function preprocessCompactNumber(template: string): {
  processed: string
  replacements: Map<string, CompactNumberReplacement>
} {
  const replacements = new Map<string, CompactNumberReplacement>()
  let counter = 0
  const processed = template.replace(COMPACT_NUMBER_PATTERN, (_, variable, style) => {
    const placeholder = `__COMPACT_${counter++}__`
    replacements.set(placeholder, {
      variable,
      display: style === 'compactLong' ? 'long' : 'short',
    })
    return `{${placeholder}}`
  })
  return { processed, replacements }
}

/**
 * Format a compact number value
 */
function formatCompactNumber(
  variableName: string,
  display: 'short' | 'long',
  vars: ICUVars,
  locale: string
): string {
  const value = vars[variableName]
  if (value === undefined) {
    return handleMissingVar(variableName, locale)
  }

  const num = typeof value === 'number' ? value : Number(value)
  if (isNaN(num)) {
    return handleMissingVar(variableName, locale)
  }

  try {
    return new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: display,
    }).format(num)
  } catch {
    return String(num)
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
    return handleMissingVar(variableName, locale)
  }

  try {
    const date = toDate(value as string | number | Date)
    const { value: relValue, unit } = getRelativeTimeUnit(date)
    const options = (style && RELATIVE_TIME_STYLES[style]) || RELATIVE_TIME_STYLES.long
    return new Intl.RelativeTimeFormat(locale, options).format(relValue, unit)
  } catch {
    return handleMissingVar(variableName, locale)
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
    return handleMissingVar(variableName, locale)
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
  // Pre-process custom formats (not natively supported by ICU parser)
  const { processed: afterCustom, replacements: customReplacements } = preprocessCustomFormatters(template)
  const { processed: afterCurrency, replacements: currencyReplacements } = preprocessCurrency(afterCustom)
  const { processed: afterCompact, replacements: compactReplacements } = preprocessCompactNumber(afterCurrency)
  const { processed: afterRelTime, replacements: relTimeReplacements } = preprocessRelativeTime(afterCompact)
  const { processed: afterList, replacements: listReplacements } = preprocessList(afterRelTime)

  const ast = parse(afterList)
  let result = formatElements(ast, vars, locale, null)

  // Post-process custom formatter placeholders
  for (const [placeholder, { variable, formatterName, style }] of customReplacements) {
    const value = vars[variable]
    let formatted: string
    if (value === undefined) {
      formatted = handleMissingVar(variable, locale)
    } else {
      const formatter = customFormatters.get(formatterName)
      formatted = formatter ? formatter(value, locale, style) : String(value)
    }
    result = result.replace(`{${placeholder}}`, formatted)
  }

  // Post-process currency placeholders
  for (const [placeholder, { variable, currencyCode }] of currencyReplacements) {
    const formatted = formatCurrencyValue(variable, currencyCode, vars, locale)
    result = result.replace(`{${placeholder}}`, formatted)
  }

  // Post-process compact number placeholders
  for (const [placeholder, { variable, display }] of compactReplacements) {
    const formatted = formatCompactNumber(variable, display, vars, locale)
    result = result.replace(`{${placeholder}}`, formatted)
  }

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
    if (value !== undefined) return String(value)
    // Preprocessor placeholders (__CURRENCY_0__, __COMPACT_0__, etc.) must keep
    // their {placeholder} format so postprocessing can find and replace them
    if (el.value.startsWith('__') && el.value.endsWith('__')) {
      return `{${el.value}}`
    }
    return handleMissingVar(el.value, locale)
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
    return handleMissingVar(el.value, locale)
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

  return handleMissingVar(el.value, locale)
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

  return handleMissingVar(el.value, locale)
}

// Pattern to detect ICU format (plural, select, selectordinal, number, date, time, relativeTime, list)
export const ICU_PATTERN = /\{[^}]+,\s*(plural|select|selectordinal|number|date|time|relativeTime|list|currency)\s*[,}]/

/**
 * Check if a template contains ICU Message Format patterns
 */
export function hasICUPattern(template: string): boolean {
  return ICU_PATTERN.test(template)
}
