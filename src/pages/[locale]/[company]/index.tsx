import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { CompanyType } from '@michchan/fund-price-monitor-lib'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { Props } from 'components/pages/CompanyHome'
import { listCompanies, listCompanyRecords } from 'services/fundprices'

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

  const companiesRes = await listCompanies()
  if (!companiesRes.result)
    throw new Error(`listCompanies failed: ${JSON.stringify(companiesRes.error)}`)

  const recordsRes = await listCompanyRecords<'latest'>(company, { latest: true })
  if (!recordsRes.result)
    throw new Error(`listCompanyRecords failed: ${JSON.stringify(recordsRes.error)}`)

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      companies: companiesRes.data,
      company,
      records: recordsRes.data,
    },
  }
}

export { default } from 'components/pages/CompanyHome'