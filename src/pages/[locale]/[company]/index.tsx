import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { CompanyType } from '@michchan/fund-price-monitor-lib'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { companyList } from 'constants/companies'
import { Props } from 'components/pages/CompanyHome'
import { listCompanyRecords } from 'services/fundprices'

// @REASON: required by NextJS
// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: companyList.flatMap(company => getLocalesPaths().map(path => {
    if (typeof path === 'string') return `${path}/${company}`
    return { ...path, params: { ...path.params, company } }
  })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  const company = params?.company as CompanyType

  const recordsResponse = await listCompanyRecords<'latest'>(company, { latest: true })

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      company,
      records: recordsResponse.result ? recordsResponse.data : [],
    },
  }
}

export { default } from 'components/pages/CompanyHome'