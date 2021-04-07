import { FunctionComponent } from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { companyList } from 'constants/companies'

const Home: FunctionComponent = () => {
  const router = useRouter()
  // Make sure we're in the browser
  if (typeof window !== 'undefined')
    // Fallback to the default company
    router.replace(`${getFallbackLocale()}/${companyList[0]}`)

  return null
}

Home.displayName = 'Home'

// @REASON: required by NextJS
// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: getLocalesPaths(),
  fallback: false,
})

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = (params?.locale || getFallbackLocale()) as string
  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
    },
  }
}

export default Home