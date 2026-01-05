'use client'

import { useLocale, it } from 'inline-i18n-multi-next/client'

export function LanguageSwitcher() {
  const [locale, setLocale] = useLocale()

  return (
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
      <p>
        {it('현재 언어', 'Current language')}: <strong>{locale}</strong>
      </p>
    </div>
  )
}
