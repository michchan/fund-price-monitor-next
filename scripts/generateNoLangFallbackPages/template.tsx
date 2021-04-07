import { FunctionComponent } from 'react'
import { useRouter } from 'next/router'
import { getFallbackLocale } from 'utils/i18n'
import LoadingPage from 'components/layouts/LoadingPage'

const NoLangFallbackPage: FunctionComponent = () => {
  const router = useRouter()
  // Make sure we're in the browser
  if (typeof window !== 'undefined')
    router.replace(`${getFallbackLocale()}/${router.pathname}`.replace(/\/+/g, '/'))

  return <LoadingPage/>
}

NoLangFallbackPage.displayName = 'NoLangFallbackPage'

export default NoLangFallbackPage