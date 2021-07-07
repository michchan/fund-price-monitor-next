import qs from 'qs'
import nodeFetch, {
  RequestInfo as NodeFetchRequestInfo,
  RequestInit as NodeFetchRequestInit,
  Response as NodeFetchResponse,
} from 'node-fetch'
import { isServerSide } from './environment'
import { ListErrorResponse } from '@michchan/fund-price-monitor-lib'

const HttpsProxyAgent = require('https-proxy-agent')
const HttpProxyAgent = require('http-proxy-agent')

const httpProxy = process.env.HTTP_PROXY
const httpsProxy = process.env.HTTPS_PROXY
const noProxyList = (process.env.NO_PROXY || '').trim().split(',')

const getAgent = (url: NodeFetchRequestInfo | RequestInfo) => {
  const { hostname, protocol } = new URL(url.toString())
  const isHttps = /^https/i.test(protocol)
  const Agent = isHttps ? HttpsProxyAgent : HttpProxyAgent
  const proxy = isHttps ? httpsProxy : httpProxy

  if (!proxy || noProxyList.includes(hostname)) return undefined
  return new Agent(proxy)
}

export const isomorphicFetch = (
  url: NodeFetchRequestInfo | RequestInfo,
  init?: NodeFetchRequestInit | RequestInit
): Promise<NodeFetchResponse | Response> => {
  if (isServerSide()) {
    return nodeFetch(url as NodeFetchRequestInfo, {
      ...init as NodeFetchRequestInit,
      agent: getAgent(url),
    })
  }
  return fetch(url as RequestInfo, init as RequestInit)
}

/**
 * Construct endpoint with query params
 */
export const withQuery = <P> (endpoint: string, params: P): string => {
  const queryString = qs.stringify(params)
  return [endpoint, queryString].filter(v => v.trim()).join('?')
}