import { FC, useEffect } from 'react'
import NextNprogress from 'nextjs-progressbar'
import NProgress from 'nprogress'
import colors from 'styles/colors.module.scss'

export interface Props {
  shouldShowSpinner?: boolean;
}

const PageProgressBar: FC<Props> = props => {
  useEffect(() => {
    const {
      shouldShowSpinner = false,
    } = props
    NProgress.configure({ showSpinner: shouldShowSpinner })
  }, [props])

  return (
    <NextNprogress color={colors.color_subtitle}/>
  )
}

PageProgressBar.displayName = 'PageProgressBar'

export default PageProgressBar