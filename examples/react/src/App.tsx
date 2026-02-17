import { useLocale, useT, it, T, RichText, registerFormatter, clearFormatters, configure, resetConfig } from 'inline-i18n-multi-react'

export default function App() {
  const [locale, setLocale] = useLocale()
  const t = useT()

  return (
    <div className="container">
      <h1>{it('인라인 i18n 예시', 'Inline i18n Example')}</h1>

      {/* Language Switcher */}
      <div className="section">
        <h2>{it('언어 선택', 'Language')}</h2>
        <button
          className={locale === 'ko' ? 'active' : ''}
          onClick={() => setLocale('ko')}
        >
          한국어
        </button>
        <button
          className={locale === 'en' ? 'active' : ''}
          onClick={() => setLocale('en')}
        >
          English
        </button>
        <button
          className={locale === 'ja' ? 'active' : ''}
          onClick={() => setLocale('ja')}
        >
          日本語
        </button>
      </div>

      {/* Inline Translations with it() */}
      <div className="section">
        <h2>{it('인라인 번역 (it)', 'Inline Translations (it)')}</h2>
        <p>{it('안녕하세요! 인라인 번역 예시입니다.', 'Hello! This is an inline translation example.')}</p>
        <p>{it('변수 사용: {name}님 환영합니다', 'With variables: Welcome, {name}', { name: 'User' })}</p>
      </div>

      {/* Component Syntax with T */}
      <div className="section">
        <h2><T ko="컴포넌트 문법 (T)" en="Component Syntax (T)" ja="コンポーネント構文 (T)" /></h2>
        <p>
          <T
            ko="T 컴포넌트를 사용하면 더 깔끔하게 번역할 수 있습니다."
            en="Using the T component makes translations cleaner."
            ja="Tコンポーネントを使うとよりクリーンに翻訳できます。"
          />
        </p>
        <p>
          <T ko="{count}개의 항목" en="{count} items" ja="{count}件" count={5} />
        </p>
      </div>

      {/* Key-Based Translations with useT */}
      <div className="section">
        <h2>{it('키 기반 번역 (useT)', 'Key-Based Translations (useT)')}</h2>
        <nav>
          <button>{t('nav.home')}</button>
          <button>{t('nav.about')}</button>
          <button>{t('nav.contact')}</button>
        </nav>
        <p>{t('welcome', { name: 'React User' })}</p>
        <p>{t('items.count', { count: 1 })}</p>
        <p>{t('items.count', { count: 10 })}</p>
      </div>

      {/* Multi-language Object Syntax */}
      <div className="section">
        <h2>{it('다국어 객체 문법', 'Multi-language Object Syntax')}</h2>
        <p>
          {it({
            ko: '객체 문법으로 여러 언어를 한 번에 지정할 수 있습니다.',
            en: 'Object syntax allows specifying multiple languages at once.',
            ja: 'オブジェクト構文で複数の言語を一度に指定できます。',
          })}
        </p>
      </div>

      {/* v0.5.0: Rich Text */}
      <div className="section">
        <h2>{it('리치 텍스트 (v0.5.0)', 'Rich Text (v0.5.0)')}</h2>
        <p>
          <RichText
            translations={{
              ko: '<link>이용약관</link>을 읽고 <bold>동의</bold>해주세요',
              en: 'Read <link>terms</link> and <bold>agree</bold>',
              ja: '<link>利用規約</link>を読んで<bold>同意</bold>してください',
            }}
            components={{
              link: (text) => <a href="/terms" style={{ color: '#0070f3', textDecoration: 'underline' }}>{text}</a>,
              bold: (text) => <strong>{text}</strong>,
            }}
          />
        </p>
      </div>

      {/* v0.5.0: Currency & Compact Number */}
      <div className="section">
        <h2>{it('통화 & 축약 숫자 (v0.5.0)', 'Currency & Compact Number (v0.5.0)')}</h2>
        <p>
          {it({
            ko: '합계: {price, currency, KRW}',
            en: 'Total: {price, currency, USD}',
            ja: '合計: {price, currency, JPY}',
          }, { price: 42000 })}
        </p>
        <p>
          {it({
            ko: '{count, number, compact} 조회',
            en: '{count, number, compact} views',
            ja: '{count, number, compact} 回視聴',
          }, { count: 1500000 })}
        </p>
      </div>

      {/* v0.6.0: Custom Formatter */}
      <div className="section">
        <h2>{it('커스텀 포맷터 (v0.6.0)', 'Custom Formatter (v0.6.0)')}</h2>
        <p>
          {(() => {
            clearFormatters()
            registerFormatter('phone', (value) => {
              const s = String(value)
              return `(${s.slice(0, 3)}) ${s.slice(3, 6)}-${s.slice(6)}`
            })
            return it({ en: 'Call {num, phone}', ko: '전화: {num, phone}' }, { num: '2125551234' })
          })()}
        </p>
      </div>

      {/* v0.6.0: Interpolation Guards */}
      <div className="section">
        <h2>{it('보간 가드 (v0.6.0)', 'Interpolation Guards (v0.6.0)')}</h2>
        <p>
          {(() => {
            configure({ missingVarHandler: (v: string) => `[${v}]` })
            const result = it({ en: 'Hello {name}, your role is {role}', ko: '안녕 {name}, 역할은 {role}' }, { name: 'User' })
            resetConfig()
            return result
          })()}
        </p>
      </div>

      {/* v0.7.0: Plural Shorthand */}
      <div className="section">
        <h2>{it('복수형 축약 (v0.7.0)', 'Plural Shorthand (v0.7.0)')}</h2>
        <p>
          {it({ en: '{count, p, item|items}', ko: '{count}개 항목' }, { count: 1 })}
          {' | '}
          {it({ en: '{count, p, item|items}', ko: '{count}개 항목' }, { count: 5 })}
        </p>
        <p>
          {it({ en: '{count, p, no messages|message|messages}', ko: '{count, p, 메시지 없음|개 메시지|개 메시지}' }, { count: 0 })}
          {' | '}
          {it({ en: '{count, p, no messages|message|messages}', ko: '{count, p, 메시지 없음|개 메시지|개 메시지}' }, { count: 1 })}
          {' | '}
          {it({ en: '{count, p, no messages|message|messages}', ko: '{count, p, 메시지 없음|개 메시지|개 메시지}' }, { count: 42 })}
        </p>
      </div>
    </div>
  )
}
