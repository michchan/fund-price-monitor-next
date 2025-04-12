import { ListResponse, ListSuccessResponse } from '@michchan/fund-price-monitor-lib'

export async function throwResultError <T> (
  fetchData: () => Promise<ListResponse<T>>,
  name: string
): Promise<ListSuccessResponse<T>> {
  const res = await fetchData()
  if (!res.result)
    throw new Error(`${name} failed: ${JSON.stringify(res.error ?? 'unknown reason')}`)
  return res
}