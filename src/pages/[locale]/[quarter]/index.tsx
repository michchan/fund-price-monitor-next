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
  quarter: string;
  companies: CompanyType[];
}

const QuarterHome: FC<Props> = ({ quarter, companies }) => {
  const router = useRouter()
  const { i18n } = useTranslation()

  // Make sure we're in the browser
  if (isClientSide())
    // Fallback to the default company
    router.replace(`/${i18n.language || getFallbackLocale()}/${quarter}/${companies[0]}`)

  return <LoadingPage/>
}

QuarterHome.displayName = 'QuarterHome'

// @REASON: required by NextJS
// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => {
  const quartersRes = await throwResultError(listQuarters, 'listQuarters')
  return {
    paths: quartersRes.data.flatMap(quarter => getLocalesPaths().map(localePath => {
      if (typeof localePath === 'string') return `${localePath}/${quarter}`
      return { ...localePath, params: { ...localePath.params, quarter } }
    })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  const quarter = params?.quarter as string

  const companiesRes = await throwResultError(() => listCompanies({ quarter }), 'listCompanies')

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      companies: companiesRes.data,
      quarter,
    },
  }
}

export default QuarterHome