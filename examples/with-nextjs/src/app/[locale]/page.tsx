import { it, getLocaleFromParams, getAlternates } from 'inline-i18n-multi-next/server'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ClientSection } from '@/components/ClientSection'
import { NavMenu } from '@/components/NavMenu'
import { locales, defaultLocale, baseUrl } from '@/i18n.config'

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  getLocaleFromParams({ locale }) // validate

  const alternates = getAlternates('', locale)

  return (
    <>
      <h1>{await it('인라인 i18n - Next.js SEO 예시', 'Inline i18n - Next.js SEO Example')}</h1>

      {/* SEO Info */}
      <div className="section seo-info">
        <h2>🔍 SEO {await it('정보', 'Info')}</h2>
        <p>
          <strong>{await it('현재 URL', 'Current URL')}:</strong>{' '}
          <code>{baseUrl}/{locale}</code>
        </p>
        <p>
          <strong>Canonical:</strong> <code>{alternates.canonical}</code>
        </p>
        <p>
          <strong>Hreflang:</strong>
        </p>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          {Object.entries(alternates.languages).map(([lang, url]) => (
            <li key={lang}>
              <code>{lang}</code>: {url}
            </li>
          ))}
        </ul>
        <p style={{ marginTop: '12px', color: '#666' }}>
          {await it(
            '이 페이지는 generateMetadata()로 동적 메타데이터를 생성하고, generateStaticParams()로 모든 locale을 미리 빌드합니다.',
            'This page uses generateMetadata() for dynamic metadata and generateStaticParams() for pre-building all locales.'
          )}
        </p>
      </div>

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

      {/* Architecture */}
      <div className="section">
        <h2>{await it('SEO 아키텍처', 'SEO Architecture')}</h2>
        <ul>
          <li>
            <code>/[locale]/...</code> {await it('동적 라우트로 SSG 지원', 'dynamic route for SSG support')}
          </li>
          <li>
            <code>generateStaticParams()</code> {await it('모든 locale 미리 빌드', 'pre-builds all locales')}
          </li>
          <li>
            <code>generateMetadata()</code> {await it('locale별 title/description', 'per-locale title/description')}
          </li>
          <li>
            <code>getAlternates()</code> {await it('hreflang 링크 생성', 'generates hreflang links')}
          </li>
          <li>
            <code>LocaleProvider</code> {await it('쿠키 자동 동기화', 'auto cookie sync')}
          </li>
        </ul>
      </div>
    </>
  )
}
