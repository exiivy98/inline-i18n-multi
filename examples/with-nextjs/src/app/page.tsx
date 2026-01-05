import { it } from 'inline-i18n-multi-next/server'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ClientSection } from '@/components/ClientSection'
import { NavMenu } from '@/components/NavMenu'

export default async function Home() {
  return (
    <>
      <h1>{await it('인라인 i18n - Next.js 예시', 'Inline i18n - Next.js Example')}</h1>

      {/* Language Switcher (Client Component) */}
      <LanguageSwitcher />

      {/* Server Component Example */}
      <div className="section">
        <h2>{await it('서버 컴포넌트', 'Server Component')}</h2>
        <p>
          {await it(
            '이 섹션은 서버에서 렌더링됩니다. it() 함수를 await로 호출합니다.',
            'This section is rendered on the server. Call it() with await.'
          )}
        </p>
        <p>
          {await it('변수 사용: {name}님 환영합니다', 'With variables: Welcome, {name}', {
            name: 'Next.js User',
          })}
        </p>
        <p>
          {await it({
            ko: '객체 문법으로 여러 언어를 한 번에 지정할 수 있습니다.',
            en: 'Object syntax allows specifying multiple languages at once.',
            ja: 'オブジェクト構文で複数の言語を一度に指定できます。',
          })}
        </p>
      </div>

      {/* Client Component Example */}
      <ClientSection />

      {/* Key-Based Navigation (Client Component with useT) */}
      <NavMenu />

      {/* How it works */}
      <div className="section">
        <h2>{await it('작동 방식', 'How It Works')}</h2>
        <ul>
          <li>
            {await it(
              '서버 컴포넌트: inline-i18n-multi-next/server에서 it() 사용',
              'Server Components: Use it() from inline-i18n-multi-next/server'
            )}
          </li>
          <li>
            {await it(
              '클라이언트 컴포넌트: inline-i18n-multi-next/client에서 it(), T, useT 사용',
              'Client Components: Use it(), T, useT from inline-i18n-multi-next/client'
            )}
          </li>
          <li>
            {await it(
              '미들웨어: URL 경로에서 locale 감지 및 리다이렉트',
              'Middleware: Detect locale from URL path and redirect'
            )}
          </li>
        </ul>
      </div>
    </>
  )
}
