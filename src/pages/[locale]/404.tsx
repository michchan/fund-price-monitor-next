import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'

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
      ...await serverSideTranslations(locale, ['common', '404']),
    },
  }
}

export { default } from 'components/layouts/NotFoundPage'