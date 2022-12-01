import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { CompanyType, RecordType, ListResponse, ListSuccessResponse } from '@michchan/fund-price-monitor-lib'
import getWeekOfYear from 'simply-utils/dist/dateTime/getWeekOfYear'
import getQuarter from 'simply-utils/dist/dateTime/getQuarter'
import zeroPadding from 'simply-utils/dist/number/zeroPadding'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { Props } from 'components/pages/CompanyHome'
import { listCompanies, listCompanyFundsMonthlyRates, listCompanyFundsQuarterlyRates, listCompanyFundsWeeklyRates, listCompanyRecords } from 'services/fundprices'

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

// @TODO: Move to utils/service
async function throwResultError <T> (
  fetchData: () => Promise<ListResponse<T>>,
  name: string
): Promise<ListSuccessResponse<T>> {
  const res = await fetchData()
  if (!res.result)
    throw new Error(`${name} failed: ${JSON.stringify(res.error ?? 'unknown reason')}`)
  return res
}

// @REASON: required by NextJS
// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => {
  const companiesRes = await listCompanies()
  if (!companiesRes.result)
    throw new Error(`listCompanies failed: ${JSON.stringify(companiesRes.error)}`)

  return {
    paths: companiesRes.data.flatMap(company => getLocalesPaths().map(path => {
      if (typeof path === 'string') return `${path}/${company}`
      return { ...path, params: { ...path.params, company } }
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  const company = params?.company as CompanyType
  const date = new Date()

  const [
    companiesRes,
    recordsRes,
    weekRateRes,
    monthRateRes,
    quarterRateRes,
  ] = await Promise.all([
    throwResultError(listCompanies, 'listCompanies'),
    throwResultError(() => listCompanyRecords<RecordType.latest>(company, { latest: true }), 'listCompanyRecords'),
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
      company,
      records: recordsRes.data,
      weekRateRecords: weekRateRes.data,
      monthRateRecords: monthRateRes.data,
      quarterRateRecords: quarterRateRes.data,
    },
  }
}

export { default } from 'components/pages/CompanyHome'