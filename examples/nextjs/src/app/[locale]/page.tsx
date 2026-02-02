import { it, getLocaleFromParams, getAlternates } from 'inline-i18n-multi-next/server'
import { t, setLocale, loadDictionaries } from 'inline-i18n-multi'

// Load dictionaries for server-side t() usage
loadDictionaries({
  en: {
    server: {
      title: 'Key-Based Translation (Server)',
      description: 'Using t() with setLocale() in Server Components.',
      items: { count_one: '{count} item loaded', count_other: '{count} items loaded' },
    },
  },
  ko: {
    server: {
      title: '키 기반 번역 (서버)',
      description: '서버 컴포넌트에서 setLocale()과 t()를 사용합니다.',
      items: { count_other: '{count}개 항목 로드됨' },
    },
  },
  ja: {
    server: {
      title: 'キーベース翻訳（サーバー）',
      description: 'サーバーコンポーネントでsetLocale()とt()を使用します。',
      items: { count_other: '{count}件読み込み済み' },
    },
  },
})
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
  setLocale(locale) // Required for t() in Server Components

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

      {/* Server Component with Key-Based Translation */}
      <div className="section">
        <h2>{t('server.title')}</h2>
        <p>{t('server.description')}</p>
        <p>
          {t('server.items.count', { count: 1 })} | {t('server.items.count', { count: 5 })}
        </p>
        <p style={{ marginTop: '12px', color: '#666', fontSize: '0.9em' }}>
          {await it(
            '💡 서버에서 t()를 사용하려면 setLocale(locale)을 먼저 호출하세요.',
            '💡 To use t() on server, call setLocale(locale) first.'
          )}
        </p>
      </div>

      {/* ICU Message Format Example */}
      <div className="section">
        <h2>🆕 ICU Message Format</h2>
        <p>
          <strong>Plural:</strong>{' '}
          {await it({
            ko: '{count, plural, =0 {항목 없음} other {# 개}}',
            en: '{count, plural, =0 {No items} one {# item} other {# items}}',
            ja: '{count, plural, =0 {アイテムなし} other {# 件}}',
          }, { count: 0 })}
          {' | '}
          {await it({
            ko: '{count, plural, =0 {항목 없음} other {# 개}}',
            en: '{count, plural, =0 {No items} one {# item} other {# items}}',
            ja: '{count, plural, =0 {アイテムなし} other {# 件}}',
          }, { count: 1 })}
          {' | '}
          {await it({
            ko: '{count, plural, =0 {항목 없음} other {# 개}}',
            en: '{count, plural, =0 {No items} one {# item} other {# items}}',
            ja: '{count, plural, =0 {アイテムなし} other {# 件}}',
          }, { count: 5 })}
        </p>
        <p>
          <strong>Select:</strong>{' '}
          {await it({
            ko: '{gender, select, male {그} female {그녀} other {그들}}가 말했습니다.',
            en: '{gender, select, male {He} female {She} other {They}} said.',
            ja: '{gender, select, male {彼} female {彼女} other {彼ら}}が言いました。',
          }, { gender: 'female' })}
        </p>
        <p>
          <strong>{await it('날짜', 'Date')}:</strong>{' '}
          {await it({
            ko: '{date, date, long}',
            en: '{date, date, long}',
            ja: '{date, date, long}',
          }, { date: new Date() })}
        </p>
        <p>
          <strong>{await it('숫자', 'Number')}:</strong>{' '}
          {await it({
            ko: '가격: {price, number}',
            en: 'Price: {price, number}',
            ja: '価格: {price, number}',
          }, { price: 1234.56 })}
        </p>
      </div>

      {/* v0.4.0 Features */}
      <div className="section">
        <h2>🆕 v0.4.0 {await it('기능', 'Features')}</h2>
        <p>
          <strong>{await it('상대 시간', 'Relative Time')}:</strong>{' '}
          {await it({
            ko: '{time, relativeTime} 업데이트됨',
            en: 'Updated {time, relativeTime}',
            ja: '{time, relativeTime}に更新',
          }, { time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) })}
        </p>
        <p>
          <strong>{await it('목록', 'List')}:</strong>{' '}
          {await it({
            ko: '초대됨: {names, list}',
            en: 'Invited: {names, list}',
            ja: '招待済み: {names, list}',
          }, { names: ['Alice', 'Bob', 'Charlie'] })}
        </p>
        <p>
          <strong>{await it('네임스페이스', 'Namespace')}:</strong>{' '}
          <code>t(&apos;common:hello&apos;)</code> → {await it('네임스페이스로 번역 분류', 'Organize translations by namespace')}
        </p>
        <p>
          <strong>{await it('디버그 모드', 'Debug Mode')}:</strong>{' '}
          <code>configure({'{'}debugMode: true{'}'})</code> → {await it('누락 번역 시각적 표시', 'Visual indicators for missing translations')}
        </p>
      </div>

      {/* v0.5.0 Features */}
      <div className="section">
        <h2>🆕 v0.5.0 {await it('기능', 'Features')}</h2>
        <p>
          <strong>{await it('통화', 'Currency')}:</strong>{' '}
          {await it({
            ko: '합계: {price, currency, KRW}',
            en: 'Total: {price, currency, USD}',
            ja: '合計: {price, currency, JPY}',
          }, { price: 42000 })}
        </p>
        <p>
          <strong>{await it('축약 숫자', 'Compact Number')}:</strong>{' '}
          {await it({
            ko: '{count, number, compact} 조회',
            en: '{count, number, compact} views',
            ja: '{count, number, compact} 回視聴',
          }, { count: 1500000 })}
        </p>
        <p>
          <strong>{await it('축약 숫자 (긴 형식)', 'Compact Number (long)')}:</strong>{' '}
          {await it({
            ko: '{count, number, compactLong}',
            en: '{count, number, compactLong}',
            ja: '{count, number, compactLong}',
          }, { count: 1500000 })}
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
          <li>
            <code>setLocale()</code> {await it('서버에서 t() 사용 시 필수', 'required for t() on server')}
          </li>
        </ul>
      </div>
    </>
  )
}
