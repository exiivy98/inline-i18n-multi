# inline-i18n-multi

[![npm version](https://img.shields.io/npm/v/inline-i18n-multi.svg)](https://www.npmjs.com/package/inline-i18n-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**翻訳をインラインで書いて、すぐに見つける。**

[English](./README.md) | [한국어](./README.ko.md) | 日本語 | [中文](./README.zh.md)

---

## 問題点

従来のi18nライブラリは翻訳をコードから分離します：

```tsx
// Component.tsx
<p>{t('greeting.hello')}</p>

// en.json
{ "greeting": { "hello": "Hello" } }

// ja.json
{ "greeting": { "hello": "こんにちは" } }
```

アプリで「Hello」を見てコードで探すには：
1. JSONファイルで「Hello」を検索
2. `greeting.hello`キーを見つける
3. コードでそのキーを検索
4. やっと`t('greeting.hello')`を発見

**遅くて面倒です。**

---

## 解決策

`inline-i18n-multi`を使えば、翻訳はコードの中にあります：

```tsx
<p>{it('안녕하세요', 'Hello')}</p>
```

アプリで「Hello」が見えたら？コードベースで「Hello」を検索するだけ。**終わり。**

---

## 機能

- **インライン翻訳** - 使う場所で直接翻訳を書く
- **即時検索** - コードベースで全てのテキストを即座に検索
- **型安全** - 変数の型チェックを含む完全なTypeScriptサポート
- **ビルド時最適化** - Babel/SWCプラグインでランタイムオーバーヘッドゼロ
- **多言語対応** - 任意の数のロケールをサポート
- **フレームワーク対応** - React、Next.js（App Router & Pages Router）
- **開発者ツール** - 検証用CLI、ナビゲーション用VSCode拡張機能

---

## パッケージ

| パッケージ | 説明 |
|-----------|------|
| [`inline-i18n-multi`](./packages/core) | コア翻訳関数 |
| [`inline-i18n-multi-react`](./packages/react) | Reactフック＆コンポーネント |
| [`inline-i18n-multi-next`](./packages/next) | Next.js統合 |
| [`@inline-i18n-multi/cli`](./packages/cli) | CLIツール |
| [`@inline-i18n-multi/babel-plugin`](./packages/babel-plugin) | Babelプラグイン |
| [`@inline-i18n-multi/swc-plugin`](./packages/swc-plugin) | SWCプラグイン |

---

## クイックスタート

### インストール

```bash
# npm
npm install inline-i18n-multi

# yarn
yarn add inline-i18n-multi

# pnpm
pnpm add inline-i18n-multi
```

### 基本的な使い方

```typescript
import { it, setLocale } from 'inline-i18n-multi'

// 現在のロケールを設定
setLocale('ja')

// 短縮構文（韓国語 + 英語）
it('안녕하세요', 'Hello')  // → "Hello"

// オブジェクト構文（複数言語）
it({ ko: '안녕하세요', en: 'Hello', ja: 'こんにちは' })  // → "こんにちは"

// 変数を使用
it('안녕, {name}님', 'Hello, {name}', { name: 'John' })  // → "Hello, John"
```

---

## React統合

```bash
npm install inline-i18n-multi-react
```

```tsx
import { LocaleProvider, useLocale, it, T } from 'inline-i18n-multi-react'

function App() {
  return (
    <LocaleProvider locale="ja">
      <MyComponent />
    </LocaleProvider>
  )
}

function MyComponent() {
  const [locale, setLocale] = useLocale()

  return (
    <div>
      {/* 関数構文 */}
      <h1>{it('제목', 'Title')}</h1>

      {/* コンポーネント構文 */}
      <T ko="환영합니다" en="Welcome" ja="ようこそ" />

      {/* 変数を使用 */}
      <T ko="{count}개의 항목" en="{count} items" ja="{count}件" count={5} />

      {/* ロケール切り替え */}
      <button onClick={() => setLocale('ko')}>한국어</button>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('ja')}>日本語</button>
    </div>
  )
}
```

---

## Next.js統合

```bash
npm install inline-i18n-multi-next
```

### App Router（サーバーコンポーネント）

```tsx
// app/page.tsx
import { it } from 'inline-i18n-multi-next/server'

export default async function Page() {
  return <h1>{await it('안녕하세요', 'Hello')}</h1>
}
```

### App Router（クライアントコンポーネント）

```tsx
'use client'
import { it, LocaleProvider } from 'inline-i18n-multi-next/client'

export default function ClientComponent() {
  return <p>{it('클라이언트', 'Client')}</p>
}
```

### ミドルウェア（ロケール検出）

```typescript
// middleware.ts
import { createI18nMiddleware } from 'inline-i18n-multi-next/middleware'

export default createI18nMiddleware({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

---

## 言語ペアヘルパー

よく使う言語の組み合わせ用の短縮ヘルパー：

```typescript
import { it_ja, en_ja, ja_zh } from 'inline-i18n-multi'

// 韓国語 ↔ 日本語
it_ja('안녕하세요', 'こんにちは')

// 英語 ↔ 日本語
en_ja('Hello', 'こんにちは')

// 日本語 ↔ 中国語
ja_zh('こんにちは', '你好')
```

利用可能なヘルパー：
- `it`（ko↔en）、`it_ja`、`it_zh`、`it_es`、`it_fr`、`it_de`
- `en_ja`、`en_zh`、`en_es`、`en_fr`、`en_de`
- `ja_zh`、`ja_es`、`zh_es`

---

## ビルド時最適化

パフォーマンス向上のため、ビルド時に`it()`呼び出しを変換します。

### Babelプラグイン

```bash
npm install -D @inline-i18n-multi/babel-plugin
```

```javascript
// babel.config.js
module.exports = {
  plugins: ['@inline-i18n-multi/babel-plugin'],
}
```

### SWCプラグイン（Next.js 13+）

```bash
npm install -D @inline-i18n-multi/swc-plugin
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [['@inline-i18n-multi/swc-plugin', {}]],
  },
}
```

**変換前（ソース）:**
```typescript
it('안녕하세요', 'Hello')
```

**変換後（ビルド出力）:**
```typescript
__i18n_lookup('a1b2c3d4', { ko: '안녕하세요', en: 'Hello' })
```

---

## CLIツール

```bash
npm install -D @inline-i18n-multi/cli
```

### 翻訳を検索

翻訳内のテキストを検索：

```bash
npx inline-i18n find "Hello"

# 出力:
# src/components/Header.tsx:12:5
#   ko: 안녕하세요
#   en: Hello
```

### 翻訳を検証

一貫性をチェック：

```bash
npx inline-i18n validate --locales ko,en,ja

# 出力:
# ⚠️  "안녕하세요"の一貫性のない翻訳
#    src/Header.tsx:12  en: "Hello"
#    src/Footer.tsx:8   en: "Hi"
#
# 📭 不足しているロケール: ja
#    src/About.tsx:15
```

### カバレッジレポート

```bash
npx inline-i18n coverage --locales ko,en,ja

# 出力:
# 翻訳カバレッジ:
#
# ロケール  カバレッジ   翻訳済み
# ─────────────────────────────
# ko      ██████████ 100%  150/150
# en      ██████████ 100%  150/150
# ja      ████░░░░░░  40%   60/150
```

---

## VSCode拡張機能

VSCodeマーケットプレイスから`inline-i18n-multi-vscode`をインストールしてください。

### 機能

- **ホバー情報** - `it()`呼び出しにカーソルを合わせると全ての翻訳を表示
- **使用箇所を検索** - ワークスペース全体で翻訳を検索
- **クイックナビゲーション** - `Cmd+Shift+T`で翻訳の使用箇所にジャンプ

---

## APIリファレンス

### コア関数

| 関数 | 説明 |
|------|------|
| `it(ko, en, vars?)` | 韓国語と英語で翻訳 |
| `it(translations, vars?)` | オブジェクト構文で翻訳 |
| `setLocale(locale)` | 現在のロケールを設定 |
| `getLocale()` | 現在のロケールを取得 |

### Reactフック＆コンポーネント

| エクスポート | 説明 |
|-------------|------|
| `LocaleProvider` | ロケール用コンテキストプロバイダー |
| `useLocale()` | `[locale, setLocale]`を返すフック |
| `T` | 翻訳コンポーネント |

### 型

```typescript
type Locale = string
type Translations = Record<Locale, string>
type TranslationVars = Record<string, string | number>
```

---

## なぜインライン翻訳なのか？

### 従来のi18n

```
コード → キー → JSONファイル → 翻訳
          ↑
      追跡が困難
```

### インラインi18n

```
コード ← 翻訳（同じ場所！）
```

| 側面 | 従来の方式 | インライン方式 |
|------|-----------|---------------|
| コードでテキストを探す | 難しい（キー検索） | 簡単（直接検索） |
| 翻訳を追加 | キー作成、JSONに追加 | インラインで記述 |
| リファクタリング | キー参照を更新 | 自動 |
| コードレビュー | JSONを別途確認 | 全てdiffで確認可能 |
| 型安全性 | 限定的 | 完全サポート |

---

## 要件

- Node.js 18+
- TypeScript 5.0+（推奨）
- React 18+（Reactパッケージ用）
- Next.js 13+（Next.jsパッケージ用）

---

## コントリビューション

コントリビューションを歓迎します！まず[コントリビューションガイド](./CONTRIBUTING.md)をお読みください。

```bash
# リポジトリをクローン
git clone https://github.com/exiivy98/inline-i18n-multi.git

# 依存関係をインストール
pnpm install

# 全パッケージをビルド
pnpm build

# テストを実行
pnpm test
```

---

## ライセンス

MIT © [exiivy98](https://github.com/exiivy98)
