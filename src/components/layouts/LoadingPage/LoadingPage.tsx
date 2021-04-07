import { FunctionComponent } from 'react'
import styles from './LoadingPage.module.scss'

export interface Props {}

const LoadingPage: FunctionComponent<Props> = () => (
  <div className={styles.container}>
    {Array(Number(styles.numDots))
      .fill(null)
      // @REASON: Not necessary for unique keys
      // eslint-disable-next-line react/no-array-index-key
      .map((c, i) => <span key={i}/>)}
  </div>
)

LoadingPage.displayName = 'LoadingPage'

export default LoadingPage