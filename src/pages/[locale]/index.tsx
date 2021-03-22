import { FunctionComponent } from 'react'
import styles from 'styles/Home.module.scss'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { getFallbackLocale, getLocalesPaths } from 'utils/i18n'

import PageDocumentHead from 'components/PageDocumentHead'
import PageFooter from 'components/PageFooter'

const Home: FunctionComponent = () => {
  const { t } = useTranslation('common')
  return (
    <div className={styles.container}>
      <PageDocumentHead/>
      <main className={styles.main}>
        <section className={styles.titleSection}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </section>
      </main>
      <PageFooter/>
    </div>
  )
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