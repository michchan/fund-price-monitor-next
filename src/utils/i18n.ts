import { Languages } from '@michchan/fund-price-monitor-lib'
import { GetStaticPathsResult } from 'next'
import { i18n } from '../../next-i18next.config'

const LOCALE_API_LOCALE_MAP: { [k: string]: Languages } = {
  en: Languages.en,
  zh: Languages.zh_HK,
}

export const LOCALES = i18n.locales

export const DEFAULT_LOCALE = i18n.defaultLocale

// @REASON: required by GetStaticPathsResult
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type LocalePathParams = { locale: string }
export type LocalePaths = GetStaticPathsResult<LocalePathParams>['paths']

export const getLocalesPaths = (): LocalePaths => LOCALES
  .map(locale => ({ params: { locale } }))

// @TODO: Use locale on localStorage / browser preference
export const getFallbackLocale = (): string => DEFAULT_LOCALE

export const isValidLocale = (maybeLocale: string): boolean => LOCALES
  .some(locale => new RegExp(`^${locale}$`, 'i').test(maybeLocale))

export const mapLocaleToApiLocale = (locale: string): Languages => LOCALE_API_LOCALE_MAP[locale]