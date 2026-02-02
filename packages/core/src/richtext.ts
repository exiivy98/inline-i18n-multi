/**
 * Rich Text segment types
 */
export interface RichTextSegment {
  type: 'text' | 'component'
  content: string
  /** Component name (only for type === 'component') */
  componentName?: string
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Parse a template string into rich text segments.
 * Matches patterns like <name>content</name> for each component name.
 *
 * @param template - The template string with component tags
 * @param componentNames - Array of valid component names to match
 * @returns Array of segments (text or component)
 *
 * @example
 * parseRichText('Read <link>terms</link> and <bold>agree</bold>', ['link', 'bold'])
 * // [
 * //   { type: 'text', content: 'Read ' },
 * //   { type: 'component', content: 'terms', componentName: 'link' },
 * //   { type: 'text', content: ' and ' },
 * //   { type: 'component', content: 'agree', componentName: 'bold' },
 * // ]
 */
export function parseRichText(
  template: string,
  componentNames: string[]
): RichTextSegment[] {
  if (componentNames.length === 0) {
    return [{ type: 'text', content: template }]
  }

  const segments: RichTextSegment[] = []
  const namesPattern = componentNames.map(escapeRegExp).join('|')
  const regex = new RegExp(`<(${namesPattern})>(.*?)</\\1>`, 'gs')

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(template)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: template.slice(lastIndex, match.index),
      })
    }

    // Component segment
    segments.push({
      type: 'component',
      content: match[2] ?? '',
      componentName: match[1],
    })

    lastIndex = match.index + match[0].length
  }

  // Trailing text
  if (lastIndex < template.length) {
    segments.push({
      type: 'text',
      content: template.slice(lastIndex),
    })
  }

  return segments
}
