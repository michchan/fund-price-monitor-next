import { FunctionComponent } from 'react'
import { useRouter } from 'next/router'

import { isWithBackslash, parseRawPath } from 'utils/router'
import { getFallbackLocale } from 'utils/i18n'
import LoadingPage from 'components/pages/LoadingPage'

const Custom404: FunctionComponent = () => {
  const router = useRouter()

  // Make sure we're in the browser
  if (typeof window !== 'undefined') {
    const { locale, pathname } = parseRawPath(router.asPath)

    const redirectPath = isWithBackslash(router.asPath)
      // Try to redirect when pathname is with backslash
      // Like "/en/home/" -> "/en/home"
      // As our static CDN host might not be supporting that.
      ? pathname
      // Need to redirect to the 404 page with "locale" as
      // Server side locale is not support in SSG.
      : 'not-found'

    router.replace(`${locale || getFallbackLocale()}/${redirectPath}`)
  }
  return <LoadingPage/>
}
Custom404.displayName = 'Custom404'

export default Custom404