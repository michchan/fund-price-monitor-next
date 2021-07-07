import { FC } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import LoadingPage from 'components/pages/LoadingPage'
import { isClientSide } from 'utils/environment'
import { CompanyType } from '@michchan/fund-price-monitor-lib'
import { listCompanies } from 'services/fundprices'

export interface Props {
  companies: CompanyType[];
}

const Home: FC<Props> = ({ companies }) => {
  const router = useRouter()
  const { i18n } = useTranslation()

  // Make sure we're in the browser
  if (isClientSide())
    // Fallback to the default company
    router.replace(`${i18n.language || getFallbackLocale()}/${companies[0]}`)

  return <LoadingPage/>
}

Home.displayName = 'Home'

// @REASON: required by NextJS
// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getLocalesPaths(),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string

  const companiesRes = await listCompanies()
  if (!companiesRes.result)
    throw new Error(`listCompanies failed: ${JSON.stringify(companiesRes.error)}`)

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      companies: companiesRes.data,
    },
  }
}

export default Home