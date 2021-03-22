import { FunctionComponent } from 'react'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'

export interface Props {
  titlePrefixes?: string[];
}

const PageHead: FunctionComponent<Props> = ({ titlePrefixes = [] }) => {
  const { t } = useTranslation('common')
  const title = [...titlePrefixes, t('title')].join(' - ')
  return (
    <Head>
      <title>{title}</title>
      <link
        href='/favicon.ico'
        rel='icon'/>
    </Head>
  )
}

PageHead.displayName = 'PageHead'

export default PageHead