import { AppProps } from 'next/app'
import { FC } from 'react'
import { appWithTranslation } from 'next-i18next'

import '../styles/globals.scss'

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <Component {...pageProps}/>
)

export default appWithTranslation(MyApp)