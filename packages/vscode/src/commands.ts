import * as vscode from 'vscode'
import { parseCode, type TranslationLocation } from './parser'

export async function findTranslation(): Promise<void> {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('No active editor')
    return
  }

  const selection = editor.selection
  const selectedText = editor.document.getText(selection)

  if (!selectedText) {
    vscode.window.showErrorMessage('Please select text to search')
    return
  }

  const results = await searchInWorkspace(selectedText)

  if (results.length === 0) {
    vscode.window.showInformationMessage(`No translations found for "${selectedText}"`)
    return
  }

  const items = results.map((result) => ({
    label: `$(file) ${vscode.workspace.asRelativePath(result.file)}:${result.line}`,
    description: Object.values(result.translations).join(' | '),
    result,
  }))

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: `Found ${results.length} occurrence(s) of "${selectedText}"`,
  })

  if (selected) {
    const doc = await vscode.workspace.openTextDocument(selected.result.file)
    const editor = await vscode.window.showTextDocument(doc)
    const position = new vscode.Position(selected.result.line - 1, selected.result.column)
    editor.selection = new vscode.Selection(position, position)
    editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter)
  }
}

async function searchInWorkspace(query: string): Promise<TranslationLocation[]> {
  const results: TranslationLocation[] = []
  const lowerQuery = query.toLowerCase()

  const files = await vscode.workspace.findFiles(
    '**/*.{ts,tsx,js,jsx}',
    '**/node_modules/**'
  )

  for (const file of files) {
    const doc = await vscode.workspace.openTextDocument(file)
    const code = doc.getText()
    const locations = parseCode(code, file.fsPath)

    for (const location of locations) {
      const values = Object.values(location.translations)
      if (values.some((v) => v.toLowerCase().includes(lowerQuery))) {
        results.push(location)
      }
    }
  }

  return results
}
