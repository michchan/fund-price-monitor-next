import { FunctionComponent } from 'react'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'

import styles from './CompanyHome.module.scss'
import PageDocumentHead from 'components/PageDocumentHead'
import PageFooter from 'components/PageFooter'

const CompanyHome: FunctionComponent = () => {
  const { t } = useTranslation('common')
  return (
    <div className={styles.container}>
      <PageDocumentHead/>
      <main className={styles.main}>
        <section className={styles.titleSection}>
          <h1 className={styles.titleSection_title}>{t('title')}</h1>
          <p className={styles.titleSection_subtitle}>{t('subtitle')}</p>
        </section>
        <section className={styles.filterSection}>
          <input type='select'/>
        </section>
        <section className={styles.tableSection}>
          <div>{'table'}</div>
        </section>
      </main>
      <PageFooter/>
    </div>
  )
}

CompanyHome.displayName = 'CompanyHome'

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

export default CompanyHome