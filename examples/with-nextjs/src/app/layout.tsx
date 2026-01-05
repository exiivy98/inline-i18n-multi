import type { Metadata } from 'next'
import { LocaleProvider } from 'inline-i18n-multi-next/client'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'inline-i18n-multi Next.js Example',
  description: 'Example of using inline-i18n-multi with Next.js App Router',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get locale from header (set by middleware)
  const headersList = await headers()
  const locale = headersList.get('x-locale') || 'ko'

  return (
    <html lang={locale}>
      <head>
        <style>{`
          * { box-sizing: border-box; }
          body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 800px; margin: 0 auto; }
          button { padding: 8px 16px; margin: 4px; cursor: pointer; }
          button.active { background: #007bff; color: white; border: none; border-radius: 4px; }
          .section { margin: 20px 0; padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
          h1, h2 { margin-top: 0; }
          nav a { margin-right: 16px; }
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
