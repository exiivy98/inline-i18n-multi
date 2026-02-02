import { describe, test, expect } from 'vitest'
import { parseRichText } from './richtext'

describe('Rich Text Parsing (v0.5.0)', () => {
  test('parses template with single component', () => {
    const result = parseRichText('Click <link>here</link>', ['link'])
    expect(result).toEqual([
      { type: 'text', content: 'Click ' },
      { type: 'component', content: 'here', componentName: 'link' },
    ])
  })

  test('parses template with multiple components', () => {
    const result = parseRichText(
      'Read <link>terms</link> and <bold>agree</bold>',
      ['link', 'bold']
    )
    expect(result).toEqual([
      { type: 'text', content: 'Read ' },
      { type: 'component', content: 'terms', componentName: 'link' },
      { type: 'text', content: ' and ' },
      { type: 'component', content: 'agree', componentName: 'bold' },
    ])
  })

  test('handles text before, between, and after components', () => {
    const result = parseRichText(
      'Hello <bold>world</bold>, welcome <italic>home</italic>!',
      ['bold', 'italic']
    )
    expect(result).toEqual([
      { type: 'text', content: 'Hello ' },
      { type: 'component', content: 'world', componentName: 'bold' },
      { type: 'text', content: ', welcome ' },
      { type: 'component', content: 'home', componentName: 'italic' },
      { type: 'text', content: '!' },
    ])
  })

  test('returns single text segment for plain text', () => {
    const result = parseRichText('Hello world', ['link'])
    expect(result).toEqual([
      { type: 'text', content: 'Hello world' },
    ])
  })

  test('handles empty component content', () => {
    const result = parseRichText('<icon></icon> Settings', ['icon'])
    expect(result).toEqual([
      { type: 'component', content: '', componentName: 'icon' },
      { type: 'text', content: ' Settings' },
    ])
  })

  test('ignores tags not in componentNames list', () => {
    const result = parseRichText(
      'Read <link>terms</link> and <unknown>text</unknown>',
      ['link']
    )
    expect(result).toEqual([
      { type: 'text', content: 'Read ' },
      { type: 'component', content: 'terms', componentName: 'link' },
      { type: 'text', content: ' and <unknown>text</unknown>' },
    ])
  })

  test('handles Korean text within components', () => {
    const result = parseRichText(
      '<link>약관</link>을 읽고 <bold>동의</bold>해주세요',
      ['link', 'bold']
    )
    expect(result).toEqual([
      { type: 'component', content: '약관', componentName: 'link' },
      { type: 'text', content: '을 읽고 ' },
      { type: 'component', content: '동의', componentName: 'bold' },
      { type: 'text', content: '해주세요' },
    ])
  })

  test('handles empty componentNames array', () => {
    const result = parseRichText('<link>text</link>', [])
    expect(result).toEqual([
      { type: 'text', content: '<link>text</link>' },
    ])
  })

  test('handles component at start and end', () => {
    const result = parseRichText('<bold>start</bold> middle <bold>end</bold>', ['bold'])
    expect(result).toEqual([
      { type: 'component', content: 'start', componentName: 'bold' },
      { type: 'text', content: ' middle ' },
      { type: 'component', content: 'end', componentName: 'bold' },
    ])
  })

  test('handles same component used multiple times', () => {
    const result = parseRichText(
      '<bold>one</bold> and <bold>two</bold>',
      ['bold']
    )
    expect(result).toEqual([
      { type: 'component', content: 'one', componentName: 'bold' },
      { type: 'text', content: ' and ' },
      { type: 'component', content: 'two', componentName: 'bold' },
    ])
  })
})
