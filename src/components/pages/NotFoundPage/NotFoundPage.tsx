import { FC } from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import styles from './NotFoundPage.module.scss'
import PageFooter from 'components/molecules/PageFooter'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import { getFallbackLocale } from 'utils/i18n'

export interface Props {}

const NotFoundPage: FC<Props> = () => {
  const { t, i18n } = useTranslation('404')
  const homePath = `/${i18n.language || getFallbackLocale()}`

  return (
    <div className={styles.container}>
      <PageDocumentHead titlePrefixes={['Not found']}/>
      <main className={styles.main}>
        <h1>{t('title')}</h1>
        <Link href={homePath}>
          {t('go_home')}
        </Link>
      </main>
      <PageFooter/>
    </div>
  )
}

NotFoundPage.displayName = 'NotFoundPage'

export default NotFoundPage