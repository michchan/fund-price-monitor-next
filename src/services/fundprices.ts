import {
  CompanyType,
  RecordType,
  ListCompaniesQueryParams,
  ListCompaniesResponse,
  ListCompanyRecordsQueryParams,
  ListCompanyRecordsResponse,
} from '@michchan/fund-price-monitor-lib'
import { isomorphicFetch, withQuery } from 'utils/restApi'

/** @ServerSideOnly */
const HOST = `${process.env.API_HOST}/fundprices/mpf`
const API_KEY = process.env.API_KEY as string

const withApiKey = () => ({ 'x-api-key': API_KEY })

export const listCompanies = (
  query: ListCompaniesQueryParams = {}
): Promise<ListCompaniesResponse> => isomorphicFetch(withQuery(`${HOST}/companies`, query), {
  headers: withApiKey(),
}).then(res => res.json() as Promise<ListCompaniesResponse>)

export const listCompanyRecords = <RT extends RecordType> (
  company: CompanyType,
  query: ListCompanyRecordsQueryParams = {}
): Promise<ListCompanyRecordsResponse<'mpf', RT>> => isomorphicFetch(withQuery(`${HOST}/${company}`, query), {
  headers: withApiKey(),
}).then(res => res.json() as Promise<ListCompanyRecordsResponse<'mpf', RT>>)