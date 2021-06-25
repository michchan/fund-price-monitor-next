import { FC, useCallback, FocusEvent, ChangeEvent, useState, ReactNode, HTMLProps } from 'react'
import { useTranslation } from 'next-i18next'
import { CompanyType, FundPriceRecordWithDetails, RiskLevel } from '@michchan/fund-price-monitor-lib'
import getArraySortNumber from 'simply-utils/dist/array/getArraySortNumber'
import getNumberFromPercentageString from 'simply-utils/dist/number/getNumberFromPercentageString'
import sortTableRowsByEachCell, { TableCellSortState } from 'simply-utils/dist/algo/sortTableRowsByEachCell'
import dayjs from 'dayjs'

import textAlign from 'styles/textAlign.module.scss'
import styles from './CompanyHome.module.scss'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import PageFooter from 'components/molecules/PageFooter'
import { companyList } from 'constants/companies'
import { useRouter } from 'next/router'
import Table from 'components/organisms/Table'
import { LOCALES, mapLocaleToApiLocale } from 'utils/i18n'

type Record = FundPriceRecordWithDetails<'mpf', 'latest'>

const RISK_PRIORITY: { [key in Record['riskLevel']]: number } = {
  veryLow: 1,
  low: 2,
  neutral: 3,
  high: 4,
  veryHigh: 5,
}

export interface Props {
  company: CompanyType;
  records: Record[];
}

// @REASON: This is a component
// eslint-disable-next-line max-lines-per-function
const CompanyHome: FC<Props> = ({ company, records }) => {
  const router = useRouter()
  const { t: tCommon, i18n } = useTranslation('common')

  const handleLanguageSelectChange = useCallback((
    e: FocusEvent<HTMLSelectElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    const { value } = e.target
    router.push(`/${value}/${company}`, undefined, { locale: value })
  }, [company, router])

  const renderLanguageSelect = () => (
    <select
      onBlur={handleLanguageSelectChange}
      onChange={handleLanguageSelectChange}
      value={i18n.language}>
      {LOCALES.map(locale => (
        <option
          key={locale}
          label={locale}
          value={locale}/>
      ))}
    </select>
  )

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

  const [sortState, setSortState] = useState<TableCellSortState[]>([])

  const handleSort = useCallback((cellIndex: number, isDefaultToDescending: boolean = false) => {
    setSortState(prev => {
      const prevCellState = prev.find(s => s.index === cellIndex)
      // Case: previously not sorted --> append this cell
      if (!prevCellState)
        return [...prev, { index: cellIndex, isDescending: isDefaultToDescending }]
      // Case: previously was not default ordering --> remove this cell
      if (prevCellState.isDescending !== isDefaultToDescending)
        return prev.filter(s => s.index !== cellIndex)
      // Default case: previously was sorted --> change sort ordering
      return prev.map(s => {
        if (s.index === cellIndex) {
          return {
            index: cellIndex,
            isDescending: !s.isDescending,
          }
        }
        return s
      })
    })
  }, [])

  const renderRecordsHeaderRow = useCallback(() => {
    interface CellProps extends HTMLProps<HTMLTableHeaderCellElement> {
      isDefaultToDescending?: boolean;
    }

    const renderCell = (
      index: number,
      children: ReactNode,
      cellProps?: CellProps,
    ) => {
      const { isDefaultToDescending, ...props } = cellProps ?? {}
      const foundSortStateIndex = sortState.findIndex(s => s.index === index)
      const foundSortState = sortState[foundSortStateIndex]
      return (
        <th
          {...props}
          key={index}
          onClick={() => handleSort(index, isDefaultToDescending)}>
          {children}
          {foundSortState && (
            <>
              &nbsp;
              {foundSortState.isDescending ? '↓' : '↑'}
              <sub>{`${foundSortStateIndex + 1}`}</sub>
            </>
          )}
        </th>
      )
    }

    const headData: ([ReactNode] | [ReactNode, CellProps])[] = [
      ['Code'],
      ['Name'],
      ['Price', { isDefaultToDescending: true }],
      ['Day +/-', { isDefaultToDescending: true }],
      ['Risk Level', { className: textAlign.center }],
      ['Updated Date', { className: textAlign.right, isDefaultToDescending: true }],
      ['Recorded Time', { className: textAlign.right, isDefaultToDescending: true }],
    ]

    return (
      <tr>
        {headData.map(([children, props], i) => renderCell(i, children, props))}
      </tr>
    )
  }, [handleSort, sortState])

  const getRecordValueByCellIndex = useCallback((r: Record, cellIndex: number): string | number => {
    if (cellIndex === 0) return r.code
    if (cellIndex === 1) return r.name[mapLocaleToApiLocale(i18n.language)] || r.name.en
    if (cellIndex === 2) return r.price
    if (cellIndex === 3) return `${Number(r.dayPriceChangeRate)?.toFixed(2)}%`
    if (cellIndex === 4) return r.riskLevel
    if (cellIndex === 5) return r.updatedDate
    if (cellIndex === 6) return dayjs(r.time).format('YYYY-MM-DD HH:mm:ss')
    return ''
  }, [i18n.language])

  const renderRecordsRows = useCallback(() => {
    const sortedRecords = sortTableRowsByEachCell(records, sortState, (a, b, cellIndex) => {
      const valueA = getRecordValueByCellIndex(a, cellIndex)
      const valueB = getRecordValueByCellIndex(b, cellIndex)

      if (cellIndex === 3) {
        const getPercent = (val: string | number) => Math.abs(getNumberFromPercentageString(val))
        return getArraySortNumber(getPercent(valueA), getPercent(valueB))
      }
      if (cellIndex === 4) {
        return getArraySortNumber(
          RISK_PRIORITY[valueA as RiskLevel],
          RISK_PRIORITY[valueB as RiskLevel]
        )
      }
      return getArraySortNumber(valueA, valueB)
    })

    return sortedRecords.map(r => (
      <tr key={`${company}-${r.code}`}>
        {Array(7)
          .fill({})
          .map((v, i) => (
            <td key={i}>{getRecordValueByCellIndex(r, i)}</td>
          ))}
      </tr>
    ))
  }, [company, getRecordValueByCellIndex, records, sortState])

  const renderRecordsTable = () => (
    <Table
      renderHeaderRow={renderRecordsHeaderRow}
      renderRows={renderRecordsRows}
      sortState={sortState}/>
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
          {renderLanguageSelect()}
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