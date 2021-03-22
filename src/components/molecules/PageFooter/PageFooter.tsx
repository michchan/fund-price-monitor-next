import { useTranslation } from 'next-i18next'
import { FunctionComponent } from 'react'
import parseHTML from 'html-react-parser'
import styles from './PageFooter.module.scss'

const builtYear = new Date().getFullYear()

const PageFooter: FunctionComponent = () => {
  const { t } = useTranslation('common')
  return (
    <footer className={styles.container}>
      <p>
        {`${t('title')}, ${builtYear}`}
      </p>
      <p>
        <small>
          <i>{parseHTML(t('footer_disclaimer'))}</i>
        </small>
      </p>
    </footer>
  )
}

PageFooter.displayName = 'PageFooter'

export default PageFooter