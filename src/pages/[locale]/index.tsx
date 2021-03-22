import { FunctionComponent } from 'react'
import { useRouter } from 'next/router'
import { getFallbackLocale } from 'utils/i18n'
import { companyList } from 'constants/companies'

const Home: FunctionComponent = () => {
  const router = useRouter()
  // Make sure we're in the browser
  if (typeof window !== 'undefined')
    // @TODO: Fallback to previous browsed company using localstorage/cookie
    // Fallback to the default company
    router.replace(`${getFallbackLocale()}/${companyList[0]}`)

  return null
}

Home.displayName = 'Home'

export default Home