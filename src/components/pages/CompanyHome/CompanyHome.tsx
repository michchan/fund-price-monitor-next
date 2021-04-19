import { FC, useCallback, FocusEvent, ChangeEvent, ReactNode } from 'react'
import { useTranslation } from 'next-i18next'
import { CompanyType, FundPriceRecordWithDetails, Languages } from '@michchan/fund-price-monitor-lib'

import styles from './CompanyHome.module.scss'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import PageFooter from 'components/molecules/PageFooter'
import { companyList } from 'constants/companies'
import { useRouter } from 'next/router'
import Table from 'components/organisms/Table'

export interface Props {
  company: CompanyType;
  records: FundPriceRecordWithDetails<'mpf', 'latest'>[];
}

// @REASON: This is a component
// eslint-disable-next-line max-lines-per-function
const CompanyHome: FC<Props> = ({ company, records }) => {
  const router = useRouter()
  const { t: tCommon, i18n } = useTranslation('common')

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

  const renderRecordsRows = useCallback((
    rowClassName: string,
    columnClassName: string,
  ) => records.map(r => {
    const renderColumn = (children: ReactNode) => (
      <td className={columnClassName}>{children}</td>
    )
    return (
      <tr
        className={rowClassName}
        key={`${company}-${r.code}`}>
        {renderColumn(r.code)}
        {renderColumn(r.name[i18n.language as Languages] || r.name.en)}
        {renderColumn(r.price)}
        {renderColumn(`${Number(r.dayPriceChangeRate)?.toFixed(2)}%`)}
        {renderColumn(r.riskLevel)}
        {renderColumn(r.updatedDate)}
        {renderColumn(r.time)}
      </tr>
    )
  }), [company, i18n.language, records])

  const renderRecordsTable = () => (
    <Table
      headers={[
        'Code',
        'Name',
        'Price',
        'Day +/-',
        'Risk Level',
        'Updated Date',
        'Recorded Time',
      ]}
      renderRows={renderRecordsRows}/>
  )

  return (
    <div className={styles.container}>
      <PageDocumentHead/>
      <main className={styles.main}>
        <section className={styles.titleSection}>
          <h1 className={styles.titleSection_title}>{tCommon('title')}</h1>
          <p className={styles.titleSection_subtitle}>{tCommon('subtitle')}</p>
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