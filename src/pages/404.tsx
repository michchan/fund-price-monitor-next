import { FunctionComponent } from 'react'
import { useRouter } from 'next/router'

import { isWithBackslash, parseRawPath } from 'utils/router'
import { getFallbackLocale } from 'utils/i18n'

const Custom404: FunctionComponent = () => {
  const router = useRouter()

  // Try to redirect when pathname is with backslash
  // Like "/en/home/" -> "/en/home"
  // As our static CDN host might not be supporting that.
  if (isWithBackslash(router.asPath)) {
    const { locale, pathname } = parseRawPath(router.asPath)
    router.replace(`${locale || getFallbackLocale()}/${pathname}`)
  }

  return <h1>{'Page not found'}</h1>
}
Custom404.displayName = 'Custom404'

export default Custom404