import * as vscode from 'vscode'
import { findTranslation } from './commands'
import { TranslationHoverProvider } from './hover'

export function activate(context: vscode.ExtensionContext): void {
  // Register find translation command
  const findCommand = vscode.commands.registerCommand(
    'inlineI18n.findTranslation',
    findTranslation
  )
  context.subscriptions.push(findCommand)

  // Register hover provider for supported languages
  const supportedLanguages = [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'typescriptreact' },
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'javascriptreact' },
  ]

  const hoverProvider = new TranslationHoverProvider()

  for (const selector of supportedLanguages) {
    const hover = vscode.languages.registerHoverProvider(selector, hoverProvider)
    context.subscriptions.push(hover)
  }

  console.log('inline-i18n extension activated')
}

export function deactivate(): void {
  // Cleanup if needed
}
