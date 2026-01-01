import * as vscode from 'vscode'
import { parseCode } from './parser'

export class TranslationHoverProvider implements vscode.HoverProvider {
  async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Hover | null> {
    const line = document.lineAt(position.line).text
    const wordRange = document.getWordRangeAtPosition(position, /it[_a-z]*\s*\(/)

    if (!wordRange) return null

    const code = document.getText()
    const locations = parseCode(code, document.uri.fsPath)

    // find translation at current position
    const currentLocation = locations.find(
      (loc) => loc.line === position.line + 1
    )

    if (!currentLocation) return null

    // count usage across workspace
    const config = vscode.workspace.getConfiguration('inlineI18n')
    const showUsageCount = config.get<boolean>('showUsageCount', true)

    let usageCount = 0
    if (showUsageCount) {
      usageCount = await countUsage(currentLocation.translations)
    }

    // build hover content
    const markdown = new vscode.MarkdownString()
    markdown.appendMarkdown('**Translations:**\n\n')

    for (const [locale, text] of Object.entries(currentLocation.translations)) {
      markdown.appendMarkdown(`- \`${locale}\`: ${text}\n`)
    }

    if (showUsageCount && usageCount > 1) {
      markdown.appendMarkdown(`\n---\n\n*Used in ${usageCount} location(s)*`)
    }

    return new vscode.Hover(markdown)
  }
}

async function countUsage(translations: Record<string, string>): Promise<number> {
  let count = 0
  const firstValue = Object.values(translations)[0]
  if (!firstValue) return 0

  const files = await vscode.workspace.findFiles(
    '**/*.{ts,tsx,js,jsx}',
    '**/node_modules/**'
  )

  for (const file of files) {
    const doc = await vscode.workspace.openTextDocument(file)
    const code = doc.getText()
    const locations = parseCode(code, file.fsPath)

    for (const location of locations) {
      const locFirstValue = Object.values(location.translations)[0]
      if (locFirstValue === firstValue) {
        count++
      }
    }
  }

  return count
}
