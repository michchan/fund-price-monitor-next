import { FunctionComponent, useCallback, FocusEvent, ChangeEvent } from 'react'
import { useTranslation } from 'next-i18next'
import { CompanyType, FundPriceRecordWithDetails, Languages } from '@michchan/fund-price-monitor-lib'

import styles from './CompanyHome.module.scss'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import PageFooter from 'components/molecules/PageFooter'
import { companyList } from 'constants/companies'
import { useRouter } from 'next/router'

export interface Props {
  company: CompanyType;
  records: FundPriceRecordWithDetails<'mpf', 'latest'>[];
}

const CompanyHome: FunctionComponent<Props> = ({ company, records }) => {
  const router = useRouter()
  const { t, i18n } = useTranslation('common')

  const handleCompanySelectChange = useCallback((
    e: FocusEvent<HTMLSelectElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target
    router.push(`/${i18n.language}/${value}`, undefined, { locale: i18n.language })
  }, [i18n.language, router])

  const renderCompanySelect = () => (
    <select
      onBlur={handleCompanySelectChange}
      onChange={handleCompanySelectChange}
      value={company}>
      {companyList.map(com => (
        <option
          key={com}
          label={com}
          value={com}/>
      ))}
    </select>
  )

  const renderRecordsTable = () => (
    <table>
      <thead>
        <tr>
          <th>{'Code'}</th>
          <th>{'Name'}</th>
          <th>{'Price'}</th>
          <th>{'Day +/-'}</th>
          <th>{'Risk Level'}</th>
          <th>{'Updated Date'}</th>
          <th>{'Recorded Time'}</th>
        </tr>
      </thead>
      <tbody>
        {records.map(r => (
          <tr key={`${company}-${r.code}`}>
            <td>{r.code}</td>
            <td>{r.name[i18n.language as Languages] || r.name.en}</td>
            <td>{r.price}</td>
            <td>{`${Number(r.dayPriceChangeRate)?.toFixed(2)}%`}</td>
            <td>{r.riskLevel}</td>
            <td>{r.updatedDate}</td>
            <td>{r.time}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  return (
    <div className={styles.container}>
      <PageDocumentHead/>
      <main className={styles.main}>
        <section className={styles.titleSection}>
          <h1 className={styles.titleSection_title}>{t('title')}</h1>
          <p className={styles.titleSection_subtitle}>{t('subtitle')}</p>
        </section>
        <section className={styles.filterSection}>
          {renderCompanySelect()}
        </section>
        <section className={styles.tableSection}>
          {renderRecordsTable()}
        </section>
      </main>
      <PageFooter/>
    </div>
  )
}

CompanyHome.displayName = 'CompanyHome'

export default CompanyHome