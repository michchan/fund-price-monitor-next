import { CompanyType, ListSingleFundRecordsResponse } from '@michchan/fund-price-monitor-lib'
import { FC } from 'react'

export interface Props {
  company: CompanyType;
  code: string;
  timeSeries: ListSingleFundRecordsResponse;
}

const FundHome: FC<Props> = () => null

FundHome.displayName = 'FundHome'

export default FundHome