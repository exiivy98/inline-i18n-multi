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
- **i18n互換** - JSON辞書と複数形をサポートする従来のキーベース翻訳対応
- **ICU Message Format** - 複数形、セレクト、日付、数値、時刻、相対時間、リストフォーマットサポート
- **ロケールフォールバックチェーン** - BCP 47親ロケールサポート（`zh-TW` → `zh` → `en`）
- **翻訳欠落警告** - カスタマイズ可能なハンドラーによる開発時診断
- **名前空間サポート** - 大規模アプリ向けの翻訳整理（`t('common:greeting')`）
- **デバッグモード** - 欠落/フォールバック翻訳の視覚的表示
- **通貨フォーマット** - ロケール対応の通貨表示（`{price, currency, USD}`）
- **コンパクト数値フォーマット** - 大きな数値の短縮表示（`{count, number, compact}`）
- **リッチテキスト補間** - 翻訳にReactコンポーネントを埋め込み（`<link>テキスト</link>`）
- **遅延読み込み** - 非同期辞書ロード（`loadAsync()`）

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
| [`inline-i18n-multi-vscode`](./packages/vscode) | VSCode拡張機能 |

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

## キーベース翻訳（i18n互換）

JSON翻訳ファイルを既に使用しているプロジェクトや、従来のキーベース翻訳が必要な場合：

```typescript
import { t, loadDictionaries } from 'inline-i18n-multi'

// 翻訳辞書をロード
loadDictionaries({
  en: {
    greeting: { hello: 'Hello', goodbye: 'Goodbye' },
    items: { count_one: '{count} item', count_other: '{count} items' },
    welcome: 'Welcome, {name}!'
  },
  ja: {
    greeting: { hello: 'こんにちは', goodbye: 'さようなら' },
    items: { count_other: '{count}件のアイテム' },
    welcome: 'ようこそ、{name}さん！'
  }
})

// 基本的なキーベース翻訳
t('greeting.hello')  // → "Hello"（ロケールが'en'の時）

// 変数を使用
t('welcome', { name: 'John' })  // → "Welcome, John!"

// 複数形サポート（Intl.PluralRulesを使用）
t('items.count', { count: 1 })  // → "1 item"
t('items.count', { count: 5 })  // → "5 items"

// ロケールをオーバーライド
t('greeting.hello', undefined, 'ja')  // → "こんにちは"
```

### ユーティリティ関数

```typescript
import { hasTranslation, getLoadedLocales, getDictionary } from 'inline-i18n-multi'

// 翻訳の存在確認
hasTranslation('greeting.hello')  // → true
hasTranslation('missing.key')     // → false

// ロードされたロケールを取得
getLoadedLocales()  // → ['en', 'ja']

// 特定ロケールの辞書を取得
getDictionary('en')  // → { greeting: { hello: 'Hello', ... }, ... }
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

### useTフック（キーベース）

```tsx
import { useT, loadDictionaries } from 'inline-i18n-multi-react'

// 辞書をロード（通常はアプリのエントリーポイントで）
loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ja: { greeting: 'こんにちは', items: { count_other: '{count}件のアイテム' } }
})

function MyComponent() {
  const t = useT()

  return (
    <div>
      <p>{t('greeting')}</p>
      <p>{t('items.count', { count: 5 })}</p>
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

### サーバーコンポーネントでキーベース翻訳

サーバーコンポーネントで `t()` を使用するには、まず `setLocale()` を呼び出す必要があります：

```tsx
// app/[locale]/page.tsx
import { t, setLocale, loadDictionaries } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ko: { greeting: '안녕하세요', items: { count_other: '{count}개' } },
  ja: { greeting: 'こんにちは', items: { count_other: '{count}件' } },
})

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setLocale(locale)  // t()を使用する前に必須

  return (
    <div>
      <h1>{t('greeting')}</h1>
      <p>{t('items.count', { count: 5 })}</p>
    </div>
  )
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

### クライアントコンポーネントでキーベース翻訳

```tsx
'use client'
import { useT, loadDictionaries } from 'inline-i18n-multi-next/client'

loadDictionaries({
  en: { nav: { home: 'Home', about: 'About' } },
  ja: { nav: { home: 'ホーム', about: '紹介' } }
})

export default function NavMenu() {
  const t = useT()
  return <nav><a href="/">{t('nav.home')}</a></nav>
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

### SEO最適化（App Router）

Next.js App Routerで完全なSEOサポートのためのサーバーユーティリティ：

```tsx
// app/[locale]/layout.tsx
import { configureI18n, generateLocaleParams, createMetadata, getAlternates } from 'inline-i18n-multi-next/server'

// i18n設定
configureI18n({
  locales: ['ko', 'en', 'ja'],
  defaultLocale: 'ko',
  baseUrl: 'https://example.com'
})

// SSG: 全ロケールを事前レンダリング
export function generateStaticParams() {
  return generateLocaleParams()  // → [{ locale: 'ko' }, { locale: 'en' }, { locale: 'ja' }]
}

// 動的メタデータ
export async function generateMetadata({ params }) {
  const { locale } = await params

  return createMetadata(
    {
      title: { ko: '홈', en: 'Home', ja: 'ホーム' },
      description: { ko: '환영합니다', en: 'Welcome', ja: 'ようこそ' },
    },
    locale,
    ''  // 現在のパス
  )
}

// Hreflangリンク（SEO用）
const alternates = getAlternates('/about', 'ko')
// → {
//   canonical: 'https://example.com/ko/about',
//   languages: {
//     ko: 'https://example.com/ko/about',
//     en: 'https://example.com/en/about',
//     ja: 'https://example.com/ja/about',
//     'x-default': 'https://example.com/ko/about'
//   }
// }
```

**SEO機能：**
- **SSG/SSR** - `generateStaticParams()`で全ロケールを事前レンダリング
- **動的メタデータ** - `createMetadata()`でロケール別title/description
- **Hreflang** - `getAlternates()`で検索エンジン用の言語代替リンク
- **Cookie保存** - `setLocale()`呼び出し時に自動保存
- **URLルーティング** - `/[locale]/...`パターンでSEOフレンドリーなURL

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

## ICU Message Format

複数形と条件付きテキストが必要な複雑な翻訳には、ICU Message Formatを使用します：

```typescript
import { it, setLocale } from "inline-i18n-multi";

setLocale("en");

// 複数形
it(
  {
    ko: "{count, plural, =0 {項目なし} other {# 個}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
    ja: "{count, plural, =0 {アイテムなし} other {# 件}}",
  },
  { count: 0 }
); // → "No items"

it(
  {
    ko: "{count, plural, =0 {項目なし} other {# 個}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
    ja: "{count, plural, =0 {アイテムなし} other {# 件}}",
  },
  { count: 1 }
); // → "1 item"

it(
  {
    ko: "{count, plural, =0 {項目なし} other {# 個}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
    ja: "{count, plural, =0 {アイテムなし} other {# 件}}",
  },
  { count: 5 }
); // → "5 items"

// セレクト
it(
  {
    ko: "{gender, select, male {彼} female {彼女} other {彼ら}}",
    en: "{gender, select, male {He} female {She} other {They}}",
    ja: "{gender, select, male {彼} female {彼女} other {彼ら}}",
  },
  { gender: "female" }
); // → "She"

// テキストと組み合わせ
it(
  {
    ko: "{name}님이 {count, plural, =0 {メッセージがありません} other {# 件のメッセージがあります}}",
    en: "{name} has {count, plural, =0 {no messages} one {# message} other {# messages}}",
    ja: "{name}さんは{count, plural, =0 {メッセージがありません} other {# 件のメッセージがあります}}",
  },
  { name: "John", count: 3 }
); // → "John has 3 messages"
```

### サポートされる構文

| 構文                   | 説明                                                           | 例                                           |
| ---------------------- | -------------------------------------------------------------- | -------------------------------------------- |
| `{var}`                | 単純な変数置換                                                 | `{name}` → "John"                            |
| `{var, plural, ...}`   | 数値ベースの複数形選択（`=0`、`=1`、`one`、`other`など）       | `{count, plural, one {# 件} other {# 件}}`   |
| `{var, select, ...}`   | 文字列値ベースの選択                                           | `{gender, select, male {彼} female {彼女}}`  |
| `#`                    | 複数形内で現在の数値を表示                                     | `# items` → "5 items"                        |

### 日付、数値、時刻フォーマット

ICUはロケール対応の日付、数値、時刻フォーマットもサポートしています：

```typescript
// 数値フォーマット
it({
  en: 'Price: {price, number}',
  ja: '価格: {price, number}'
}, { price: 1234.56 })  // → "価格: 1,234.56"

it({
  en: 'Discount: {rate, number, percent}',
  ja: '割引: {rate, number, percent}'
}, { rate: 0.25 })  // → "割引: 25%"

// 日付フォーマット
it({
  en: 'Created: {date, date, long}',
  ja: '作成日: {date, date, long}'
}, { date: new Date('2024-03-15') })  // → "作成日: 2024年3月15日"

it({
  en: 'Due: {date, date, short}',
  ja: '期限: {date, date, short}'
}, { date: new Date() })  // → "期限: 2024/03/15"

// 時刻フォーマット
it({
  en: 'Time: {time, time, short}',
  ja: '時刻: {time, time, short}'
}, { time: new Date() })  // → "時刻: 14:30"

// 組み合わせ
it({
  en: 'Order on {date, date, short}: {total, number, currency}',
  ja: '{date, date, short}の注文: {total, number, currency}'
}, { date: new Date(), total: 99.99 })
```

**サポートされるスタイル:**
- `number`: `decimal`, `percent`, `integer`, `currency`, `compact`, `compactLong`
- `date`: `short`, `medium`, `long`, `full`
- `time`: `short`, `medium`, `long`, `full`

### 相対時間フォーマット

自動単位検出による人間が読みやすい相対時間：

```typescript
// 相対時間
it({
  en: 'Updated {time, relativeTime}',
  ja: '{time, relativeTime}に更新'
}, { time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) })
// → "3日前に更新"

// スタイルオプション: long（デフォルト）、short、narrow
it({ ja: '{time, relativeTime, short}' }, { time: pastDate })
// → "3日前"

it({ ja: '{time, relativeTime, narrow}' }, { time: pastDate })
// → "3日前"
```

### リストフォーマット

ロケール対応のリスト結合：

```typescript
// リスト（conjunction - 「と」）
it({
  en: 'Invited: {names, list}',
  ja: '招待済み: {names, list}'
}, { names: ['Alice', 'Bob', 'Charlie'] })
// en → "Invited: Alice, Bob, and Charlie"
// ja → "招待済み: Alice、Bob、Charlie"

// Disjunction（「または」）
it({ ja: '{options, list, disjunction}' }, { options: ['A', 'B', 'C'] })
// → "A、B、またはC"

// Unit（接続詞なし）
it({ ja: '{items, list, unit}' }, { items: ['10kg', '5m', '3L'] })
// → "10kg、5m、3L"
```

### 通貨フォーマット

自動通貨シンボル検出によるロケール対応の通貨フォーマット：

```typescript
// 通貨フォーマット
it({
  en: 'Total: {price, currency, USD}',
  ja: '合計: {price, currency, JPY}'
}, { price: 42000 })
// en → "Total: $42,000.00"
// ja → "合計: ￥42,000"

// 通貨コード省略時はUSDデフォルト
it({ en: '{price, currency}' }, { price: 100 })
// → "$100.00"
```

### コンパクト数値フォーマット

大きな値の短縮数値表示：

```typescript
// コンパクト（short）
it({
  en: '{count, number, compact} views',
  ja: '{count, number, compact} 回視聴'
}, { count: 1500000 })
// en → "1.5M views"
// ja → "150万 回視聴"

// コンパクト（long）
it({ en: '{count, number, compactLong}' }, { count: 1500000 })
// → "1.5 million"
```

---

## 名前空間サポート

大規模アプリケーション向けの翻訳整理：

```typescript
import { loadDictionaries, t, getLoadedNamespaces, clearDictionaries } from 'inline-i18n-multi'

// 名前空間付きでロード
loadDictionaries({
  en: { hello: 'Hello', goodbye: 'Goodbye' },
  ja: { hello: 'こんにちは', goodbye: 'さようなら' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme' },
  ja: { title: '設定', theme: 'テーマ' }
}, 'settings')

// 名前空間プレフィックス付きで使用
t('common:hello')      // → "こんにちは"
t('settings:title')    // → "設定"

// ネストしたキーも動作
t('common:buttons.submit')

// 名前空間なし = 'default'（後方互換性）
loadDictionaries({ ja: { greeting: 'こんにちは' } })
t('greeting')  // → "こんにちは"

// ロードされた全ての名前空間を取得
getLoadedNamespaces()  // → ['common', 'settings', 'default']

// 特定の名前空間をクリア
clearDictionaries('settings')

// 全てクリア
clearDictionaries()
```

---

## デバッグモード

欠落とフォールバック翻訳のデバッグ用視覚的表示：

```typescript
import { configure, setLocale, it, t } from 'inline-i18n-multi'

// デバッグモードを有効化
configure({ debugMode: true })

// 欠落した翻訳はプレフィックスを表示
setLocale('fr')
it({ en: 'Hello', ja: 'こんにちは' })
// → "[fr -> en] Hello"

t('missing.key')
// → "[MISSING: en] missing.key"

// カスタムフォーマット
configure({
  debugMode: {
    showMissingPrefix: true,
    showFallbackPrefix: true,
    missingPrefixFormat: (locale, key) => `[!${locale}] `,
    fallbackPrefixFormat: (from, to) => `[${from}=>${to}] `,
  }
})
```

---

## リッチテキスト補間

翻訳にReactコンポーネントを埋め込みます：

```tsx
import { RichText, useRichText } from 'inline-i18n-multi-react'

// コンポーネント構文
<RichText
  translations={{
    en: 'Read <link>terms</link> and <bold>agree</bold>',
    ja: '<link>利用規約</link>を読んで<bold>同意</bold>してください'
  }}
  components={{
    link: (text) => <a href="/terms">{text}</a>,
    bold: (text) => <strong>{text}</strong>
  }}
/>

// フック構文
const richT = useRichText({
  link: (text) => <a href="/terms">{text}</a>,
  bold: (text) => <strong>{text}</strong>
})
richT({ en: 'Click <link>here</link>', ja: '<link>ここ</link>をクリック' })
```

---

## 遅延読み込み

辞書を非同期的にオンデマンドでロードします：

```typescript
import { configure, loadAsync, isLoaded, t } from 'inline-i18n-multi'

// ローダーを設定
configure({
  loader: (locale, namespace) => import(`./locales/${locale}/${namespace}.json`)
})

// オンデマンドでロード
await loadAsync('ja', 'dashboard')
t('dashboard:title')

// ロード状態を確認
isLoaded('ja', 'dashboard')  // → true
```

### Reactフック

```tsx
import { useLoadDictionaries } from 'inline-i18n-multi-react'

function Dashboard() {
  const { isLoading, error } = useLoadDictionaries('ja', 'dashboard')
  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <Content />
}
```

---

## 設定

フォールバック動作と警告のグローバル設定を構成します：

```typescript
import { configure, resetConfig, getConfig } from 'inline-i18n-multi'

configure({
  // 最終フォールバックロケール（デフォルト: 'en'）
  fallbackLocale: 'en',

  // BCP 47タグから親ロケールを自動抽出（デフォルト: true）
  // zh-TW → zh → fallbackLocale
  autoParentLocale: true,

  // 特定ロケールのカスタムフォールバックチェーン
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en'],  // ブラジルポルトガル語 → ポルトガル語 → スペイン語 → 英語
  },

  // 翻訳欠落警告を有効化（デフォルト: 開発モードでtrue）
  warnOnMissing: true,

  // カスタム警告ハンドラー
  onMissingTranslation: (warning) => {
    console.warn(`欠落: ${warning.requestedLocale}`, warning)
  },
})

// デフォルトにリセット
resetConfig()

// 現在の設定を取得
const config = getConfig()
```

### ロケールフォールバックチェーン

BCP 47親ロケールサポートによる自動ロケールフォールバック：

```typescript
import { setLocale, it, t, loadDictionaries } from 'inline-i18n-multi'

// 自動BCP 47フォールバック: zh-TW → zh → en
setLocale('zh-TW')
it({ en: 'Hello', zh: '你好' })  // → '你好'（zhにフォールバック）

// t()でも動作
loadDictionaries({
  en: { greeting: 'Hello' },
  zh: { greeting: '你好' },
})
setLocale('zh-TW')
t('greeting')  // → '你好'

// カスタムフォールバックチェーン
configure({
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en']
  }
})
setLocale('pt-BR')
it({ en: 'Hello', es: 'Hola' })  // → 'Hola'（チェーンを通じてフォールバック）
```

### 翻訳欠落警告

翻訳が欠落した場合に通知を受け取ります：

```typescript
import { configure, setLocale, it } from 'inline-i18n-multi'

configure({
  warnOnMissing: true,
  onMissingTranslation: (warning) => {
    // warning: {
    //   type: 'missing_translation',
    //   requestedLocale: 'fr',
    //   availableLocales: ['en', 'ko'],
    //   fallbackUsed: 'en',
    //   key: 'greeting'  // t()のみ
    // }
    console.warn(`${warning.requestedLocale}の翻訳が欠落しています`)
  }
})

setLocale('fr')
it({ en: 'Hello', ko: '안녕하세요' })  // 警告: frの翻訳が欠落しています
```

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

## サンプル

[`examples/`](./examples)ディレクトリでサンプルプロジェクトをご確認ください：

| サンプル | 説明 |
|----------|------|
| [`basic`](./examples/basic) | 基本的なTypeScriptの使い方 |
| [`react`](./examples/react) | ViteベースのReactアプリ |
| [`nextjs`](./examples/nextjs) | Next.js 15 App Router |

### サンプルの実行

```bash
# クローンとインストール
git clone https://github.com/exiivy98/inline-i18n-multi.git
cd inline-i18n-multi
pnpm install

# 基本サンプルを実行
pnpm --filter inline-i18n-multi-basic-example start

# Reactサンプルを実行
pnpm --filter inline-i18n-multi-react-example dev

# Next.jsサンプルを実行
pnpm --filter inline-i18n-multi-nextjs-example dev
```

---

## VSCode拡張機能

> **注意:** VSCode拡張機能は近日中にマーケットプレイスで公開予定です。

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
| `t(key, vars?, locale?)` | ロケールオーバーライド可能なキーベース翻訳 |
| `loadDictionaries(dicts, namespace?)` | オプションの名前空間付きで翻訳辞書をロード |
| `loadDictionary(locale, dict, namespace?)` | オプションの名前空間付きで単一ロケールの辞書をロード |
| `hasTranslation(key, locale?)` | 翻訳キーの存在確認（namespace:keyサポート） |
| `getLoadedLocales()` | ロードされたロケールコードの配列を返す |
| `getLoadedNamespaces()` | ロードされた名前空間名の配列を返す |
| `getDictionary(locale, namespace?)` | 特定ロケールと名前空間の辞書を返す |
| `clearDictionaries(namespace?)` | 辞書をクリア（全てまたは特定の名前空間） |
| `configure(options)` | グローバル設定（フォールバック、警告、デバッグ） |
| `getConfig()` | 現在の設定を取得 |
| `resetConfig()` | 設定をデフォルトにリセット |
| `loadAsync(locale, namespace?)` | 設定されたローダーを使用して非同期辞書ロード |
| `isLoaded(locale, namespace?)` | 辞書がロードされているか確認 |
| `parseRichText(template, names)` | リッチテキストテンプレートをセグメントに解析 |

### Reactフック＆コンポーネント

| エクスポート | 説明 |
|-------------|------|
| `LocaleProvider` | ロケール用コンテキストプロバイダー |
| `useLocale()` | `[locale, setLocale]`を返すフック |
| `useT()` | 現在のロケールにバインドされた`t`関数を返すフック |
| `T` | 翻訳コンポーネント |
| `RichText` | コンポーネント埋め込み対応のリッチテキスト翻訳コンポーネント |
| `useRichText(components)` | リッチテキスト翻訳関数を返すフック |
| `useLoadDictionaries(locale, ns?)` | ロード状態付きの遅延読み込みフック |

### 型

```typescript
type Locale = string
type Translations = Record<Locale, string>
type TranslationVars = Record<string, string | number | Date | string[]>

interface Config {
  defaultLocale: Locale
  fallbackLocale?: Locale
  autoParentLocale?: boolean
  fallbackChain?: Record<Locale, Locale[]>
  warnOnMissing?: boolean
  onMissingTranslation?: WarningHandler
  debugMode?: boolean | DebugModeOptions
  loader?: (locale: string, namespace?: string) => Promise<any>
}

interface DebugModeOptions {
  showMissingPrefix?: boolean
  showFallbackPrefix?: boolean
  missingPrefixFormat?: (locale: string, key?: string) => string
  fallbackPrefixFormat?: (requestedLocale: string, usedLocale: string, key?: string) => string
}

interface TranslationWarning {
  type: 'missing_translation'
  key?: string
  requestedLocale: string
  availableLocales: string[]
  fallbackUsed?: string
}

type WarningHandler = (warning: TranslationWarning) => void

interface RichTextSegment {
  type: 'text' | 'component'
  content: string
  name?: string
}
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

## 免責事項

本ソフトウェアは「現状のまま」提供され、いかなる保証もありません。著者は、本パッケージの使用により生じるいかなる損害や問題についても責任を負いません。ご利用は自己責任でお願いします。

---

## ライセンス

MIT © [exiivy98](https://github.com/exiivy98)
