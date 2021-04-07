import { isValidLocale } from './i18n'

export interface ParseRawPathReturnType {
  locale: string | null;
  // Without preceding slash "/"
  pathname: string;
}
export function parseRawPath (path: string): ParseRawPathReturnType {
  // Assume the first segment is locale
  const [locale, ...restSegments] = path.replace(/(^\/)|(\/$)/, '').split('/')
  if (isValidLocale(locale))
    return { locale, pathname: restSegments.join('/') }
  // Otherwise, join the first segment as pathname as well
  return {
    locale: null,
    pathname: [locale, ...restSegments].join('/'),
  }
}

export const isWithBackslash = (path: string): boolean => /\/$/.test(path)