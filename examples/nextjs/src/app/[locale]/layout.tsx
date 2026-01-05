import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LocaleProvider } from 'inline-i18n-multi-next/client'
import {
  configureI18n,
  getLocaleFromParams,
  generateLocaleParams,
  createMetadata,
} from 'inline-i18n-multi-next/server'
import { locales, defaultLocale, baseUrl } from '@/i18n.config'

// Configure i18n for SEO utilities
configureI18n({ locales, defaultLocale, baseUrl })

// Generate static params for all locales (SSG support)
export function generateStaticParams() {
  return generateLocaleParams()
}

// Dynamic metadata with translations
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  // Validate locale
  if (!(locales as readonly string[]).includes(locale)) {
    return { title: 'Not Found' }
  }

  return createMetadata(
    {
      title: {
        ko: 'inline-i18n-multi - 인라인 다국어 번역',
        en: 'inline-i18n-multi - Inline Multilingual Translations',
        ja: 'inline-i18n-multi - インライン多言語翻訳',
      },
      description: {
        ko: '코드에서 바로 번역을 작성하고, 즉시 검색하세요.',
        en: 'Write translations inline. Find them instantly.',
        ja: 'コードに翻訳を直接記述し、即座に検索できます。',
      },
    },
    locale,
    '' // root path
  )
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Validate locale, show 404 if invalid
  try {
    getLocaleFromParams({ locale })
  } catch {
    notFound()
  }

  return (
    <html lang={locale}>
      <head>
        <style>{`
          * { box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          button { padding: 8px 16px; margin: 4px; cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 4px; }
          button:hover { background: #f5f5f5; }
          button.active { background: #007bff; color: white; border-color: #007bff; }
          .section { margin: 20px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
          h1, h2 { margin-top: 0; }
          nav a { margin-right: 16px; color: #007bff; text-decoration: none; }
          nav a:hover { text-decoration: underline; }
          code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
          .seo-info { background: #e7f5ff; padding: 12px; border-radius: 6px; font-size: 0.9em; }
          .seo-info code { background: #d0ebff; }
        `}</style>
      </head>
      <body>
        <LocaleProvider locale={locale}>
          <div className="container">{children}</div>
        </LocaleProvider>
      </body>
    </html>
  )
}
