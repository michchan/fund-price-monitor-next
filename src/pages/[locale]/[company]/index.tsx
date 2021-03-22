import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'
import { Company, companyList } from 'constants/companies'
import { Props } from 'components/layouts/CompanyHome'

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
  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      company: params?.company as Company,
    },
  }
}

export { default } from 'components/layouts/CompanyHome'