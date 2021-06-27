import { AppProps } from 'next/app'
import { FC } from 'react'
import { appWithTranslation } from 'next-i18next'

import '../styles/globals.scss'
import PageProgressBar from 'components/molecules/PageProgressBar'

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <>
    <PageProgressBar/>
    <Component {...pageProps}/>
  </>
)

export default appWithTranslation(MyApp)