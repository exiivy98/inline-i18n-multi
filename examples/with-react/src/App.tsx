import { useLocale, useT, it, T } from 'inline-i18n-multi-react'

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
    </div>
  )
}
