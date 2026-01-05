import { NextRequest, NextResponse } from 'next/server'
import type { Locale } from 'inline-i18n-multi'

interface I18nMiddlewareConfig {
  /**
   * Supported locales
   */
  locales: readonly Locale[] | Locale[]
  /**
   * Default locale when no match found
   */
  defaultLocale: Locale
  /**
   * Enable automatic locale detection from Accept-Language header
   * @default true
   */
  localeDetection?: boolean
  /**
   * Cookie name for storing user's locale preference
   * @default 'NEXT_LOCALE'
   */
  cookieName?: string
}

/**
 * Create Next.js middleware for i18n routing
 * @param config - Middleware configuration
 */
export function createI18nMiddleware(config: I18nMiddlewareConfig) {
  const {
    locales,
    defaultLocale,
    localeDetection = true,
    cookieName = 'NEXT_LOCALE',
  } = config

  return function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // check if pathname already has locale prefix
    const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) {
      // extract locale from pathname and set header
      const localeFromPath = pathname.split('/')[1] ?? defaultLocale
      const response = NextResponse.next()
      response.headers.set('x-locale', localeFromPath)
      return response
    }

    // determine locale
    let locale = defaultLocale

    // 1. check cookie first
    const cookieLocale = request.cookies.get(cookieName)?.value
    if (cookieLocale && locales.includes(cookieLocale)) {
      locale = cookieLocale
    }
    // 2. detect from Accept-Language header
    else if (localeDetection) {
      const acceptLanguage = request.headers.get('accept-language')
      if (acceptLanguage) {
        const parts = acceptLanguage.split(',')[0]?.split('-')
        const preferredLocale = parts?.[0]
        if (preferredLocale && locales.includes(preferredLocale as Locale)) {
          locale = preferredLocale as Locale
        }
      }
    }

    // redirect to locale-prefixed path
    request.nextUrl.pathname = `/${locale}${pathname}`
    const response = NextResponse.redirect(request.nextUrl)
    response.headers.set('x-locale', locale)

    return response
  }
}

export type { I18nMiddlewareConfig }
