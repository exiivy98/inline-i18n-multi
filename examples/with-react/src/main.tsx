import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LocaleProvider, loadDictionaries } from 'inline-i18n-multi-react'
import App from './App'

// Load dictionaries for key-based translations
loadDictionaries({
  en: {
    nav: { home: 'Home', about: 'About', contact: 'Contact' },
    items: { count_one: '{count} item', count_other: '{count} items' },
    welcome: 'Welcome, {name}!',
  },
  ko: {
    nav: { home: '홈', about: '소개', contact: '연락처' },
    items: { count_other: '{count}개 항목' },
    welcome: '환영합니다, {name}님!',
  },
  ja: {
    nav: { home: 'ホーム', about: '概要', contact: 'お問い合わせ' },
    items: { count_other: '{count}件' },
    welcome: 'ようこそ、{name}さん！',
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider locale="en">
      <App />
    </LocaleProvider>
  </StrictMode>
)
