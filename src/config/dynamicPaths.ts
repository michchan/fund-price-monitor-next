/**
 * For script generating no language fallback static pages
 * (Used by scripts/generateNoLangFallbackPages)
 */
import { companyList } from 'constants/companies'

const dynamicPaths = [
  {
    path: '[company]/index',
    variants: companyList.map(company => `${company}/index`),
  },
] as const

export default dynamicPaths