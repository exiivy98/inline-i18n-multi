import React, { type ReactNode, useMemo, useCallback, Fragment } from 'react'
import { it, parseRichText, type Translations, type TranslationVars } from 'inline-i18n-multi'

type ComponentRenderer = (text: string) => ReactNode

interface RichTextProps {
  /**
   * Translation map with locale keys
   * Tags like <link>text</link> will be matched to component renderers
   */
  translations: Translations
  /**
   * Component renderers for each tag name
   * @example { link: (text) => <a href="/terms">{text}</a> }
   */
  components: Record<string, ComponentRenderer>
  /**
   * Variables for interpolation (applied before rich text parsing)
   */
  vars?: TranslationVars
}

/**
 * Rich text translation component
 * Supports embedding React components within translations
 *
 * @example
 * <RichText
 *   translations={{
 *     en: 'Read <link>terms</link> and <bold>agree</bold>',
 *     ko: '<link>약관</link>을 읽고 <bold>동의</bold>해주세요'
 *   }}
 *   components={{
 *     link: (text) => <a href="/terms">{text}</a>,
 *     bold: (text) => <strong>{text}</strong>
 *   }}
 * />
 */
export function RichText({ translations, components, vars }: RichTextProps): React.JSX.Element {
  const componentNames = useMemo(() => Object.keys(components), [components])

  // Resolve locale and interpolate variables ({curly} braces)
  // Rich text tags (<angle> brackets) don't conflict with variable interpolation
  const resolved = it(translations, vars)
  const segments = parseRichText(resolved, componentNames)

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <Fragment key={index}>{segment.content}</Fragment>
        }
        const renderer = components[segment.componentName!]
        if (!renderer) {
          return <Fragment key={index}>{segment.content}</Fragment>
        }
        return <Fragment key={index}>{renderer(segment.content)}</Fragment>
      })}
    </>
  )
}

/**
 * Hook for rich text translations
 * Returns a function that resolves translations with component interpolation
 *
 * @example
 * const richT = useRichText({
 *   link: (text) => <a href="/terms">{text}</a>,
 *   bold: (text) => <strong>{text}</strong>,
 * })
 * return richT({ en: 'Click <link>here</link>', ko: '<link>여기</link> 클릭' })
 */
export function useRichText(
  components: Record<string, ComponentRenderer>
): (translations: Translations, vars?: TranslationVars) => ReactNode {
  const componentNames = useMemo(() => Object.keys(components), [components])

  return useCallback(
    (translations: Translations, vars?: TranslationVars): ReactNode => {
      const resolved = it(translations, vars)
      const segments = parseRichText(resolved, componentNames)

      return (
        <>
          {segments.map((segment, index) => {
            if (segment.type === 'text') {
              return <Fragment key={index}>{segment.content}</Fragment>
            }
            const renderer = components[segment.componentName!]
            if (!renderer) {
              return <Fragment key={index}>{segment.content}</Fragment>
            }
            return <Fragment key={index}>{renderer(segment.content)}</Fragment>
          })}
        </>
      )
    },
    [components, componentNames]
  )
}
