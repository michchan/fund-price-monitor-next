import qs from 'qs'

/**
 * Construct endpoint with query params
 */
export const withQuery = <P> (endpoint: string, params: P): string => {
  const queryString = qs.stringify(params)
  return [endpoint, queryString].filter(v => v.trim()).join('?')
}