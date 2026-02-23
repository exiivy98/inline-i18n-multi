# inline-i18n-multi

[![npm version](https://img.shields.io/npm/v/inline-i18n-multi.svg)](https://www.npmjs.com/package/inline-i18n-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**번역을 인라인으로 작성하고, 즉시 찾으세요.**

[English](./README.md) | 한국어 | [日本語](./README.ja.md) | [中文](./README.zh.md)

---

## 문제점

기존 i18n 라이브러리는 번역을 코드와 분리합니다:

```tsx
// Component.tsx
<p>{t('greeting.hello')}</p>

// en.json
{ "greeting": { "hello": "Hello" } }

// ko.json
{ "greeting": { "hello": "안녕하세요" } }
```

앱에서 "Hello"를 보고 코드에서 찾으려면:

1. JSON 파일에서 "Hello" 검색
2. `greeting.hello` 키 찾기
3. 코드에서 해당 키 검색
4. 드디어 `t('greeting.hello')` 발견

**느리고 불편합니다.**

---

## 해결책

`inline-i18n-multi`를 사용하면 번역이 코드 안에 있습니다:

```tsx
<p>{it("안녕하세요", "Hello")}</p>
```

앱에서 "Hello"가 보이면? 코드베이스에서 "Hello"를 검색하면 됩니다. **끝.**

---

## 기능

- **인라인 번역** - 사용하는 곳에서 바로 번역 작성
- **즉시 검색** - 코드베이스에서 모든 텍스트를 즉시 검색
- **타입 안전** - 변수 타입 체크를 포함한 완벽한 TypeScript 지원
- **다국어 지원** - 원하는 만큼의 로케일 지원
- **프레임워크 지원** - React, Next.js (App Router & Pages Router)
- **개발자 도구** - 검증용 CLI, 탐색용 VSCode 확장
- **i18n 호환** - JSON 딕셔너리와 복수형을 지원하는 전통적인 키 기반 번역 지원
- **ICU Message Format** - 복수형, 선택, 날짜, 숫자, 시간, 상대 시간, 목록 포맷팅 지원
- **로케일 폴백 체인** - BCP 47 부모 로케일 지원 (`zh-TW` → `zh` → `en`)
- **누락 번역 경고** - 커스터마이즈 가능한 핸들러를 통한 개발 시점 진단
- **네임스페이스 지원** - 대규모 앱을 위한 번역 분류 (`t('common:greeting')`)
- **디버그 모드** - 누락/폴백 번역에 대한 시각적 표시
- **통화 포맷팅** - 로케일 인식 통화 표시 (`{price, currency, USD}`)
- **축약 숫자 포맷팅** - 큰 숫자의 축약 표시 (`{count, number, compact}`)
- **리치 텍스트 보간** - 번역에 React 컴포넌트 삽입 (`<link>텍스트</link>`)
- **지연 로딩** - 비동기 딕셔너리 로딩 (`loadAsync()`)
- **커스텀 포맷터 레지스트리** - 커스텀 ICU 포맷터 등록 (`registerFormatter('phone', fn)` → `{num, phone}`)
- **보간 가드** - 누락된 변수를 우아하게 처리 (`configure({ missingVarHandler })`)
- **로케일 감지** - 쿠키/브라우저에서 자동 로케일 감지 (`detectLocale()` + React `useDetectedLocale()`)
- **Selectordinal** - 서수 복수형을 위한 완전한 ICU `selectordinal` 지원 (`{n, selectordinal, ...}`)
- **ICU Message Cache** - 파싱된 ICU AST 메모이제이션으로 성능 최적화 (`configure({ icuCacheSize: 500 })`)
- **Plural Shorthand** - 간결한 복수형 문법 (`{count, p, item|items}`)
- **Locale Persistence** - 로케일 자동 저장/복원 (`configure({ persistLocale: { storage: 'cookie' } })`)
- **CLI `--strict` 모드** - ICU 타입 일관성 검증 (`npx inline-i18n validate --strict`)
- **Translation Scope** - 네임스페이스 스코프 번역 함수 (`createScope('common')`)
- **미사용 키 탐지** - CLI에서 미사용 dictionary 키 탐지 (`npx inline-i18n validate --unused`)
- **TypeScript 타입 생성** - `t()` 키 자동완성을 위한 `.d.ts` 생성 (`npx inline-i18n typegen`)

---

## 패키지

| 패키지                                                       | 설명                |
| ------------------------------------------------------------ | ------------------- |
| [`inline-i18n-multi`](./packages/core)                       | 핵심 번역 함수      |
| [`inline-i18n-multi-react`](./packages/react)                | React 훅 & 컴포넌트 |
| [`inline-i18n-multi-next`](./packages/next)                  | Next.js 통합        |
| [`@inline-i18n-multi/cli`](./packages/cli)                   | CLI 도구            |
| [`inline-i18n-multi-vscode`](./packages/vscode)              | VSCode 확장         |

---

## 빠른 시작

### 설치

```bash
# npm
npm install inline-i18n-multi

# yarn
yarn add inline-i18n-multi

# pnpm
pnpm add inline-i18n-multi
```

### 기본 사용법

```typescript
import { it, setLocale } from "inline-i18n-multi";

// 현재 로케일 설정
setLocale("en");

// 단축 문법 (한국어 + 영어)
it("안녕하세요", "Hello"); // → "Hello"

// 객체 문법 (여러 언어)
it({ ko: "안녕하세요", en: "Hello", ja: "こんにちは" }); // → "Hello"

// 변수 사용
it("안녕, {name}님", "Hello, {name}", { name: "John" }); // → "Hello, John"
```

---

## 키 기반 번역 (i18n 호환)

JSON 번역 파일을 이미 사용하는 프로젝트나, 전통적인 키 기반 번역이 필요한 경우:

```typescript
import { t, loadDictionaries } from "inline-i18n-multi";

// 번역 딕셔너리 로드
loadDictionaries({
  en: {
    greeting: { hello: "Hello", goodbye: "Goodbye" },
    items: { count_one: "{count} item", count_other: "{count} items" },
    welcome: "Welcome, {name}!",
  },
  ko: {
    greeting: { hello: "안녕하세요", goodbye: "안녕히 가세요" },
    items: { count_other: "{count}개 항목" },
    welcome: "환영합니다, {name}님!",
  },
});

// 기본 키 기반 번역
t("greeting.hello"); // → "Hello" (로케일이 'en'일 때)

// 변수 사용
t("welcome", { name: "John" }); // → "Welcome, John!"

// 복수형 지원 (Intl.PluralRules 사용)
t("items.count", { count: 1 }); // → "1 item"
t("items.count", { count: 5 }); // → "5 items"

// 로케일 오버라이드
t("greeting.hello", undefined, "ko"); // → "안녕하세요"
```

### 유틸리티 함수

```typescript
import {
  hasTranslation,
  getLoadedLocales,
  getDictionary,
} from "inline-i18n-multi";

// 번역 존재 여부 확인
hasTranslation("greeting.hello"); // → true
hasTranslation("missing.key"); // → false

// 로드된 로케일 목록 조회
getLoadedLocales(); // → ['en', 'ko']

// 특정 로케일의 딕셔너리 조회
getDictionary("en"); // → { greeting: { hello: 'Hello', ... }, ... }
```

---

## React 통합

```bash
npm install inline-i18n-multi-react
```

```tsx
import { LocaleProvider, useLocale, it, T } from "inline-i18n-multi-react";

function App() {
  return (
    <LocaleProvider locale="en">
      <MyComponent />
    </LocaleProvider>
  );
}

function MyComponent() {
  const [locale, setLocale] = useLocale();

  return (
    <div>
      {/* 함수 문법 */}
      <h1>{it("제목", "Title")}</h1>

      {/* 컴포넌트 문법 */}
      <T ko="환영합니다" en="Welcome" />

      {/* 변수 사용 */}
      <T ko="{count}개의 항목" en="{count} items" count={5} />

      {/* 로케일 전환 */}
      <button onClick={() => setLocale("ko")}>한국어</button>
      <button onClick={() => setLocale("en")}>English</button>
    </div>
  );
}
```

### useT 훅 (키 기반)

```tsx
import { useT, loadDictionaries } from "inline-i18n-multi-react";

// 딕셔너리 로드 (보통 앱 진입점에서)
loadDictionaries({
  en: {
    greeting: "Hello",
    items: { count_one: "{count} item", count_other: "{count} items" },
  },
  ko: { greeting: "안녕하세요", items: { count_other: "{count}개 항목" } },
});

function MyComponent() {
  const t = useT();

  return (
    <div>
      <p>{t("greeting")}</p>
      <p>{t("items.count", { count: 5 })}</p>
    </div>
  );
}
```

---

## Next.js 통합

```bash
npm install inline-i18n-multi-next
```

### App Router (서버 컴포넌트)

```tsx
// app/page.tsx
import { it } from "inline-i18n-multi-next/server";

export default async function Page() {
  return <h1>{await it("안녕하세요", "Hello")}</h1>;
}
```

### 서버 컴포넌트에서 키 기반 번역

서버 컴포넌트에서 `t()`를 사용하려면 먼저 `setLocale()`을 호출해야 합니다:

```tsx
// app/[locale]/page.tsx
import { t, setLocale, loadDictionaries } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', items: { count_one: '{count} item', count_other: '{count} items' } },
  ko: { greeting: '안녕하세요', items: { count_other: '{count}개' } },
})

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setLocale(locale)  // t() 사용 전에 필수

  return (
    <div>
      <h1>{t('greeting')}</h1>
      <p>{t('items.count', { count: 5 })}</p>
    </div>
  )
}
```

### App Router (클라이언트 컴포넌트)

```tsx
"use client";
import { it, LocaleProvider } from "inline-i18n-multi-next/client";

export default function ClientComponent() {
  return <p>{it("클라이언트", "Client")}</p>;
}
```

### 클라이언트 컴포넌트에서 키 기반 번역

```tsx
"use client";
import { useT, loadDictionaries } from "inline-i18n-multi-next/client";

loadDictionaries({
  en: { nav: { home: "Home", about: "About" } },
  ko: { nav: { home: "홈", about: "소개" } },
});

export default function NavMenu() {
  const t = useT();
  return (
    <nav>
      <a href="/">{t("nav.home")}</a>
    </nav>
  );
}
```

### 미들웨어 (로케일 감지)

```typescript
// middleware.ts
import { createI18nMiddleware } from "inline-i18n-multi-next/middleware";

export default createI18nMiddleware({
  locales: ["ko", "en", "ja"],
  defaultLocale: "ko",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
```

### SEO 최적화 (App Router)

Next.js App Router에서 완전한 SEO 지원을 위한 서버 유틸리티:

```tsx
// app/[locale]/layout.tsx
import {
  configureI18n,
  generateLocaleParams,
  createMetadata,
  getAlternates,
} from "inline-i18n-multi-next/server";

// i18n 설정
configureI18n({
  locales: ["ko", "en", "ja"],
  defaultLocale: "ko",
  baseUrl: "https://example.com",
});

// SSG: 모든 로케일 사전 렌더링
export function generateStaticParams() {
  return generateLocaleParams(); // → [{ locale: 'ko' }, { locale: 'en' }, { locale: 'ja' }]
}

// 동적 메타데이터
export async function generateMetadata({ params }) {
  const { locale } = await params;

  return createMetadata(
    {
      title: { ko: "홈", en: "Home", ja: "ホーム" },
      description: { ko: "환영합니다", en: "Welcome", ja: "ようこそ" },
    },
    locale,
    "" // 현재 경로
  );
}

// Hreflang 링크 (SEO용)
const alternates = getAlternates("/about", "ko");
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

**SEO 기능:**

- **SSG/SSR** - `generateStaticParams()`로 모든 로케일 사전 렌더링
- **동적 메타데이터** - `createMetadata()`로 로케일별 title/description
- **Hreflang** - `getAlternates()`로 검색 엔진용 언어 대체 링크
- **쿠키 저장** - `setLocale()` 호출 시 자동 저장
- **URL 라우팅** - `/[locale]/...` 패턴으로 SEO 친화적 URL

---

## 언어 쌍 헬퍼

자주 사용하는 언어 조합을 위한 단축 헬퍼:

```typescript
import { it_ja, en_zh, ja_es } from "inline-i18n-multi";

// 한국어 ↔ 일본어
it_ja("안녕하세요", "こんにちは");

// 영어 ↔ 중국어
en_zh("Hello", "你好");

// 일본어 ↔ 스페인어
ja_es("こんにちは", "Hola");
```

사용 가능한 헬퍼:

- `it` (ko↔en), `it_ja`, `it_zh`, `it_es`, `it_fr`, `it_de`
- `en_ja`, `en_zh`, `en_es`, `en_fr`, `en_de`
- `ja_zh`, `ja_es`, `zh_es`

---

## ICU Message Format

복수형과 조건부 텍스트가 필요한 복잡한 번역을 위해 ICU Message Format을 사용합니다:

```typescript
import { it, setLocale } from "inline-i18n-multi";

setLocale("en");

// 복수형
it(
  {
    ko: "{count, plural, =0 {항목 없음} other {# 개}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
  },
  { count: 0 }
); // → "No items"

it(
  {
    ko: "{count, plural, =0 {항목 없음} other {# 개}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
  },
  { count: 1 }
); // → "1 item"

it(
  {
    ko: "{count, plural, =0 {항목 없음} other {# 개}}",
    en: "{count, plural, =0 {No items} one {# item} other {# items}}",
  },
  { count: 5 }
); // → "5 items"

// 선택
it(
  {
    ko: "{gender, select, male {그} female {그녀} other {그들}}",
    en: "{gender, select, male {He} female {She} other {They}}",
  },
  { gender: "female" }
); // → "She"

// 텍스트와 결합
it(
  {
    ko: "{name}님이 {count, plural, =0 {메시지가 없습니다} other {# 개의 메시지가 있습니다}}",
    en: "{name} has {count, plural, =0 {no messages} one {# message} other {# messages}}",
  },
  { name: "John", count: 3 }
); // → "John has 3 messages"
```

### 지원되는 구문

| 구문          | 설명                                                       | 예시                                     |
| ------------- | ---------------------------------------------------------- | ---------------------------------------- |
| `{var}`       | 단순 변수 치환                                             | `{name}` → "John"                        |
| `{var, plural, ...}` | 숫자 기반 복수형 선택 (`=0`, `=1`, `one`, `other` 등) | `{count, plural, one {# 개} other {# 개}}` |
| `{var, select, ...}` | 문자열 값 기반 선택                                    | `{gender, select, male {그} female {그녀}}` |
| `#`           | 복수형 내에서 현재 숫자 값 표시                            | `# items` → "5 items"                    |

### 날짜, 숫자, 시간 포맷팅

ICU는 로케일 인식 날짜, 숫자, 시간 포맷팅도 지원합니다:

```typescript
// 숫자 포맷팅
it({
  en: 'Price: {price, number}',
  ko: '가격: {price, number}'
}, { price: 1234.56 })  // → "가격: 1,234.56"

it({
  en: 'Discount: {rate, number, percent}',
  ko: '할인율: {rate, number, percent}'
}, { rate: 0.25 })  // → "할인율: 25%"

// 날짜 포맷팅
it({
  en: 'Created: {date, date, long}',
  ko: '생성일: {date, date, long}'
}, { date: new Date('2024-03-15') })  // → "생성일: 2024년 3월 15일"

it({
  en: 'Due: {date, date, short}',
  ko: '마감: {date, date, short}'
}, { date: new Date() })  // → "마감: 24. 3. 15."

// 시간 포맷팅
it({
  en: 'Time: {time, time, short}',
  ko: '시간: {time, time, short}'
}, { time: new Date() })  // → "시간: 오후 2:30"

// 조합
it({
  en: 'Order on {date, date, short}: {total, number, currency}',
  ko: '{date, date, short} 주문: {total, number, currency}'
}, { date: new Date(), total: 99.99 })
```

**지원되는 스타일:**
- `number`: `decimal`, `percent`, `integer`, `currency`, `compact`, `compactLong`
- `date`: `short`, `medium`, `long`, `full`
- `time`: `short`, `medium`, `long`, `full`

### 상대 시간 포맷팅

자동 단위 감지를 통한 사람이 읽기 쉬운 상대 시간:

```typescript
// 상대 시간
it({
  en: 'Updated {time, relativeTime}',
  ko: '{time, relativeTime} 업데이트됨'
}, { time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) })
// → "3일 전 업데이트됨"

// 스타일 옵션: long (기본값), short, narrow
it({ ko: '{time, relativeTime, short}' }, { time: pastDate })
// → "3일 전"

it({ ko: '{time, relativeTime, narrow}' }, { time: pastDate })
// → "3일 전"
```

### 목록 포맷팅

로케일 인식 목록 조합:

```typescript
// 목록 (conjunction - "그리고")
it({
  en: 'Invited: {names, list}',
  ko: '초대됨: {names, list}'
}, { names: ['Alice', 'Bob', 'Charlie'] })
// en → "Invited: Alice, Bob, and Charlie"
// ko → "초대됨: Alice, Bob, Charlie"

// Disjunction ("또는")
it({ ko: '{options, list, disjunction}' }, { options: ['A', 'B', 'C'] })
// → "A, B 또는 C"

// Unit (접속사 없음)
it({ ko: '{items, list, unit}' }, { items: ['10kg', '5m', '3L'] })
// → "10kg, 5m, 3L"
```

### 통화 포맷팅

자동 통화 기호 감지를 통한 로케일 인식 통화 포맷팅:

```typescript
// 통화 포맷팅
it({
  en: 'Total: {price, currency, USD}',
  ko: '합계: {price, currency, KRW}'
}, { price: 42000 })
// en → "Total: $42,000.00"
// ko → "합계: ₩42,000"

// 통화 코드 생략 시 USD 기본값
it({ en: '{price, currency}' }, { price: 100 })
// → "$100.00"
```

### 축약 숫자 포맷팅

큰 숫자의 축약 표시:

```typescript
// 축약 (short)
it({
  en: '{count, number, compact} views',
  ko: '{count, number, compact} 조회'
}, { count: 1500000 })
// en → "1.5M views"
// ko → "150만 조회"

// 축약 (long)
it({ en: '{count, number, compactLong}' }, { count: 1500000 })
// → "1.5 million"
```

---

## 네임스페이스 지원

대규모 앱을 위한 번역 분류:

```typescript
import { loadDictionaries, t, getLoadedNamespaces, clearDictionaries } from 'inline-i18n-multi'

// 네임스페이스와 함께 로드
loadDictionaries({
  en: { hello: 'Hello', goodbye: 'Goodbye' },
  ko: { hello: '안녕하세요', goodbye: '안녕히 가세요' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme' },
  ko: { title: '설정', theme: '테마' }
}, 'settings')

// 네임스페이스 접두사와 함께 사용
t('common:hello')      // → "안녕하세요"
t('settings:title')    // → "설정"

// 중첩 키도 사용 가능
t('common:buttons.submit')

// 네임스페이스 없이 = 'default' (하위 호환)
loadDictionaries({ ko: { greeting: '안녕' } })
t('greeting')  // → "안녕"

// 로드된 모든 네임스페이스 조회
getLoadedNamespaces()  // → ['common', 'settings', 'default']

// 특정 네임스페이스 삭제
clearDictionaries('settings')

// 전체 삭제
clearDictionaries()
```

---

## 디버그 모드

누락 및 폴백 번역 디버깅을 위한 시각적 표시:

```typescript
import { configure, setLocale, it, t } from 'inline-i18n-multi'

// 디버그 모드 활성화
configure({ debugMode: true })

// 누락 번역은 접두사 표시
setLocale('fr')
it({ en: 'Hello', ko: '안녕하세요' })
// → "[fr -> en] Hello"

t('missing.key')
// → "[MISSING: en] missing.key"

// 커스텀 포맷
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

## 리치 텍스트 보간

번역에 React 컴포넌트를 삽입합니다:

```tsx
import { RichText, useRichText } from 'inline-i18n-multi-react'

// 컴포넌트 문법
<RichText
  translations={{
    en: 'Read <link>terms</link> and <bold>agree</bold>',
    ko: '<link>약관</link>을 읽고 <bold>동의</bold>해주세요'
  }}
  components={{
    link: (text) => <a href="/terms">{text}</a>,
    bold: (text) => <strong>{text}</strong>
  }}
/>

// 훅 문법
const richT = useRichText({
  link: (text) => <a href="/terms">{text}</a>,
  bold: (text) => <strong>{text}</strong>
})
richT({ en: 'Click <link>here</link>', ko: '<link>여기</link> 클릭' })
```

---

## 지연 로딩

딕셔너리를 비동기적으로 필요에 따라 로드합니다:

```typescript
import { configure, loadAsync, isLoaded, t } from 'inline-i18n-multi'

// 로더 설정
configure({
  loader: (locale, namespace) => import(`./locales/${locale}/${namespace}.json`)
})

// 필요 시 로드
await loadAsync('ko', 'dashboard')
t('dashboard:title')

// 로딩 상태 확인
isLoaded('ko', 'dashboard')  // → true
```

### React 훅

```tsx
import { useLoadDictionaries } from 'inline-i18n-multi-react'

function Dashboard() {
  const { isLoading, error } = useLoadDictionaries('ko', 'dashboard')
  if (isLoading) return <Spinner />
  if (error) return <Error message={error.message} />
  return <Content />
}
```

---

## 커스텀 포맷터 레지스트리

도메인별 포맷팅을 위한 커스텀 ICU 포맷 함수를 등록합니다:

```typescript
import { registerFormatter, it } from 'inline-i18n-multi'

registerFormatter('phone', (value, locale, style?) => {
  const s = String(value)
  return `(${s.slice(0,3)}) ${s.slice(3,6)}-${s.slice(6)}`
})

it({ en: 'Call {num, phone}' }, { num: '2125551234' })
// → "Call (212) 555-1234"
```

등록된 커스텀 포맷터는 `{variable, formatterName}` 구문으로 모든 ICU 메시지 패턴에서 사용할 수 있습니다.

---

## 보간 가드

누락된 변수를 원시 `{varName}` 플레이스홀더 대신 우아하게 처리합니다:

```typescript
import { configure, it } from 'inline-i18n-multi'

configure({
  missingVarHandler: (varName, locale) => `[${varName}]`
})

it({ en: 'Hello {name}' })
// → "Hello [name]" ("Hello {name}" 대신)
```

개발 시 누락된 변수를 조기에 발견하거나, 프로덕션에서 안전한 폴백 표시를 제공하는 데 유용합니다.

---

## 로케일 감지

여러 소스에서 사용자의 선호 로케일을 자동으로 감지합니다:

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

### React 훅

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

**감지 소스** (순서대로 확인):
- `cookie` - 지정된 쿠키에서 읽기 (예: `NEXT_LOCALE`)
- `navigator` - `navigator.languages` / `navigator.language`에서 읽기

---

## ICU Message Cache

파싱된 ICU AST를 메모이제이션하여 반복 호출 시 성능을 최적화합니다:

```typescript
import { configure, clearICUCache, it } from 'inline-i18n-multi'

// 캐시 크기 설정 (기본값: 500)
configure({ icuCacheSize: 500 })

// 동일한 ICU 패턴을 반복 호출해도 한 번만 파싱됨
it({
  en: '{count, plural, one {# item} other {# items}}',
  ko: '{count, plural, other {#개}}'
}, { count: 5 })

// 캐시 비활성화 (0으로 설정)
configure({ icuCacheSize: 0 })

// 캐시 수동 초기화
clearICUCache()
```

캐시가 `icuCacheSize`에 도달하면 FIFO(선입선출) 방식으로 가장 오래된 항목부터 제거됩니다.

---

## Plural Shorthand

ICU `plural` 구문의 간결한 대안:

```typescript
import { it, setLocale } from 'inline-i18n-multi'

setLocale('en')

// 2파트: {변수, p, 단수형|복수형}
it({
  en: '{count, p, item|items}',
  ko: '{count, p, 개|개}'
}, { count: 1 })   // → "1 item"

it({
  en: '{count, p, item|items}',
  ko: '{count, p, 개|개}'
}, { count: 5 })   // → "5 items"

// 3파트: {변수, p, 영|단수형|복수형}
it({
  en: '{count, p, none|item|items}',
  ko: '{count, p, 없음|개|개}'
}, { count: 0 })   // → "none"

it({
  en: '{count, p, none|item|items}',
  ko: '{count, p, 없음|개|개}'
}, { count: 1 })   // → "1 item"

it({
  en: '{count, p, none|item|items}',
  ko: '{count, p, 없음|개|개}'
}, { count: 5 })   // → "5 items"
```

`{count, p, item|items}`는 내부적으로 `{count, plural, one {# item} other {# items}}`로 변환됩니다.

---

## Locale Persistence

로케일을 쿠키 또는 `localStorage`에 자동으로 저장하고 복원합니다:

```typescript
import { configure, setLocale, restoreLocale } from 'inline-i18n-multi'

// 쿠키에 저장
configure({
  persistLocale: {
    storage: 'cookie',
    key: 'LOCALE',       // 쿠키/localStorage 키 (기본값: 'LOCALE')
    expires: 365          // 쿠키 만료일 (일 단위, 기본값: 365)
  }
})

// setLocale() 호출 시 자동으로 저장소에 저장
setLocale('ko')  // → 쿠키에 LOCALE=ko 저장

// 저장소에서 로케일 복원
const locale = restoreLocale()  // → 'ko' (저장소에서 읽기)

// localStorage에 저장
configure({
  persistLocale: {
    storage: 'localStorage',
    key: 'LOCALE'
  }
})

setLocale('en')  // → localStorage에 LOCALE=en 저장
```

---

## CLI `--strict` 모드

ICU 타입 일관성을 검증하는 엄격 모드:

```bash
npx inline-i18n validate --strict

# 출력:
# ICU 타입 불일치
#    src/Header.tsx:12
#    en: {count, plural, one {# item} other {# items}}  (plural)
#    ko: {count}개                                        (simple)
#
# 변수 누락
#    src/About.tsx:8
#    en: Hello, {name}!  (변수: name)
#    ko: 안녕하세요!     (변수: 없음)
```

`--strict` 플래그는 기존 `validate` 명령어에 추가로 ICU 메시지 타입(plural, select, number 등)이 모든 로케일에서 일관되게 사용되는지 검증합니다.

---

## Translation Scope

네임스페이스 접두사를 자동으로 붙여주는 스코프 번역 함수를 생성합니다:

```typescript
import { createScope, loadDictionaries, setLocale } from 'inline-i18n-multi'

loadDictionaries({
  en: { greeting: 'Hello', goodbye: 'Goodbye' },
  ko: { greeting: '안녕하세요', goodbye: '안녕히 가세요' }
}, 'common')

loadDictionaries({
  en: { title: 'Settings', theme: 'Theme' },
  ko: { title: '설정', theme: '테마' }
}, 'settings')

setLocale('ko')

// 스코프 함수 생성
const tc = createScope('common')
const ts = createScope('settings')

// 네임스페이스 접두사 자동 추가
tc('greeting')   // → "안녕하세요" (내부적으로 t('common:greeting'))
tc('goodbye')    // → "안녕히 가세요"
ts('title')      // → "설정"
ts('theme')      // → "테마"

// 변수도 지원
tc('welcome', { name: 'John' })  // → t('common:welcome', { name: 'John' })
```

### React 훅

```tsx
import { useScopedT } from 'inline-i18n-multi-react'

function CommonSection() {
  const tc = useScopedT('common')

  return (
    <div>
      <h1>{tc('greeting')}</h1>
      <p>{tc('goodbye')}</p>
    </div>
  )
}
```

`createScope(namespace)`는 매번 `t('namespace:key')`를 작성하는 대신, 네임스페이스를 한 번 지정하고 키만으로 번역을 조회할 수 있도록 해줍니다.

---

## 미사용 키 탐지

딕셔너리에 정의되었지만 코드에서 사용되지 않는 번역 키를 탐지합니다:

```bash
npx inline-i18n validate --unused

# 출력:
# Found 2 unused translation key(s):
#
#   - common:oldGreeting
#     defined in locales/ko/common.json
#   - settings:legacyTheme
#     defined in locales/ko/settings.json
```

코드 내의 `t()` 호출과 딕셔너리 키를 교차 비교하여 미사용 키를 탐지합니다. 복수형 접미사(`_one`, `_other` 등)는 기본 키로 자동 그룹화되어 오탐을 방지합니다.

---

## TypeScript 타입 생성

딕셔너리 키를 기반으로 `.d.ts` 파일을 생성하여 `t()` 호출 시 키 자동완성을 제공합니다:

```bash
# 기본 출력: src/i18n.d.ts
npx inline-i18n typegen

# 커스텀 출력 경로
npx inline-i18n typegen --output types/i18n.d.ts

# 특정 작업 디렉토리
npx inline-i18n typegen --cwd ./packages/app
```

생성되는 `.d.ts` 파일 예시:

```typescript
// 자동 생성됨 - 직접 수정하지 마세요
declare module 'inline-i18n-multi' {
  interface TranslationKeys {
    'common:greeting': string
    'common:goodbye': string
    'settings:title': string
    'settings:theme': string
  }

  export function t<K extends keyof TranslationKeys>(
    key: K,
    vars?: Record<string, string | number>,
    locale?: string
  ): string
}
```

모듈 확장(module augmentation) 방식을 사용하여 기존 코드 변경 없이 IDE 자동완성을 제공합니다. 딕셔너리 구조가 변경될 때마다 `typegen`을 다시 실행하여 타입을 동기화하세요.

---

## 설정

폴백 동작과 경고에 대한 전역 설정을 구성합니다:

```typescript
import { configure, resetConfig, getConfig } from 'inline-i18n-multi'

configure({
  // 최종 폴백 로케일 (기본값: 'en')
  fallbackLocale: 'en',

  // BCP 47 태그에서 부모 로케일 자동 추출 (기본값: true)
  // zh-TW → zh → fallbackLocale
  autoParentLocale: true,

  // 특정 로케일에 대한 커스텀 폴백 체인
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en'],  // 브라질 포르투갈어 → 포르투갈어 → 스페인어 → 영어
  },

  // 누락 번역 경고 활성화 (기본값: 개발 모드에서 true)
  warnOnMissing: true,

  // 커스텀 경고 핸들러
  onMissingTranslation: (warning) => {
    console.warn(`누락: ${warning.requestedLocale}`, warning)
  },

  // ICU 파싱 캐시 크기 (기본값: 500, 0으로 비활성화)
  icuCacheSize: 500,

  // 로케일 자동 저장/복원
  persistLocale: {
    storage: 'cookie',    // 'cookie' | 'localStorage'
    key: 'LOCALE',        // 저장소 키 (기본값: 'LOCALE')
    expires: 365           // 쿠키 만료일 (기본값: 365)
  },
})

// 기본값으로 리셋
resetConfig()

// 현재 설정 조회
const config = getConfig()
```

### 로케일 폴백 체인

BCP 47 부모 로케일 지원을 통한 자동 로케일 폴백:

```typescript
import { setLocale, it, t, loadDictionaries } from 'inline-i18n-multi'

// 자동 BCP 47 폴백: zh-TW → zh → en
setLocale('zh-TW')
it({ en: 'Hello', zh: '你好' })  // → '你好' (zh로 폴백)

// t()에서도 동작
loadDictionaries({
  en: { greeting: 'Hello' },
  zh: { greeting: '你好' },
})
setLocale('zh-TW')
t('greeting')  // → '你好'

// 커스텀 폴백 체인
configure({
  fallbackChain: {
    'pt-BR': ['pt', 'es', 'en']
  }
})
setLocale('pt-BR')
it({ en: 'Hello', es: 'Hola' })  // → 'Hola' (체인을 통해 폴백)
```

### 누락 번역 경고

번역이 누락되면 알림을 받습니다:

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
    //   key: 'greeting'  // t()에서만
    // }
    console.warn(`${warning.requestedLocale}에 대한 번역 누락`)
  }
})

setLocale('fr')
it({ en: 'Hello', ko: '안녕하세요' })  // 경고: fr에 대한 번역 누락
```

---

## CLI 도구

```bash
npm install -D @inline-i18n-multi/cli
```

### 번역 찾기

번역에서 텍스트 검색:

```bash
npx inline-i18n find "Hello"

# 출력:
# src/components/Header.tsx:12:5
#   ko: 안녕하세요
#   en: Hello
```

### 번역 검증

일관성 검사:

```bash
npx inline-i18n validate --locales ko,en,ja

# 출력:
# Inconsistent translations for "안녕하세요"
#    src/Header.tsx:12  en: "Hello"
#    src/Footer.tsx:8   en: "Hi"
#
# Missing locales: ja
#    src/About.tsx:15
```

### 커버리지 리포트

```bash
npx inline-i18n coverage --locales ko,en,ja

# 출력:
# 번역 커버리지:
#
# 로케일  커버리지   번역됨
# ─────────────────────────────
# ko      ██████████ 100%  150/150
# en      ██████████ 100%  150/150
# ja      ████░░░░░░  40%   60/150
```

---

## 예시

[`examples/`](./examples) 디렉토리에서 예시 프로젝트를 확인하세요:

| 예시                          | 설명                   |
| ----------------------------- | ---------------------- |
| [`basic`](./examples/basic)   | 기본 TypeScript 사용법 |
| [`react`](./examples/react)   | Vite 기반 React 앱     |
| [`nextjs`](./examples/nextjs) | Next.js 15 App Router  |

### 예시 실행

```bash
# 클론 및 설치
git clone https://github.com/exiivy98/inline-i18n-multi.git
cd inline-i18n-multi
pnpm install

# 기본 예시 실행
pnpm --filter inline-i18n-multi-basic-example start

# React 예시 실행
pnpm --filter inline-i18n-multi-react-example dev

# Next.js 예시 실행
pnpm --filter inline-i18n-multi-nextjs-example dev
```

---

## VSCode 확장

> **참고:** VSCode 확장은 추후 마켓플레이스에 배포될 예정입니다.

VSCode 마켓플레이스에서 `inline-i18n-multi-vscode`를 설치하세요.

### 기능

- **호버 정보** - `it()` 호출에 마우스를 올리면 모든 번역 표시
- **사용처 찾기** - 전체 워크스페이스에서 번역 검색
- **빠른 탐색** - `Cmd+Shift+T`로 번역 사용처로 이동

---

## API 레퍼런스

### 핵심 함수

| 함수                           | 설명                                    |
| ------------------------------ | --------------------------------------- |
| `it(ko, en, vars?)`            | 한국어와 영어로 번역                    |
| `it(translations, vars?)`      | 객체 문법으로 번역                      |
| `setLocale(locale)`            | 현재 로케일 설정                        |
| `getLocale()`                  | 현재 로케일 가져오기                    |
| `t(key, vars?, locale?)`       | 로케일 오버라이드가 가능한 키 기반 번역 |
| `loadDictionaries(dicts, namespace?)` | 선택적 네임스페이스와 함께 번역 딕셔너리 로드 |
| `loadDictionary(locale, dict, namespace?)` | 선택적 네임스페이스와 함께 단일 로케일 딕셔너리 로드 |
| `hasTranslation(key, locale?)` | 번역 키 존재 여부 확인 (namespace:key 지원) |
| `getLoadedLocales()`           | 로드된 로케일 코드 배열 반환            |
| `getLoadedNamespaces()`        | 로드된 네임스페이스 이름 배열 반환      |
| `getDictionary(locale, namespace?)` | 특정 로케일과 네임스페이스의 딕셔너리 반환 |
| `clearDictionaries(namespace?)` | 딕셔너리 삭제 (전체 또는 특정 네임스페이스) |
| `configure(options)`           | 전역 설정 (폴백, 경고, 디버그, missingVarHandler, icuCacheSize, persistLocale) |
| `getConfig()`                  | 현재 설정 조회                          |
| `resetConfig()`                | 설정을 기본값으로 리셋                  |
| `registerFormatter(name, fn)`  | 커스텀 ICU 포맷터 등록                  |
| `detectLocale(options)`        | 쿠키/브라우저에서 로케일 감지           |
| `loadAsync(locale, namespace?)` | 설정된 로더를 사용하여 비동기 딕셔너리 로드 |
| `isLoaded(locale, namespace?)` | 딕셔너리 로드 여부 확인 |
| `parseRichText(template, names)` | 리치 텍스트 템플릿을 세그먼트로 파싱 |
| `clearICUCache()`             | ICU 파싱 캐시 초기화                    |
| `createScope(namespace)`      | 네임스페이스 스코프 `t()` 함수 반환       |
| `restoreLocale()`             | 저장소(쿠키/localStorage)에서 로케일 복원 |

### React 훅 & 컴포넌트

| 내보내기         | 설명                                          |
| ---------------- | --------------------------------------------- |
| `LocaleProvider` | 로케일용 컨텍스트 프로바이더                  |
| `useLocale()`    | `[locale, setLocale]`을 반환하는 훅           |
| `useT()`         | 현재 로케일에 바인딩된 `t` 함수를 반환하는 훅 |
| `T`              | 번역 컴포넌트                                 |
| `RichText` | 컴포넌트 삽입이 가능한 리치 텍스트 번역 컴포넌트 |
| `useRichText(components)` | 리치 텍스트 번역 함수를 반환하는 훅 |
| `useLoadDictionaries(locale, ns?)` | 로딩 상태를 포함한 지연 로딩 훅 |
| `useScopedT(namespace)` | 네임스페이스 스코프 `t` 함수를 반환하는 훅 |
| `useDetectedLocale(options)` | 자동 로케일 감지 및 설정 훅 |

### 타입

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
  loader?: (locale: string, namespace: string) => Promise<any>
  missingVarHandler?: (varName: string, locale: string) => string
  icuCacheSize?: number
  persistLocale?: PersistLocaleOptions
}

interface PersistLocaleOptions {
  storage: 'cookie' | 'localStorage'
  key?: string       // 기본값: 'LOCALE'
  expires?: number   // 쿠키 만료일 (일 단위, 기본값: 365)
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

## 왜 인라인 번역인가?

### 기존 i18n

```
코드 → 키 → JSON 파일 → 번역
          ↑
      추적하기 어려움
```

### 인라인 i18n

```
코드 ← 번역 (같은 곳!)
```

| 측면                 | 기존 방식            | 인라인 방식             |
| -------------------- | -------------------- | ----------------------- |
| 코드에서 텍스트 찾기 | 어려움 (키 조회)     | 쉬움 (직접 검색)        |
| 번역 추가            | 키 생성, JSON에 추가 | 인라인으로 작성         |
| 리팩토링             | 키 참조 업데이트     | 자동                    |
| 코드 리뷰            | JSON 별도 확인       | 모두 diff에서 확인 가능 |
| 타입 안전성          | 제한적               | 완벽 지원               |

---

## 요구사항

- Node.js 18+
- TypeScript 5.0+ (권장)
- React 18+ (React 패키지용)
- Next.js 13+ (Next.js 패키지용)

---

## 기여하기

기여를 환영합니다! 먼저 [기여 가이드](./CONTRIBUTING.md)를 읽어주세요.

```bash
# 저장소 복제
git clone https://github.com/exiivy98/inline-i18n-multi.git

# 의존성 설치
pnpm install

# 모든 패키지 빌드
pnpm build

# 테스트 실행
pnpm test
```

---

## 면책 조항

이 소프트웨어는 이 패키지는 별도의 보증 없이 제공됩니다. 저자는 이 패키지의 사용으로 인해 발생하는 어떠한 손해나 문제에 대해서도 책임을 지지 않습니다. 사용에 따른 위험은 사용자 본인에게 있습니다.

---

## 라이선스

MIT © [exiivy98](https://github.com/exiivy98)
