import { FunctionComponent } from 'react'
import Head from 'next/head'
import { useTranslation } from 'next-i18next'

export interface Props {
  titlePrefixes?: string[];
}

const PageDocumentHead: FunctionComponent<Props> = ({ titlePrefixes = [] }) => {
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

PageDocumentHead.displayName = 'PageDocumentHead'

export default PageDocumentHead