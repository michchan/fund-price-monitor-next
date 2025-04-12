import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticPathsResult, GetStaticProps } from 'next'
import { CompanyType, RecordType } from '@michchan/fund-price-monitor-lib'
import getWeekOfYear from 'simply-utils/dist/dateTime/getWeekOfYear'
import getQuarter from 'simply-utils/dist/dateTime/getQuarter'
import zeroPadding from 'simply-utils/dist/number/zeroPadding'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { Props } from 'components/pages/CompanyHome'
import { listCompanies, listCompanyFundsMonthlyRates, listCompanyFundsQuarterlyRates, listCompanyFundsWeeklyRates, listCompanyRecords, listQuarters } from 'services/fundprices'
import { throwResultError } from 'utils/service'

// @TODO: Move to common utils/libs
const getWeekExpression = (date: Date): string => {
  const year = date.getFullYear()
  const week = getWeekOfYear(date)
  return `${year}.${week}`
}

// @TODO: Move to common utils/libs
const getMonthExpression = (date: Date): string => {
  const year = date.getFullYear()
  const month = zeroPadding(date.getMonth() + 1)
  return `${year}-${month}`
}

// @TODO: Move to common utils/libs
const getQuarterExpression = (date: Date): string => {
  const year = date.getFullYear()
  const quarter = getQuarter(date)
  return `${year}.${quarter}`
}

// @REASON: required by NextJS
// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => {
  const quartersRes = await throwResultError(listQuarters, 'listQuarters')

  const paths: GetStaticPathsResult['paths'] = []

  for (const quarter of quartersRes.data) {
    const companiesRes = await throwResultError(() => listCompanies({ quarter }), 'listCompanies')
    const pathsPerQuarter = companiesRes.data
      .flatMap(company => getLocalesPaths().map(localePath => {
        if (typeof localePath === 'string') return `${localePath}/${quarter}/${company}`
        return {
          ...localePath,
          params: {
            ...localePath.params,
            quarter,
            company,
          },
        }
      }))
    paths.push(...pathsPerQuarter)
  }

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  const quarter = params?.quarter as string
  const company = params?.company as CompanyType
  const date = new Date()

  const quartersRes = await throwResultError(listQuarters, 'listQuarters')

  const listAllQuartersForCompany = async () => {
    const quarters: string[] = []
    for (const q of quartersRes.data) {
      const comRes = await throwResultError(() => listCompanies({ quarter: q }), 'listCompanies')
      if (comRes.data.includes(company))
        quarters.push(q)
    }
    return quarters
  }
  const quartersForCompany = await listAllQuartersForCompany()

  const [
    companiesRes,
    recordsRes,
    weekRateRes,
    monthRateRes,
    quarterRateRes,
  ] = await Promise.all([
    throwResultError(() => listCompanies({ quarter }), 'listCompanies'),
    throwResultError(() => listCompanyRecords<RecordType.latest>(company, { latest: true, quarter }), 'listCompanyRecords'),
    throwResultError(() => listCompanyFundsWeeklyRates(company, getWeekExpression(date), {
      all: true,
    }), 'listCompanyFundsWeeklyRates'),
    throwResultError(() => listCompanyFundsMonthlyRates(company, getMonthExpression(date), {
      all: true,
    }), 'listCompanyFundsMonthlyRates'),
    throwResultError(() => listCompanyFundsQuarterlyRates(company, getQuarterExpression(date), {
      all: true,
    }), 'listCompanyFundsQuarterlyRates'),
  ])

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      companies: companiesRes.data,
      quarter,
      quarters: quartersRes.data.reverse(),
      quartersForCompany,
      company,
      records: recordsRes.data,
      weekRateRecords: weekRateRes.data,
      monthRateRecords: monthRateRes.data,
      quarterRateRecords: quarterRateRes.data,
    },
  }
}

export { default } from 'components/pages/CompanyHome'