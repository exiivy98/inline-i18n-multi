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
- **빌드 타임 최적화** - Babel/SWC 플러그인으로 런타임 오버헤드 제로
- **다국어 지원** - 원하는 만큼의 로케일 지원
- **프레임워크 지원** - React, Next.js (App Router & Pages Router)
- **개발자 도구** - 검증용 CLI, 탐색용 VSCode 확장
- **i18n 호환** - JSON 딕셔너리와 복수형을 지원하는 전통적인 키 기반 번역 지원

---

## 패키지

| 패키지                                                       | 설명                |
| ------------------------------------------------------------ | ------------------- |
| [`inline-i18n-multi`](./packages/core)                       | 핵심 번역 함수      |
| [`inline-i18n-multi-react`](./packages/react)                | React 훅 & 컴포넌트 |
| [`inline-i18n-multi-next`](./packages/next)                  | Next.js 통합        |
| [`@inline-i18n-multi/cli`](./packages/cli)                   | CLI 도구            |
| [`@inline-i18n-multi/babel-plugin`](./packages/babel-plugin) | Babel 플러그인      |
| [`@inline-i18n-multi/swc-plugin`](./packages/swc-plugin)     | SWC 플러그인        |
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

## 빌드 타임 최적화

더 나은 성능을 위해 빌드 시 `it()` 호출을 변환합니다.

### Babel 플러그인

```bash
npm install -D @inline-i18n-multi/babel-plugin
```

```javascript
// babel.config.js
module.exports = {
  plugins: ["@inline-i18n-multi/babel-plugin"],
};
```

### SWC 플러그인 (Next.js 13+)

```bash
npm install -D @inline-i18n-multi/swc-plugin
```

```javascript
// next.config.js
module.exports = {
  experimental: {
    swcPlugins: [["@inline-i18n-multi/swc-plugin", {}]],
  },
};
```

**변환 전 (소스):**

```typescript
it("안녕하세요", "Hello");
```

**변환 후 (빌드 출력):**

```typescript
__i18n_lookup("a1b2c3d4", { ko: "안녕하세요", en: "Hello" });
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
# ⚠️  "안녕하세요"에 대한 일관되지 않은 번역
#    src/Header.tsx:12  en: "Hello"
#    src/Footer.tsx:8   en: "Hi"
#
# 📭 누락된 로케일: ja
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

VSCode 마켓플레이스에서 `inline-i18n-multi-vscode`를 설치하세요.

### 기능

- **호버 정보** - `it()` 호출에 마우스를 올리면 모든 번역 표시
- **사용처 찾기** - 전체 워크스페이스에서 번역 검색
- **빠른 탐색** - `Cmd+Shift+T`로 번역 사용처로 이동

---

## 테스트

Vitest를 사용하여 테스트합니다.

```bash
# 모든 패키지 테스트
pnpm test

# 특정 패키지만 테스트
pnpm --filter inline-i18n-multi test        # core
pnpm --filter inline-i18n-multi-next test   # next

# CI용 (한 번만 실행)
pnpm test -- --run
```

### 테스트 커버리지

| 패키지                            | 테스트 수 | 상태 |
| --------------------------------- | --------- | ---- |
| `inline-i18n-multi` (core)        | 26        | ✅   |
| `inline-i18n-multi-next` (server) | 16        | ✅   |

자세한 내용은 [테스트 문서](./docs/test.md)를 참조하세요.

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
| `loadDictionaries(dicts)`      | 여러 로케일의 번역 딕셔너리 로드        |
| `loadDictionary(locale, dict)` | 단일 로케일 딕셔너리 로드               |
| `hasTranslation(key, locale?)` | 번역 키 존재 여부 확인                  |
| `getLoadedLocales()`           | 로드된 로케일 코드 배열 반환            |
| `getDictionary(locale)`        | 특정 로케일의 딕셔너리 반환             |

### React 훅 & 컴포넌트

| 내보내기         | 설명                                          |
| ---------------- | --------------------------------------------- |
| `LocaleProvider` | 로케일용 컨텍스트 프로바이더                  |
| `useLocale()`    | `[locale, setLocale]`을 반환하는 훅           |
| `useT()`         | 현재 로케일에 바인딩된 `t` 함수를 반환하는 훅 |
| `T`              | 번역 컴포넌트                                 |

### 타입

```typescript
type Locale = string;
type Translations = Record<Locale, string>;
type TranslationVars = Record<string, string | number>;
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
