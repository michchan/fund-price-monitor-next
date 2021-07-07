/**
 * For script generating no language fallback static pages
 * (Used by scripts/generateNoLangFallbackPages)
 */
import { listCompanies } from 'services/fundprices'

export interface DynamicPathConfig {
  path: string;
  variants: string[];
}

const getDynamicPaths = async (): Promise<DynamicPathConfig[]> => {
  const companiesRes = await listCompanies()
  if (!companiesRes.result)
    throw new Error(`listCompanies failed: ${JSON.stringify(companiesRes.error)}`)

  return [
    {
      path: '[company]/index',
      variants: companiesRes.data.map(company => `${company}/index`),
    },
  ]
}

export default getDynamicPaths