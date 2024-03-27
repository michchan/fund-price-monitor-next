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
  company: CompanyType;
  code: string;
  timeSeries: ListSingleFundRecordsResponse;
}

const FundHome: FC<Props> = ({ company, code, timeSeries }) => {
  const { t: tFundHome, i18n } = useTranslation('fundHome')
  const router = useRouter()

  const haveData = !!timeSeries.result

  /** ------------------------- Langauge select ------------------------- */

  const handleLanguageSelectChange = useCallback((option: SelectOption | null) => {
    if (!option) return
    const { value } = option
    router.push(`/${value}/${company}/${code}`, undefined, { locale: value })
  }, [code, company, router])

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
          <p className={styles.titleSection_subtitle}>{`${tFundHome('fundType.label')}: ${tFundHome(`fundType.value.${fundType}`)}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('riskLevel.label')}: ${tFundHome(`riskLevel.value.${riskLevel}`)}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('launchDate')}: ${launchedDate}`}</p>
          <p className={styles.titleSection_subtitle}>{`${tFundHome('initialPrice')}: ${initialPrice}`}</p>
        </section>
      </main>
      <PageFooter/>
    </div>
  )
}
FundHome.displayName = 'FundHome'

export default FundHome