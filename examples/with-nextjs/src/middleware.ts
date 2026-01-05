import { createI18nMiddleware } from 'inline-i18n-multi-next/middleware'
import { locales, defaultLocale } from './i18n.config'

export default createI18nMiddleware({
  locales,
  defaultLocale,
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
