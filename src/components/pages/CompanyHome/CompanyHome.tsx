import { FC, useCallback, useState, ReactNode, HTMLProps, useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import { CompanyType, FundPriceChangeRateWithDetails, FundPriceRecordWithDetails, FundType, RecordType, AggregatedRecordType, RiskLevel } from '@michchan/fund-price-monitor-lib'
import getArraySortNumber from 'simply-utils/dist/array/getArraySortNumber'
import getNumberFromPercentageString from 'simply-utils/dist/number/getNumberFromPercentageString'
import sortTableRowsByEachCell, { TableCellSortState } from 'simply-utils/dist/algo/sortTableRowsByEachCell'
import getTableRowsSortStateReducer from 'simply-utils/dist/algo/getTableRowsSortStateReducer'
import dayjs from 'dayjs'
import omit from 'lodash/omit'

import textAlign from 'styles/textAlign.module.scss'
import styles from './CompanyHome.module.scss'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import PageFooter from 'components/molecules/PageFooter'
import { useRouter } from 'next/router'
import Table, { Props as TableProps } from 'components/organisms/Table'
import { LOCALES, mapLocaleToApiLocale } from 'utils/i18n'
import Select, { SelectOption } from 'components/molecules/Select'

const formatChangeRate = (value: number) => `${Number(value)?.toFixed(2)}%`

type Record = FundPriceRecordWithDetails<FundType.mpf, RecordType.latest>

type WeeklyChangeRateRecord = FundPriceChangeRateWithDetails<
FundType.mpf, AggregatedRecordType.week>

type MonthlyChangeRateRecord = FundPriceChangeRateWithDetails<
FundType.mpf, AggregatedRecordType.month>

type QuarterlyChangeRateRecord = FundPriceChangeRateWithDetails<
FundType.mpf, AggregatedRecordType.quarter>

const RISK_PRIORITY: { [key in Record['riskLevel']]: number } = {
  unknown: 0,
  veryLow: 1,
  low: 2,
  neutral: 3,
  high: 4,
  veryHigh: 5,
}

const localeOptions = LOCALES.map(value => ({ value, label: value }))

interface CellProps extends HTMLProps<HTMLTableHeaderCellElement> {
  isDefaultToDescending?: boolean;
  isSortSymbolBeforeTitle?: boolean;
}

const RECORD_TABLE_HEAD_CONFIG: ([ReactNode] | [ReactNode, CellProps])[] = [
  ['Code'],
  ['Name'],
  ['Price', { isDefaultToDescending: true }],
  ['Day +/-', { isDefaultToDescending: true }],
  ['Week +/-', { isDefaultToDescending: true }],
  ['Month +/-', { isDefaultToDescending: true }],
  ['Quarter +/-', { isDefaultToDescending: true }],
  ['Risk Level', { className: textAlign.center }],
  ['Updated Date', { className: textAlign.right, isDefaultToDescending: true, isSortSymbolBeforeTitle: true }],
  ['Recorded Time', { className: textAlign.right, isDefaultToDescending: true, isSortSymbolBeforeTitle: true }],
]

export interface Props {
  companies: CompanyType[];
  company: CompanyType;
  records: Record[];
  weekRateRecords: WeeklyChangeRateRecord[];
  monthRateRecords: MonthlyChangeRateRecord[];
  quarterRateRecords: QuarterlyChangeRateRecord[];
}

// @REASON: This is a component
// eslint-disable-next-line max-lines-per-function
const CompanyHome: FC<Props> = ({
  companies,
  company,
  records,
  weekRateRecords,
  monthRateRecords,
  quarterRateRecords,
}) => {
  const router = useRouter()
  const { t: tCommon, i18n } = useTranslation('common')

  /** ------------------------- Langauge select ------------------------- */

  const handleLanguageSelectChange = useCallback((option: SelectOption | null) => {
    if (!option) return
    const { value } = option
    router.push(`/${value}/${company}`, undefined, { locale: value })
  }, [company, router])

  /** ------------------------- Company select ------------------------- */

  const companyOptions = useMemo(() => companies.map(value => ({
    value,
    label: value,
  })), [companies])

  const handleCompanySelectChange = useCallback((option: SelectOption | null) => {
    if (!option) return
    const { value } = option
    router.push(`/${i18n.language}/${value}`, undefined, { locale: i18n.language })
  }, [i18n.language, router])

  /** ------------------------- Table sorting/rendering ------------------------- */

  const [sortState, setSortState] = useState<TableCellSortState[]>([])

  const handleSort = useCallback((cellIndex: number, isDefaultToDescending: boolean = false) => {
    setSortState(getTableRowsSortStateReducer(cellIndex, isDefaultToDescending))
  }, [])

  const getRecordValueByCellIndex = useCallback((r: Record, cellIndex: number): string | number => {
    const weekRate = weekRateRecords.find(rateRec => rateRec.code === r.code)?.priceChangeRate
    const monthRate = monthRateRecords.find(rateRec => rateRec.code === r.code)?.priceChangeRate
    const quarterRate = quarterRateRecords.find(rateRec => rateRec.code === r.code)?.priceChangeRate
    const values = [
      r.code,
      r.name[mapLocaleToApiLocale(i18n.language)] || r.name.en,
      r.price,
      formatChangeRate(r.dayPriceChangeRate ?? 0),
      formatChangeRate(weekRate ?? 0),
      formatChangeRate(monthRate ?? 0),
      formatChangeRate(quarterRate ?? 0),
      r.riskLevel,
      r.updatedDate,
      dayjs(r.time).format('YYYY-MM-DD HH:mm:ss'),
    ]
    return values[cellIndex] ?? ''
  }, [i18n.language, monthRateRecords, quarterRateRecords, weekRateRecords])

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
    return sortedRecords.map(record => (
      <tr key={`${company}-${record.code}`}>
        {Array(RECORD_TABLE_HEAD_CONFIG.length)
          .fill({})
          .map((v, cellIndex) => {
            const headCellProps = RECORD_TABLE_HEAD_CONFIG[cellIndex][1]
            return (
              <td
                {...omit(headCellProps, ['isDefaultToDescending', 'isSortSymbolBeforeTitle'])}
                key={cellIndex}>
                {getRecordValueByCellIndex(record, cellIndex)}
              </td>
            )
          })}
      </tr>
    ))
  }, [company, getRecordValueByCellIndex, records, sortState])

  const renderRecordsHeaderRow = useCallback<TableProps['renderHeaderRow']>(renderSortSymbol => {
    const renderCell = (
      index: number,
      children: ReactNode,
      cellProps?: CellProps,
    ) => {
      const { isDefaultToDescending, isSortSymbolBeforeTitle, ...props } = cellProps ?? {}
      return (
        <th
          {...props}
          key={index}
          onClick={() => handleSort(index, isDefaultToDescending)}>
          {isSortSymbolBeforeTitle ? renderSortSymbol(index) : children}
          {isSortSymbolBeforeTitle ? children : renderSortSymbol(index)}
        </th>
      )
    }
    return (
      <tr>
        {RECORD_TABLE_HEAD_CONFIG.map(([children, props], i) => renderCell(i, children, props))}
      </tr>
    )
  }, [handleSort])

  return (
    <div className={styles.container}>
      <PageDocumentHead/>
      <header className={styles.headerSection}>
        <Select
          className={styles.localeSelect}
          onChange={handleLanguageSelectChange}
          options={localeOptions}
          value={{ value: i18n.language, label: i18n.language }}/>
      </header>
      <main className={styles.main}>
        <section className={styles.titleSection}>
          <h1 className={styles.titleSection_title}>{tCommon('title')}</h1>
          <p className={styles.titleSection_subtitle}>{tCommon('subtitle')}</p>
        </section>
        <section className={styles.filterSection}>
          <Select
            className={styles.companySelect}
            onChange={handleCompanySelectChange}
            options={companyOptions}
            value={{ value: company, label: company }}/>
        </section>
        <section className={styles.tableSection}>
          <Table
            renderHeaderRow={renderRecordsHeaderRow}
            renderRows={renderRecordsRows}
            sortState={sortState}/>
        </section>
      </main>
      <PageFooter/>
    </div>
  )
}

CompanyHome.displayName = 'CompanyHome'

export default CompanyHome