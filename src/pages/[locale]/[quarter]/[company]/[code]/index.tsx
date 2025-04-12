// @REASON: required by NextJS
import { GetStaticPaths, GetStaticProps } from 'next'
import { listCompanies, listCompanyRecords, listQuarters, listSingleFundRecords } from 'services/fundprices'
import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { Props } from 'components/pages/FundHome'
import { CompanyType, ListSingleFundRecordsTenor } from '@michchan/fund-price-monitor-lib'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { throwResultError } from 'utils/service'

// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => {
  const quartersRes = await throwResultError(listQuarters, 'listQuarters')

  const allFundsRes = await Promise.all(
    quartersRes.data.map(async quarter => {
      const companies = await throwResultError(() => listCompanies({ quarter }), 'listCompanies')
      return Promise.all(companies.data.map(async company => {
        const fundsRes = await throwResultError(() => listCompanyRecords(company, { latest: true, quarter }), 'listCompanyRecords')
        return fundsRes.data.map(res => ({ ...res, quarter }))
      }))
    })
  )

  return {
    paths: allFundsRes
      .flat()
      .flat()
      .flatMap(fund => getLocalesPaths().map(localePath => {
        const { company, code, quarter } = fund
        if (typeof localePath === 'string') return `${localePath}/${quarter}/${company}/${code}`
        return { ...localePath, params: { ...localePath.params, quarter, company, code } }
      })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  const quarter = params?.quarter as string
  const company = params?.company as CompanyType
  const code = params?.code as string

  // TODO: Fix URI-unsafe code issue
  const timeSeries: Props['timeSeries'] = code.includes('/')
    ? { result: false, error: { message: 'Non-handled URI-unsafe code issue', code: '' } }
    // TODO: List different tenors
    : await listSingleFundRecords(company, code, { tenor: ListSingleFundRecordsTenor.all })

  return {
    props: {
      ...await serverSideTranslations(locale, ['common', 'fundHome']),
      quarter,
      company,
      code,
      timeSeries,
    },
  }
}

export { default } from 'components/pages/FundHome'