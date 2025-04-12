import qs from 'qs'
import nodeFetch, {
  RequestInfo as NodeFetchRequestInfo,
  RequestInit as NodeFetchRequestInit,
} from 'node-fetch'
import { isServerSide } from './environment'

const HttpsProxyAgent = require('https-proxy-agent')
const HttpProxyAgent = require('http-proxy-agent')

const httpProxy = process.env.HTTP_PROXY
const httpsProxy = process.env.HTTPS_PROXY
const isInMemoryCacheEnabled = /^true$/.test(process.env.ENABLE_IN_MEMORY_CACHE ?? '')
const noProxyList = (process.env.NO_PROXY || '').trim().split(',')

const cache = new Map()

const getAgent = (url: NodeFetchRequestInfo | RequestInfo) => {
  const { hostname, protocol } = new URL(url.toString())
  const isHttps = /^https/i.test(protocol)
  const Agent = isHttps ? HttpsProxyAgent : HttpProxyAgent
  const proxy = isHttps ? httpsProxy : httpProxy

  if (!proxy || noProxyList.includes(hostname)) return undefined
  return new Agent(proxy)
}

export const isomorphicFetch = async <T> (
  url: NodeFetchRequestInfo | RequestInfo,
  init?: NodeFetchRequestInit | RequestInit
): Promise<T> => {
  if (isServerSide()) {
    const cacheKey = url.toString()
    if (isInMemoryCacheEnabled) {
      const cachedResponseJson = await cache.get(cacheKey)
      if (cachedResponseJson) return cachedResponseJson
    }
    const responseJson = await nodeFetch(url as NodeFetchRequestInfo, {
      ...init as NodeFetchRequestInit,
      agent: getAgent(url),
    }).then(res => res.json())
    if (isInMemoryCacheEnabled)
      cache.set(cacheKey, responseJson)

    return responseJson
  }
  return fetch(url as RequestInfo, init as RequestInit).then(res => res.json())
}

/**
 * Construct endpoint with query params
 */
export const withQuery = <P> (endpoint: string, params: P): string => {
  const queryString = qs.stringify(params)
  return [endpoint, queryString].filter(v => v.trim()).join('?')
}