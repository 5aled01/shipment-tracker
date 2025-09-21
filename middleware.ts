// middleware.ts
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localeDetection: true
});

export const config = {
  // Skip /api, /_next, etc.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
