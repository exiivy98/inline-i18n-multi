'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale, it } from 'inline-i18n-multi-next/client'
import { locales } from '@/i18n.config'

const localeNames: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
}

export function LanguageSwitcher() {
  const [locale, setLocale] = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const handleLocaleChange = (newLocale: string) => {
    // Update React state and cookie
    setLocale(newLocale)

    // Navigate to the new locale URL
    // Replace current locale in pathname with new locale
    const segments = pathname.split('/')
    segments[1] = newLocale // /[locale]/... -> /[newLocale]/...
    router.push(segments.join('/'))
  }

  return (
    <div className="section">
      <h2>{it('언어 선택', 'Language')}</h2>
      {locales.map((loc) => (
        <button
          key={loc}
          className={locale === loc ? 'active' : ''}
          onClick={() => handleLocaleChange(loc)}
        >
          {localeNames[loc] || loc}
        </button>
      ))}
      <p>
        {it('현재 언어', 'Current language')}: <strong>{localeNames[locale] || locale}</strong>
      </p>
      <p style={{ fontSize: '0.9em', color: '#666' }}>
        {it(
          '언어 변경 시 쿠키가 자동으로 저장되어 새로고침해도 유지됩니다.',
          'Language preference is saved in a cookie and persists across refreshes.'
        )}
      </p>
    </div>
  )
}
