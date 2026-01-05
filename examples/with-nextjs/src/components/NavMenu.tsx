'use client'

import { useT, loadDictionaries, it } from 'inline-i18n-multi-next/client'

// Load dictionaries (typically in app entry, shown here for demo)
loadDictionaries({
  en: {
    nav: { home: 'Home', about: 'About', contact: 'Contact', blog: 'Blog' },
    items: { count_one: '{count} item', count_other: '{count} items' },
  },
  ko: {
    nav: { home: '홈', about: '소개', contact: '연락처', blog: '블로그' },
    items: { count_other: '{count}개 항목' },
  },
  ja: {
    nav: { home: 'ホーム', about: '概要', contact: 'お問い合わせ', blog: 'ブログ' },
    items: { count_other: '{count}件' },
  },
})

export function NavMenu() {
  const t = useT()

  return (
    <div className="section">
      <h2>{it('키 기반 번역 (useT)', 'Key-Based Translations (useT)')}</h2>
      <nav>
        <a href="#">{t('nav.home')}</a>
        <a href="#">{t('nav.about')}</a>
        <a href="#">{t('nav.contact')}</a>
        <a href="#">{t('nav.blog')}</a>
      </nav>
      <p style={{ marginTop: '16px' }}>
        {t('items.count', { count: 1 })} | {t('items.count', { count: 5 })}
      </p>
    </div>
  )
}
