import { AppProps } from 'next/app'
import { ReactNode } from 'react'
import Head from 'next/head'
import '../styles/globals.scss'

const MyApp = ({ Component, pageProps }: AppProps): ReactNode => (
  <>
    <Head>
      <title>{'Create Next App'}</title>
      <link
        href='/favicon.ico'
        rel='icon'/>
    </Head>
    <Component {...pageProps}/>
  </>
)

export default MyApp