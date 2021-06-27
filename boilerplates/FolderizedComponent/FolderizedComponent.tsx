import { FC } from 'react'

import styles from './FolderizedComponent.module.scss'

export interface Props {
  title?: string;
}

const FolderizedComponent: FC<Props> = ({ title }) => {
  const text = title
  return (
    <div className={styles.container}>
      <h1>{text}</h1>
    </div>
  )
}

FolderizedComponent.displayName = 'FolderizedComponent'

export default FolderizedComponent