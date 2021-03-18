import { FunctionComponent } from 'react'
import Head from 'next/head'
import styles from 'styles/Home.module.scss'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetStaticPaths, GetStaticProps } from 'next'
import { i18n } from '../../../next-i18next.config'

const Home: FunctionComponent = () => {
  const { t } = useTranslation('common')
  return (
    <div className={styles.container}>
      <Head>
        <title>{t('title')}</title>
        <link
          href='/favicon.ico'
          rel='icon'/>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>
          {'[Hi] Welcome to '}
          <a href='https://nextjs.org'>{'Next.js!'}</a>
        </h1>

        <p className={styles.description}>
          {'Get started by editing'}
          {' '}
          <code className={styles.code}>{'pages/index.js'}</code>
        </p>

        <div className={styles.grid}>
          <a
            className={styles.card}
            href='https://nextjs.org/docs'>
            <h3>{'Documentation &rarr;'}</h3>
            <p>{'Find in-depth information about Next.js features and API.'}</p>
          </a>

          <a
            className={styles.card}
            href='https://nextjs.org/learn'>
            <h3>{'Learn &rarr;'}</h3>
            <p>{'Learn about Next.js in an interactive course with quizzes!'}</p>
          </a>

          <a
            className={styles.card}
            href='https://github.com/vercel/next.js/tree/master/examples'>
            <h3>{'Examples &rarr;'}</h3>
            <p>{'Discover and deploy boilerplate example Next.js projects.'}</p>
          </a>

          <a
            className={styles.card}
            href='https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'>
            <h3>{'Deploy &rarr;'}</h3>
            <p>
              {'Instantly deploy your Next.js site to a public URL with Vercel.'}
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
          rel='noopener noreferrer'
          target='_blank'>
          {'Powered by'}
          {' '}
          <img
            alt='Vercel Logo'
            className={styles.logo}
            src='/vercel.svg'/>
        </a>
      </footer>
    </div>
  )
}

Home.displayName = 'Home'

// eslint-disable-next-line require-await
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: i18n.locales.map(locale => ({ params: { locale } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = (params?.locale || i18n.defaultLocale) as string
  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
    },
  }
}

export default Home