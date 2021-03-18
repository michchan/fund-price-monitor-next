import { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { getFallbackLocale } from 'utils/i18n'

const HomeFallback = (): ReactNode => {
  const router = useRouter()
  // Make sure we're in the browser
  if (typeof window !== 'undefined')
    router.replace(`${getFallbackLocale()}/${router.pathname}`)

  return null
}

HomeFallback.displayName = 'HomeFallback'

export default HomeFallback