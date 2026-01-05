export const locales = ['ko', 'en', 'ja'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ko'
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com'
