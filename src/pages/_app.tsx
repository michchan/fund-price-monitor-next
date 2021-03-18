import { AppProps } from 'next/app'
import { FunctionComponent } from 'react'
import { appWithTranslation } from 'next-i18next'

import '../styles/globals.scss'

const MyApp: FunctionComponent<AppProps> = ({ Component, pageProps }) => (
  <Component {...pageProps}/>
)

export default appWithTranslation(MyApp)