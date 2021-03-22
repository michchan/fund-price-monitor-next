import { FunctionComponent } from 'react'
import { useTranslation } from 'next-i18next'

import styles from './CompanyHome.module.scss'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import PageFooter from 'components/molecules/PageFooter'
import { Company } from 'constants/companies'

export interface Props {
  company: Company;
}

const CompanyHome: FunctionComponent<Props> = ({ company }) => {
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
          <input
            type='select'
            value={company}/>
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

export default CompanyHome