# inline-i18n-multi

[![npm version](https://img.shields.io/npm/v/inline-i18n-multi.svg)](https://www.npmjs.com/package/inline-i18n-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**内联编写翻译，即时查找。**

[English](./README.md) | [한국어](./README.ko.md) | [日本語](./README.ja.md) | 中文

---

## 问题

传统的i18n库将翻译与代码分离：

```tsx
// Component.tsx
<p>{t('greeting.hello')}</p>

// en.json
{ "greeting": { "hello": "Hello" } }

// zh.json
{ "greeting": { "hello": "你好" } }
```

当你在应用中看到"Hello"并想在代码中找到它时，你需要：
1. 在JSON文件中搜索"Hello"
2. 找到`greeting.hello`键
3. 在代码中搜索该键
4. 终于找到`t('greeting.hello')`

**这很慢且令人沮丧。**

---

## 解决方案

使用`inline-i18n-multi`，翻译就在你的代码中：

```tsx
<p>{it('안녕하세요', 'Hello')}</p>
```

在应用中看到"Hello"？只需在代码库中搜索"Hello"。**完成。**

---

## 功能

- **内联翻译** - 在使用的地方直接编写翻译
- **即时搜索** - 在代码库中立即搜索任何文本
- **类型安全** - 包含变量类型检查的完整TypeScript支持
- **多语言支持** - 支持任意数量的语言环境
- **框架支持** - React、Next.js（App Router和Pages Router）
- **开发者工具** - 用于验证的CLI，用于导航的VSCode扩展
- **i18n兼容** - 支持带有JSON字典和复数形式的传统基于键的翻译
- **ICU Message Format** - 支持复数、选择、日期、数字、时间、相对时间、列表格式化
- **语言环境回退链** - BCP 47父语言环境支持（`zh-TW` → `zh` → `en`）
- **缺失翻译警告** - 可自定义处理程序的开发时诊断
- **命名空间支持** - 为大型应用组织翻译（`t('common:greeting')`）
- **调试模式** - 缺失/回退翻译的可视化指示
- **货币格式化** - 语言环境感知的货币显示（`{price, currency, USD}`）
- **紧凑数字格式化** - 短数字显示（`{count, number, compact}`）
- **富文本插值** - 在翻译中嵌入React组件（`<link>text</link>`）
- **懒加载** - 按需异步字典加载（`loadAsync()`）
- **自定义格式化器注册** - 注册自定义ICU格式化器（`registerFormatter('phone', fn)` → `{num, phone}`）
- **插值守卫** - 优雅地处理缺失变量（`configure({ missingVarHandler })`）
- **语言环境检测** - 从Cookie/浏览器自动检测语言环境（`detectLocale()` + React `useDetectedLocale()`）
- **Selectordinal** - 完整的ICU `selectordinal`序数复数支持（`{n, selectordinal, ...}`）
- **ICU消息缓存** - 解析后的ICU AST缓存，提升性能（`configure({ icuCacheSize: 500 })`）
- **复数简写** - 简洁的复数语法（`{count, p, item|items}`）
- **语言环境持久化** - 自动保存/恢复语言环境到Cookie或localStorage
- **CLI `--strict`模式** - ICU类型一致性检查（`npx inline-i18n validate --strict`）

---

## 包

| 包 | 描述 |
|---|------|
| [`inline-i18n-multi`](./packages/core) | 核心翻译函数 |
| [`inline-i18n-multi-react`](./packages/react) | React钩子和组件 |
| [`inline-i18n-multi-next`](./packages/next) | Next.js集成 |
| [`@inline-i18n-multi/cli`](./packages/cli) | CLI工具 |
| [`inline-i18n-multi-vscode`](./packages/vscode) | VSCode扩展 |

---

## 快速开始

### 安装

```bash
# npm
npm install inline-i18n-multi

# yarn
yarn add inline-i18n-multi

# pnpm
pnpm add inline-i18n-multi
```

### 基本用法

```typescript
import { it, setLocale } from 'inline-i18n-multi'

// 设置当前语言环境
setLocale('zh')

// 简写语法（韩语 + 英语）
it('안녕하세요', 'Hello')  // → "Hello"

// 对象语法（多语言）
it({ ko: '안녕하세요', en: 'Hello', zh: '你好' })  // → "你好"

// 使用变量
it('안녕, {name}님', 'Hello, {name}', { name: 'John' })  // → "Hello, John"
```

---

## 基于键的翻译（i18n兼容）

对于已经使用JSON翻译文件的项目，或者需要传统基于键的翻译时：

```typescript
import { t, loadDictionaries } from 'inline-i18n-multi'

// 加载翻译字典
loadDictionaries({
  en: {
    greeting: { hello: 'Hello', goodbye: 'Goodbye' },
    items: { count_one: '{count} item', count_other: '{count} items' },
    welcome: 'Welcome, {name}!'
  },
  zh: {
    greeting: { hello: '你好', goodbye: '再见' },
    items: { count_other: '{count}个项目' },
    welcome: '欢迎，{name}！'
  }
})

// 基本的基于键的翻译
t('greeting.hello')  // → "Hello"（当locale为'en'时）

// 使用变量
t('welcome', { name: 'John' })  // → "Welcome, John!"

// 复数支持（使用Intl.PluralRules）
t('items.count', { count: 1 })  // → "1 item"
t('items.count', { count: 5 })  // → "5 items"

// 覆盖语言环境
t('greeting.hello', undefined, 'zh')  // → "你好"
```

### 工具函数

```typescript
import { hasTranslation, getLoadedLocales, getDictionary } from 'inline-i18n-multi'

// 检查翻译是否存在
hasTranslation('greeting.hello')  // → true
hasTranslation('missing.key')     // → false

// 获取已加载的语言环境
getLoadedLocales()  // → ['en', 'zh']

// 获取特定语言环境的字典
getDictionary('en')  // → { greeting: { hello: 'Hello', ... }, ... }
```

---

## React集成

```bash
npm install inline-i18n-multi-react
```

```tsx
import { LocaleProvider, useLocale, it, T } from 'inline-i18n-multi-react'

function App() {
  return (
    <LocaleProvider locale="zh">
      <MyComponent />
    </LocaleProvider>
  )
}

function MyComponent() {
  const [locale, setLocale] = useLocale()

  return (
    <div>
      {/* 函数语法 */}
      <h1>{it('제목', 'Title')}</h1>

      {/* 组件语法 */}
      <T ko="환영합니다" en="Welcome" zh="欢迎" />

      {/* 使用变量 */}
      <T ko="{count}개의 항목" en="{count} items" zh="{count}个项目" count={5} />

      {/* 语言环境切换 */}
      <button onClick={() => setLocale('ko')}>한국어</button>
      <button onClick={() => setLocale('en')}>English</button>
      <button onClick={() => setLocale('zh')}>中文</button>
    </div>
  )
}
```

### useT钩子（基于键）

```tsx
import { useT, loadDictionaries } from 'inline-i18n-multi-react'

// 加载字典（通常在应用入口处）
loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  zh: { greeting: '你好', items: { count_other: '{count}个项目' } }
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

## Next.js集成

```bash
npm install inline-i18n-multi-next
```

### App Router（服务器组件）

```tsx
// app/page.tsx
import { it } from 'inline-i18n-multi-next/server'

export default async function Page() {
  return <h1>{await it('안녕하세요', 'Hello')}</h1>
}
```

### 服务器组件中的基于键翻译

要在服务器组件中使用 `t()`，必须先调用 `setLocale()`：

```tsx
// app/[locale]/page.tsx
import { t, setLocale, loadDictionaries } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ko: { greeting: '안녕하세요', items: { count_other: '{count}개' } },
  zh: { greeting: '你好', items: { count_other: '{count}个' } },
})

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setLocale(locale)  // 使用t()之前必须调用

  return (
    <div>
      <h1>{t('greeting')}</h1>
      <p>{t('items.count', { count: 5 })}</p>
    </div>
  )
}
```

### App Router（客户端组件）

```tsx
'use client'
import { it, LocaleProvider } from 'inline-i18n-multi-next/client'

export default function ClientComponent() {
  return <p>{it('클라이언트', 'Client')}</p>
}
```

### 客户端组件中的基于键翻译

```tsx
'use client'
import { useT, loadDictionaries } from 'inline-i18n-multi-next/client'

loadDictionaries({
  en: { nav: { home: 'Home', about: 'About' } },
  zh: { nav: { home: '首页', about: '关于' } }
})

export default function NavMenu() {
  const t = useT()
  return <nav><a href="/">{t('nav.home')}</a></nav>
}
```

### 中间件（语言环境检测）

```typescript
// middleware.ts
import { createI18nMiddleware } from 'inline-i18n-multi-next/middleware'

export default createI18nMiddleware({
  locales: ['ko', 'en', 'zh'],
  defaultLocale: 'ko',
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

### SEO优化（App Router）

在Next.js App Router中实现完整SEO支持的服务器工具：

```tsx
// app/[locale]/layout.tsx
import { configureI18n, generateLocaleParams, createMetadata, getAlternates } from 'inline-i18n-multi-next/server'

// 配置i18n
configureI18n({
  locales: ['ko', 'en', 'zh'],
  defaultLocale: 'ko',
  baseUrl: 'https://example.com'
})

// SSG：预渲染所有语言环境
export function generateStaticParams() {
  return generateLocaleParams()  // → [{ locale: 'ko' }, { locale: 'en' }, { locale: 'zh' }]
}

// 动态元数据
export async function generateMetadata({ params }) {
  const { locale } = await params

  return createMetadata(
    {
      title: { ko: '홈', en: 'Home', zh: '首页' },
      description: { ko: '환영합니다', en: 'Welcome', zh: '欢迎' },
    },
    locale,
    ''  // 当前路径
  )
}

// Hreflang链接（用于SEO）
const alternates = getAlternates('/about', 'ko')
// → {
//   canonical: 'https://example.com/ko/about',
//   languages: {
//     ko: 'https://example.com/ko/about',
//     en: 'https://example.com/en/about',
//     zh: 'https://example.com/zh/about',
//     'x-default': 'https://example.com/ko/about'
//   }
// }
```

**SEO功能：**
- **SSG/SSR** - 使用`generateStaticParams()`预渲染所有语言环境
- **动态元数据** - 使用`createMetadata()`实现每个语言环境的title/description
- **Hreflang** - 使用`getAlternates()`为搜索引擎提供语言替代链接
- **Cookie持久化** - 调用`setLocale()`时自动保存
- **URL路由** - 使用`/[locale]/...`模式实现SEO友好的URL

---

## 语言对辅助函数

用于常见语言组合的简写辅助函数：

```typescript
import { it_zh, en_zh, ja_zh } from 'inline-i18n-multi'

// 韩语 ↔ 中文
it_zh('안녕하세요', '你好')

// 英语 ↔ 中文
en_zh('Hello', '你好')

// 日语 ↔ 中文
ja_zh('こんにちは', '你好')
```

可用的辅助函数：
- `it`（ko↔en）、`it_ja`、`it_zh`、`it_es`、`it_fr`、`it_de`
- `en_ja`、`en_zh`、`en_es`、`en_fr`、`en_de`
- `ja_zh`、`ja_es`、`zh_es`

---

## ICU Message Format

对于需要复数和条件文本的复杂翻译，使用ICU Message Format：

```typescript
import { it, setLocale } from "inline-i18n-multi";

setLocale("en");

// 复数
it(
  {
    ko: "{count, plural, =0 {没有项目} other {# 个}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
    zh: "{count, plural, =0 {没有项目} other {# 个项目}}",
  },
  { count: 0 }
); // → "No items"

it(
  {
    ko: "{count, plural, =0 {没有项目} other {# 个}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
    zh: "{count, plural, =0 {没有项目} other {# 个项目}}",
  },
  { count: 1 }
); // → "1 item"

it(
  {
    ko: "{count, plural, =0 {没有项目} other {# 个}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
    zh: "{count, plural, =0 {没有项目} other {# 个项目}}",
  },
  { count: 5 }
); // → "5 items"

// 选择
it(
  {
    ko: "{gender, select, male {他} female {她} other {他们}}",
    en: "{gender, select, male {He} female {She} other {They}}",
    zh: "{gender, select, male {他} female {她} other {他们}}",
  },
  { gender: "female" }
); // → "She"

// 与文本结合
it(
  {
    ko: "{name}님이 {count, plural, =0 {没有消息} other {有 # 条消息}}",
    en: "{name} has {count, plural, =0 {no messages} one {# message} other {# messages}}",
    zh: "{name}{count, plural, =0 {没有消息} other {有 # 条消息}}",
  },
  { name: "John", count: 3 }
); // → "John has 3 messages"
```

### 支持的语法

| 语法                   | 描述                                                      | 示例                                         |
| ---------------------- | --------------------------------------------------------- | -------------------------------------------- |
| `{var}`                | 简单变量替换                                              | `{name}` → "John"                            |
| `{var, plural, ...}`   | 基于数字的复数选择（`=0`、`=1`、`one`、`other`等）        | `{count, plural, one {# 个} other {# 个}}`   |
| `{var, select, ...}`   | 基于字符串值的选择                                        | `{gender, select, male {他} female {她}}`    |
| `#`                    | 在复数中显示当前数值                                      | `# items` → "5 items"                        |

### 日期、数字、时间格式化

ICU还支持本地化感知的日期、数字、时间格式化：

```typescript
// 数字格式化
it({
  en: 'Price: {price, number}',
  zh: '价格: {price, number}'
}, { price: 1234.56 })  // → "价格: 1,234.56"

it({
  en: 'Discount: {rate, number, percent}',
  zh: '折扣: {rate, number, percent}'
}, { rate: 0.25 })  // → "折扣: 25%"

// 日期格式化
it({
  en: 'Created: {date, date, long}',
  zh: '创建日期: {date, date, long}'
}, { date: new Date('2024-03-15') })  // → "创建日期: 2024年3月15日"

it({
  en: 'Due: {date, date, short}',
  zh: '截止: {date, date, short}'
}, { date: new Date() })  // → "截止: 2024/3/15"

// 时间格式化
it({
  en: 'Time: {time, time, short}',
  zh: '时间: {time, time, short}'
}, { time: new Date() })  // → "时间: 14:30"

// 组合
it({
  en: 'Order on {date, date, short}: {total, number, currency}',
  zh: '{date, date, short}订单: {total, number, currency}'
}, { date: new Date(), total: 99.99 })
```

**支持的样式:**
- `number`: `decimal`, `percent`, `integer`, `currency`, `compact`, `compactLong`
- `date`: `short`, `medium`, `long`, `full`
- `time`: `short`, `medium`, `long`, `full`

### 相对时间格式化

自动单位检测的人类可读相对时间：

```typescript
// 相对时间
it({
  en: 'Updated {time, relativeTime}',
  zh: '{time, relativeTime}更新'
}, { time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) })
// → "3天前更新"

// 样式选项: long（默认）、short、narrow
it({ zh: '{time, relativeTime, short}' }, { time: pastDate })
// → "3天前"

it({ zh: '{time, relativeTime, narrow}' }, { time: pastDate })
// → "3天前"
```

### 列表格式化

本地化感知的列表连接：

```typescript
// 列表（conjunction - "和"）
it({
  en: 'Invited: {names, list}',
  zh: '已邀请: {names, list}'
}, { names: ['Alice', 'Bob', 'Charlie'] })
// en → "Invited: Alice, Bob, and Charlie"
// zh → "已邀请: Alice、Bob和Charlie"

// Disjunction（"或"）
it({ zh: '{options, list, disjunction}' }, { options: ['A', 'B', 'C'] })
// → "A、B或C"

// Unit（无连词）
it({ zh: '{items, list, unit}' }, { items: ['10kg', '5m', '3L'] })
// → "10kg、5m、3L"
```

### 货币格式化

语言环境感知的货币格式化与自动符号检测：

```typescript
// 货币格式化
it({
  en: 'Total: {price, currency, USD}',
  zh: '合计: {price, currency, USD}'
}, { price: 42000 })
// en → "Total: $42,000.00"
// zh → "合计: $42,000.00"

// 韩元
it({ ko: '{price, currency, KRW}' }, { price: 42000 })
// → "₩42,000"

// 欧元（德语语言环境）
it({ de: '{price, currency, EUR}' }, { price: 1234.5 })
// → "1.234,50 €"

// 省略货币代码时默认使用USD
it({ en: '{price, currency}' }, { price: 100 })
// → "$100.00"
```

### 紧凑数字格式化

用于大数值的短数字显示：

```typescript
// 紧凑（短）
it({
  en: '{count, number, compact} views',
  ko: '{count, number, compact} 조회'
}, { count: 1500000 })
// en → "1.5M views"
// ko → "150만 조회"

// 紧凑（长）
it({ en: '{count, number, compactLong}' }, { count: 1500000 })
// → "1.5 million"
```

---

## 命名空间支持

为大型应用程序组织翻译：

```typescript
import { loadDictionaries, t, getLoadedNamespaces, clearDictionaries } from 'inline-i18n-multi'

// 使用命名空间加载
loadDictionaries({
  en: { hello: 'Hello', goodbye: 'Goodbye' },
  zh: { hello: '你好', goodbye: '再见' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme' },
  zh: { title: '设置', theme: '主题' }
}, 'settings')

// 使用命名空间前缀
t('common:hello')      // → "你好"
t('settings:title')    // → "设置"

// 嵌套键也可以使用
t('common:buttons.submit')

// 没有命名空间 = 'default'（向后兼容）
loadDictionaries({ zh: { greeting: '嗨' } })
t('greeting')  // → "嗨"

// 获取所有已加载的命名空间
getLoadedNamespaces()  // → ['common', 'settings', 'default']

// 清除特定命名空间
clearDictionaries('settings')

// 清除全部
clearDictionaries()
```

---

## 调试模式

用于调试缺失和回退翻译的可视化指示：

```typescript
import { configure, setLocale, it, t } from 'inline-i18n-multi'

// 启用调试模式
configure({ debugMode: true })

// 缺失的翻译显示前缀
setLocale('fr')
it({ en: 'Hello', zh: '你好' })
// → "[fr -> en] Hello"

t('missing.key')
// → "[MISSING: en] missing.key"

// 自定义格式
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

## 富文本插值

在翻译中嵌入React组件：

```tsx
import { RichText, useRichText } from 'inline-i18n-multi-react'

// 组件语法
<RichText
  translations={{
    en: 'Read <link>terms</link> and <bold>agree</bold>',
    zh: '阅读<link>条款</link>并<bold>同意</bold>',
    ko: '<link>약관</link>을 읽고 <bold>동의</bold>해주세요'
  }}
  components={{
    link: (text) => <a href="/terms">{text}</a>,
    bold: (text) => <strong>{text}</strong>
  }}
/>

// 钩子语法
const richT = useRichText({
  link: (text) => <a href="/terms">{text}</a>,
  bold: (text) => <strong>{text}</strong>
})
richT({ en: 'Click <link>here</link>', zh: '点击<link>这里</link>' })
```

---

## 懒加载

按需异步加载字典：

```typescript
import { configure, loadAsync, isLoaded, t } from 'inline-i18n-multi'

// 配置加载器
configure({
  loader: (locale, namespace) => import(`./locales/${locale}/${namespace}.json`)
})

// 按需加载
await loadAsync('zh', 'dashboard')
t('dashboard:title')

// 检查加载状态
isLoaded('zh', 'dashboard')  // → true
```

### React钩子

```tsx
import { useLoadDictionaries } from 'inline-i18n-multi-react'

function Dashboard() {
  const { isLoading, error } = useLoadDictionaries('zh', 'dashboard')
  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <Content />
}
```

---

## 自定义格式化器注册

注册自定义ICU格式化函数，用于特定领域的格式化：

```typescript
import { registerFormatter, it } from 'inline-i18n-multi'

registerFormatter('phone', (value, locale, style?) => {
  const s = String(value)
  return `(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6)}`
})

it({ en: 'Call {num, phone}' }, { num: '2125551234' })
// → "Call (212) 555-1234"
```

注册后，自定义格式化器可以在任何ICU消息模式中使用 `{variable, formatterName}` 语法。

---

## 插值守卫

优雅地处理缺失变量，而不是留下原始的 `{varName}` 占位符：

```typescript
import { configure, it } from 'inline-i18n-multi'

configure({
  missingVarHandler: (varName, locale) => `[${varName}]`
})

it({ en: 'Hello {name}' })
// → "Hello [name]"（而不是 "Hello {name}"）
```

这在开发时有助于尽早发现缺失变量，或在生产环境中提供安全的回退显示。

---

## 语言环境检测

从多个来源自动检测用户的首选语言环境：

```typescript
import { detectLocale, setLocale } from 'inline-i18n-multi'

const locale = detectLocale({
  supportedLocales: ['en', 'ko', 'ja'],
  defaultLocale: 'en',
  sources: ['cookie', 'navigator'],
  cookieName: 'NEXT_LOCALE',
})
setLocale(locale)
```

### React钩子

```tsx
import { useDetectedLocale } from 'inline-i18n-multi-react'

function App() {
  useDetectedLocale({
    supportedLocales: ['en', 'ko'],
    defaultLocale: 'en',
    sources: ['cookie', 'navigator'],
  })
}
```

**检测来源**（按顺序检查）：
- `cookie` - 从指定的Cookie读取（例如 `NEXT_LOCALE`）
- `navigator` - 从 `navigator.languages` / `navigator.language` 读取

---

## ICU消息缓存

解析后的ICU AST缓存，避免重复解析相同的消息模式，提升性能：

```typescript
import { configure, clearICUCache } from 'inline-i18n-multi'

// 设置缓存大小（默认: 500）
configure({ icuCacheSize: 500 })

// 禁用缓存
configure({ icuCacheSize: 0 })

// 手动清除缓存
clearICUCache()
```

缓存使用FIFO（先进先出）淘汰策略。当缓存达到上限时，最早的条目会被自动移除。

---

## 复数简写

无需编写冗长的ICU复数语法，使用简洁的 `p` 简写：

```typescript
import { it, setLocale } from 'inline-i18n-multi'

setLocale('en')

// 双参数: singular|plural
it({ en: '{count, p, item|items}' }, { count: 1 })   // → "1 item"
it({ en: '{count, p, item|items}' }, { count: 5 })   // → "5 items"

// 三参数: zero|singular|plural
it({ en: '{count, p, none|item|items}' }, { count: 0 })  // → "none"
it({ en: '{count, p, none|item|items}' }, { count: 1 })  // → "1 item"
it({ en: '{count, p, none|item|items}' }, { count: 5 })  // → "5 items"

// 多语言示例
it({
  en: '{count, p, item|items}',
  zh: '{count, p, 个项目|个项目}',
  ko: '{count, p, 개|개}'
}, { count: 3 })
```

---

## 语言环境持久化

自动保存和恢复用户的语言环境设置：

```typescript
import { configure, restoreLocale, setLocale } from 'inline-i18n-multi'

// 配置持久化
configure({
  persistLocale: {
    storage: 'cookie',        // 'cookie' | 'localStorage'
    key: 'LOCALE',            // 存储键名
    expires: 365              // Cookie过期天数（仅cookie）
  }
})

// 从存储中恢复语言环境
restoreLocale()

// setLocale() 会自动保存到配置的存储中
setLocale('zh')  // 自动保存到Cookie或localStorage
```

**存储选项：**
- `cookie` - 保存到Cookie，支持设置过期天数，适合服务端渲染
- `localStorage` - 保存到localStorage，适合纯客户端应用

---

## CLI `--strict`模式

使用 `--strict` 标志检查ICU消息中的类型一致性：

```bash
npx inline-i18n validate --strict

# 输出:
# ⚠️  ICU类型不一致: "count"
#    src/Header.tsx:12  en: plural
#    src/Header.tsx:12  zh: select
#
# ✅ 所有ICU类型一致（无--strict错误）
```

严格模式会验证同一变量在不同语言环境中是否使用了一致的ICU类型（如 `plural`、`select`、`number` 等）。

---

## 配置

配置回退行为和警告的全局设置：

```typescript
import { configure, resetConfig, getConfig } from 'inline-i18n-multi'

configure({
  // 最终回退语言环境（默认: 'en'）
  fallbackLocale: 'en',

  // 从BCP 47标签自动提取父语言环境（默认: true）
  // zh-TW → zh → fallbackLocale
  autoParentLocale: true,

  // 特定语言环境的自定义回退链
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en'],  // 巴西葡萄牙语 → 葡萄牙语 → 西班牙语 → 英语
  },

  // 启用缺失翻译警告（默认: 开发模式下为true）
  warnOnMissing: true,

  // 自定义警告处理程序
  onMissingTranslation: (warning) => {
    console.warn(`缺失: ${warning.requestedLocale}`, warning)
  },
})

// 重置为默认值
resetConfig()

// 获取当前配置
const config = getConfig()
```

### 语言环境回退链

通过BCP 47父语言环境支持实现自动语言环境回退：

```typescript
import { setLocale, it, t, loadDictionaries } from 'inline-i18n-multi'

// 自动BCP 47回退: zh-TW → zh → en
setLocale('zh-TW')
it({ en: 'Hello', zh: '你好' })  // → '你好'（回退到zh）

// 在t()中也有效
loadDictionaries({
  en: { greeting: 'Hello' },
  zh: { greeting: '你好' },
})
setLocale('zh-TW')
t('greeting')  // → '你好'

// 自定义回退链
configure({
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en']
  }
})
setLocale('pt-BR')
it({ en: 'Hello', es: 'Hola' })  // → 'Hola'（通过链回退）
```

### 缺失翻译警告

当翻译缺失时收到通知：

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
    //   key: 'greeting'  // 仅用于t()
    // }
    console.warn(`缺失${warning.requestedLocale}的翻译`)
  }
})

setLocale('fr')
it({ en: 'Hello', ko: '안녕하세요' })  // 警告: 缺失fr的翻译
```

---

## CLI工具

```bash
npm install -D @inline-i18n-multi/cli
```

### 查找翻译

在翻译中搜索文本：

```bash
npx inline-i18n find "Hello"

# 输出:
# src/components/Header.tsx:12:5
#   ko: 안녕하세요
#   en: Hello
```

### 验证翻译

检查一致性：

```bash
npx inline-i18n validate --locales ko,en,zh

# 输出:
# ⚠️  "안녕하세요"的翻译不一致
#    src/Header.tsx:12  en: "Hello"
#    src/Footer.tsx:8   en: "Hi"
#
# 📭 缺少语言环境: zh
#    src/About.tsx:15
```

### 覆盖率报告

```bash
npx inline-i18n coverage --locales ko,en,zh

# 输出:
# 翻译覆盖率:
#
# 语言环境  覆盖率     已翻译
# ─────────────────────────────
# ko      ██████████ 100%  150/150
# en      ██████████ 100%  150/150
# zh      ████░░░░░░  40%   60/150
```

---

## 示例

请查看[`examples/`](./examples)目录中的示例项目：

| 示例 | 描述 |
|------|------|
| [`basic`](./examples/basic) | 基本TypeScript用法 |
| [`react`](./examples/react) | 基于Vite的React应用 |
| [`nextjs`](./examples/nextjs) | Next.js 15 App Router |

### 运行示例

```bash
# 克隆并安装
git clone https://github.com/exiivy98/inline-i18n-multi.git
cd inline-i18n-multi
pnpm install

# 运行基本示例
pnpm --filter inline-i18n-multi-basic-example start

# 运行React示例
pnpm --filter inline-i18n-multi-react-example dev

# 运行Next.js示例
pnpm --filter inline-i18n-multi-nextjs-example dev
```

---

## VSCode扩展

> **注意:** VSCode扩展将很快在市场上架。

从VSCode市场安装`inline-i18n-multi-vscode`。

### 功能

- **悬停信息** - 将鼠标悬停在`it()`调用上时显示所有翻译
- **查找用法** - 在整个工作区中搜索翻译
- **快速导航** - 使用`Cmd+Shift+T`跳转到翻译用法

---

## API参考

### 核心函数

| 函数 | 描述 |
|------|------|
| `it(ko, en, vars?)` | 使用韩语和英语翻译 |
| `it(translations, vars?)` | 使用对象语法翻译 |
| `setLocale(locale)` | 设置当前语言环境 |
| `getLocale()` | 获取当前语言环境 |
| `t(key, vars?, locale?)` | 可覆盖语言环境的基于键的翻译 |
| `loadDictionaries(dicts, namespace?)` | 使用可选命名空间加载翻译字典 |
| `loadDictionary(locale, dict, namespace?)` | 使用可选命名空间加载单个语言环境的字典 |
| `hasTranslation(key, locale?)` | 检查翻译键是否存在（支持namespace:key） |
| `getLoadedLocales()` | 返回已加载的语言环境代码数组 |
| `getLoadedNamespaces()` | 返回已加载的命名空间名称数组 |
| `getDictionary(locale, namespace?)` | 返回特定语言环境和命名空间的字典 |
| `clearDictionaries(namespace?)` | 清除字典（全部或特定命名空间） |
| `configure(options)` | 全局设置（回退、警告、调试、missingVarHandler） |
| `getConfig()` | 获取当前配置 |
| `resetConfig()` | 重置配置为默认值 |
| `registerFormatter(name, fn)` | 注册自定义ICU格式化器 |
| `detectLocale(options)` | 从Cookie/浏览器检测语言环境 |
| `loadAsync(locale, namespace?)` | 使用配置的加载器异步加载字典 |
| `isLoaded(locale, namespace?)` | 检查字典是否已加载 |
| `parseRichText(template, names)` | 将富文本模板解析为段落 |
| `clearICUCache()` | 清除ICU消息解析缓存 |
| `restoreLocale()` | 从持久化存储中恢复语言环境 |

### React钩子和组件

| 导出 | 描述 |
|------|------|
| `LocaleProvider` | 语言环境上下文提供者 |
| `useLocale()` | 返回`[locale, setLocale]`的钩子 |
| `useT()` | 返回绑定到当前语言环境的`t`函数的钩子 |
| `T` | 翻译组件 |
| `RichText` | 支持嵌入组件的富文本翻译组件 |
| `useRichText(components)` | 返回富文本翻译函数的钩子 |
| `useLoadDictionaries(locale, ns?)` | 带加载状态的字典懒加载钩子 |
| `useDetectedLocale(options)` | 自动语言环境检测和设置钩子 |

### 类型

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
  loader?: (locale: Locale, namespace: string) => Promise<Record<string, unknown>>
  missingVarHandler?: (varName: string, locale: string) => string
  icuCacheSize?: number
  persistLocale?: PersistLocaleOptions
}

interface PersistLocaleOptions {
  storage: 'cookie' | 'localStorage'
  key?: string
  expires?: number
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
  componentName?: string
}
```

---

## 为什么选择内联翻译？

### 传统i18n

```
代码 → 键 → JSON文件 → 翻译
          ↑
      难以追踪
```

### 内联i18n

```
代码 ← 翻译（同一位置！）
```

| 方面 | 传统方式 | 内联方式 |
|------|----------|----------|
| 在代码中查找文本 | 困难（键查找） | 简单（直接搜索） |
| 添加翻译 | 创建键，添加到JSON | 内联编写 |
| 重构 | 更新键引用 | 自动 |
| 代码审查 | 单独检查JSON | 全部在diff中可见 |
| 类型安全 | 有限 | 完全支持 |

---

## 要求

- Node.js 18+
- TypeScript 5.0+（推荐）
- React 18+（用于React包）
- Next.js 13+（用于Next.js包）

---

## 贡献

欢迎贡献！请先阅读我们的[贡献指南](./CONTRIBUTING.md)。

```bash
# 克隆仓库
git clone https://github.com/exiivy98/inline-i18n-multi.git

# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test
```

---

## 免责声明

本软件按"原样"提供，不附带任何形式的保证。作者不对因使用本软件包而产生的任何损害或问题承担责任。使用风险由用户自行承担。

---

## 许可证

MIT © [exiivy98](https://github.com/exiivy98)
