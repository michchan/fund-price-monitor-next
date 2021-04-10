import {
  CompanyType,
  RecordType,
  ListCompanyRecordsQueryParams,
  ListCompanyRecordsResponse,
} from '@michchan/fund-price-monitor-lib'
import { withQuery } from 'utils/restApi'

const HOST = `${process.env.NEXT_PUBLIC_API_HOST}/fundprices/mpf`
const API_KEY = process.env.NEXT_PUBLIC_API_KEY as string

const withApiKey = () => ({ 'x-api-key': API_KEY })

export const listCompanyRecords = <RT extends RecordType> (
  company: CompanyType,
  query: ListCompanyRecordsQueryParams = {}
): Promise<ListCompanyRecordsResponse<'mpf', RT>> => fetch(withQuery(`${HOST}/${company}`, query), {
  headers: withApiKey(),
}).then(res => res.json() as Promise<ListCompanyRecordsResponse<'mpf', RT>>)