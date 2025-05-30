import { FC } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import LoadingPage from 'components/pages/LoadingPage'
import { isClientSide } from 'utils/environment'
import { CompanyType } from '@michchan/fund-price-monitor-lib'
import { listCompanies, listQuarters } from 'services/fundprices'
import { throwResultError } from 'utils/service'

export interface Props {
  latestQuarter: string | null;
  company: CompanyType | null;
}

const Home: FC<Props> = ({ latestQuarter, company }) => {
  const router = useRouter()
  const { i18n } = useTranslation()

  // Make sure we're in the browser
  if (isClientSide()) {
    if (!latestQuarter || !company) {
      router.replace(`${i18n.language || getFallbackLocale()}/not-found`)
    } else {
    // Fallback to the default company
      router.replace(`${i18n.language || getFallbackLocale()}/${latestQuarter}/${company}`)
    }
  }

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

  const quartersRes = await throwResultError(listQuarters, 'listQuarters')

  let latestQuarter: string | null = null
  let company: CompanyType | null = null

  for (const quarter of quartersRes.data.reverse()) {
    const companiesRes = await throwResultError(() => listCompanies({ quarter }), 'listCompanies')
    if (companiesRes.data.length > 0) {
      latestQuarter = quarter
      // eslint-disable-next-line prefer-destructuring
      company = companiesRes.data[0]
      break
    }
  }

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      latestQuarter,
      company,
    },
  }
}

export default Home