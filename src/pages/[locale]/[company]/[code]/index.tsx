// @REASON: required by NextJS

import { GetStaticPaths, GetStaticProps } from 'next'
import { listCompanies, listCompanyRecords, listSingleFundRecords } from 'services/fundprices'
import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { Props } from 'components/pages/FundHome'
import { CompanyType } from '@michchan/fund-price-monitor-lib'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => {
  const companiesRes = await listCompanies()
  if (!companiesRes.result)
    throw new Error(`listCompanies failed: ${JSON.stringify(companiesRes.error)}`)

  const allFundsRes = await Promise.all(companiesRes.data.map(async company => {
    const fundsRes = await listCompanyRecords(company, { latest: true })
    if (!fundsRes.result)
      throw new Error(`listCompanyRecords for ${company} failed: ${JSON.stringify(fundsRes.error)}`)
    return fundsRes.data
  }))

  return {
    paths: allFundsRes.flat().flatMap(fund => getLocalesPaths().map(path => {
      const { company, code } = fund
      if (typeof path === 'string') return `${path}/${company}/${code}`
      return { ...path, params: { ...path.params, company, code } }
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  const company = params?.company as CompanyType
  const code = params?.code as string

  const timeSeries = await listSingleFundRecords(company, code, { all: true })

  return {
    props: {
      ...await serverSideTranslations(locale, ['common', 'fundHome']),
      company,
      code,
      timeSeries,
    },
  }
}

export { default } from 'components/pages/FundHome'