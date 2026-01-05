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
- **构建时优化** - 使用Babel/SWC插件实现零运行时开销
- **多语言支持** - 支持任意数量的语言环境
- **框架支持** - React、Next.js（App Router和Pages Router）
- **开发者工具** - 用于验证的CLI，用于导航的VSCode扩展
- **i18n兼容** - 支持带有JSON字典和复数形式的传统基于键的翻译

---

## 包

| 包 | 描述 |
|---|------|
| [`inline-i18n-multi`](./packages/core) | 核心翻译函数 |
| [`inline-i18n-multi-react`](./packages/react) | React钩子和组件 |
| [`inline-i18n-multi-next`](./packages/next) | Next.js集成 |
| [`@inline-i18n-multi/cli`](./packages/cli) | CLI工具 |
| [`@inline-i18n-multi/babel-plugin`](./packages/babel-plugin) | Babel插件 |
| [`@inline-i18n-multi/swc-plugin`](./packages/swc-plugin) | SWC插件 |
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

## 构建时优化

为了更好的性能，在构建时转换`it()`调用。

### Babel插件

```bash
npm install -D @inline-i18n-multi/babel-plugin
```

```javascript
// babel.config.js
module.exports = {
  plugins: ['@inline-i18n-multi/babel-plugin'],
}
```

### SWC插件（Next.js 13+）

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

**转换前（源代码）：**
```typescript
it('안녕하세요', 'Hello')
```

**转换后（构建输出）：**
```typescript
__i18n_lookup('a1b2c3d4', { ko: '안녕하세요', en: 'Hello' })
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

## VSCode扩展

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
| `loadDictionaries(dicts)` | 加载多个语言环境的翻译字典 |
| `loadDictionary(locale, dict)` | 加载单个语言环境的字典 |
| `hasTranslation(key, locale?)` | 检查翻译键是否存在 |
| `getLoadedLocales()` | 返回已加载的语言环境代码数组 |
| `getDictionary(locale)` | 返回特定语言环境的字典 |

### React钩子和组件

| 导出 | 描述 |
|------|------|
| `LocaleProvider` | 语言环境上下文提供者 |
| `useLocale()` | 返回`[locale, setLocale]`的钩子 |
| `useT()` | 返回绑定到当前语言环境的`t`函数的钩子 |
| `T` | 翻译组件 |

### 类型

```typescript
type Locale = string
type Translations = Record<Locale, string>
type TranslationVars = Record<string, string | number>
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
