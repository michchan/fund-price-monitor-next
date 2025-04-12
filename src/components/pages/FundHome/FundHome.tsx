import 'chart.js/auto'

import { Line } from 'react-chartjs-2'
import dayjs from 'dayjs'
import { CompanyType, ListSingleFundRecordsResponse } from '@michchan/fund-price-monitor-lib'
import PageDocumentHead from 'components/molecules/PageDocumentHead'
import PageFooter from 'components/molecules/PageFooter'
import capitalize from 'lodash/capitalize'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { FC, useCallback, useEffect } from 'react'

import { LOCALES, mapLocaleToApiLocale } from 'utils/i18n'
import Select, { SelectOption } from 'components/molecules/Select'
import styles from './FundHome.module.scss'

const localeOptions = LOCALES.map(value => ({ value, label: value }))

export interface Props {
  quarter: string;
  company: CompanyType;
  code: string;
  timeSeries: ListSingleFundRecordsResponse;
}

const FundHome: FC<Props> = ({ quarter, company, code, timeSeries }) => {
  const { t: tFundHome, i18n } = useTranslation('fundHome')
  const router = useRouter()

  const haveData = !!timeSeries.result

  /** ------------------------- Langauge select ------------------------- */

  const handleLanguageSelectChange = useCallback((option: SelectOption | null) => {
    if (!option) return
    const { value } = option
    router.push(`/${value}/${quarter}/${company}/${code}`, undefined, { locale: value })
  }, [code, company, quarter, router])

  useEffect(() => {
    if (!haveData && router) router.back()
  }, [haveData, router])

  if (!haveData)
    return null

  const apiLocale = mapLocaleToApiLocale(i18n.language)
  const latestTimeSeriesItem = timeSeries.data[timeSeries.data.length - 1]
  const fundName = latestTimeSeriesItem.name[apiLocale]
  const {
    fundType,
    updatedDate,
    launchedDate,
    initialPrice,
    price,
    riskLevel,
  } = latestTimeSeriesItem

  return (
    <div className={styles.container}>
      <PageDocumentHead/>
      <header className={styles.headerSection}>
        <button
          className={styles.headerSection_backButton}
          // eslint-disable-next-line react/jsx-handler-names
          onClick={router.back}
          type='button'>
          <svg
            className='bi bi-chevron-left' fill='currentColor'
            height='100%' viewBox='0 0 16 16'
            width='100%' xmlns='http://www.w3.org/2000/svg'>
            <path d='M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0' fillRule='evenodd'/>
          </svg>
        </button>
        <Select
          className={styles.localeSelect}
          onChange={handleLanguageSelectChange}
          options={localeOptions}
          value={{ value: i18n.language, label: i18n.language }}/>
      </header>
      <main className={styles.main}>
        <section className={styles.titleSection}>
          <h1 className={styles.titleSection_title}>
            {`${code} - ${fundName}`}
          </h1>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('price')}: ${price}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('updatedDate')}: ${updatedDate}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('company')}: ${capitalize(company)}`}</p>
          {<p className={styles.titleSection_subtitle}>{`${tFundHome('fundType.label')}: ${fundType ? tFundHome(`fundType.value.${fundType}`) : '--'}`}</p>}
          <p className={styles.titleSection_subtitle}>{`${tFundHome('riskLevel.label')}: ${tFundHome(`riskLevel.value.${riskLevel}`)}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('launchDate')}: ${launchedDate}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('initialPrice')}: ${initialPrice}`}</p>
        </section>
        <Line data={{
          labels: timeSeries.data.map(timeSeriesItem => dayjs(timeSeriesItem.time).format('DD-MM-YY')),
          datasets: [{
            label: tFundHome('priceChart.label'),
            data: timeSeries.data.map(timeSeriesItem => timeSeriesItem.price),
            pointRadius: 0,
          }],
        }}/>
      </main>
      <PageFooter/>
    </div>
  )
}
FundHome.displayName = 'FundHome'

export default FundHome