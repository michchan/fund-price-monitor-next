import {
  CompanyType,
  RecordType,
  AggregatedRecordType,
  FundType,
  ListCompaniesQueryParams,
  ListCompaniesResponse,
  ListCompanyRecordsQueryParams,
  ListCompanyRecordsResponse,
  ListCompanySinglePeriodRatesResponse,
  ListCompanySinglePeriodRatesQueryParams,
  ListSingleFundRecordsResponse,
  ListSingleFundRecordsPathParams,
  ListSingleFundRecordsQueryParams,
  ListQuartersQueryParams,
  ListQuartersResponse,
} from '@michchan/fund-price-monitor-lib'
import { isomorphicFetch, withQuery } from 'utils/restApi'

/** @ServerSideOnly */
const HOST = `${process.env.API_HOST}/fundprices/mpf`
const API_KEY = process.env.API_KEY as string

const withApiKey = () => ({ 'x-api-key': API_KEY })

export const listQuarters = (
  query: ListQuartersQueryParams = {}
): Promise<ListQuartersResponse> => isomorphicFetch(withQuery(`${HOST}/quarters`, query), {
  headers: withApiKey(),
}).then(res => res.json() as Promise<ListQuartersResponse>)

export const listCompanies = (
  query: ListCompaniesQueryParams = {}
): Promise<ListCompaniesResponse> => isomorphicFetch(withQuery(`${HOST}/companies`, query), {
  headers: withApiKey(),
}).then(res => res.json() as Promise<ListCompaniesResponse>)

export const listCompanyRecords = <RT extends RecordType> (
  company: CompanyType,
  query: ListCompanyRecordsQueryParams = {}
): Promise<ListCompanyRecordsResponse<FundType.mpf, RT>> => isomorphicFetch(
  withQuery(`${HOST}/${company}`, query), {
    headers: withApiKey(),
  }
).then(res => res.json() as Promise<ListCompanyRecordsResponse<FundType.mpf, RT>>)

export const listSingleFundRecords = <RT extends RecordType>(
  company: ListSingleFundRecordsPathParams['company'],
  code: ListSingleFundRecordsPathParams['code'],
  query: ListSingleFundRecordsQueryParams = {}
): Promise<ListSingleFundRecordsResponse<FundType.mpf, RT>> => isomorphicFetch(
  withQuery(`${HOST}/${company}/${code}`, query), {
    headers: withApiKey(),
  }
).then(res => res.json() as Promise<ListSingleFundRecordsResponse<FundType.mpf, RT>>)

type ChangeRatesResponse <RT extends AggregatedRecordType> = ListCompanySinglePeriodRatesResponse<
FundType.mpf, RT>

export const listCompanyFundsSinglePeriodRates = <RT extends AggregatedRecordType> (
  periodType: RT,
  company: CompanyType,
  periodExpression: string,
  query: ListCompanySinglePeriodRatesQueryParams = {}
): Promise<ChangeRatesResponse<RT>> => {
  const periodPath = (() => {
    switch (periodType) {
      case AggregatedRecordType.quarter:
        return 'quarterrates'
      case AggregatedRecordType.month:
        return 'monthrates'
      case AggregatedRecordType.week:
        return 'weekrates'
    }
  })()
  return isomorphicFetch(
    withQuery(`${HOST}/${company}/${periodPath}/${periodExpression}`, query), {
      headers: withApiKey(),
    }
  ).then(res => res.json() as Promise<ChangeRatesResponse<RT>>)
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const listCompanyFundsWeeklyRates = (
  company: CompanyType,
  /** For example: '2022.25' i.e. the 25th week of 2022 */
  periodExpression: string,
  query: ListCompanySinglePeriodRatesQueryParams = {}
) => listCompanyFundsSinglePeriodRates(AggregatedRecordType.week, company, periodExpression, query)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const listCompanyFundsMonthlyRates = (
  company: CompanyType,
  /** For example: '2022-06' */
  periodExpression: string,
  query: ListCompanySinglePeriodRatesQueryParams = {}
) => listCompanyFundsSinglePeriodRates(AggregatedRecordType.month, company, periodExpression, query)

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const listCompanyFundsQuarterlyRates = (
  company: CompanyType,
  /** For example: '2022.2' i.e. the 2nd quarter of 2022 */
  periodExpression: string,
  query: ListCompanySinglePeriodRatesQueryParams = {}
) => listCompanyFundsSinglePeriodRates(
  AggregatedRecordType.quarter, company, periodExpression, query
)