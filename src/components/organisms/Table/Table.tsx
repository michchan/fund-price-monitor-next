import { FC, ReactNode } from 'react'

import styles from './Table.module.scss'

export interface Props {
  headers: string[];
  renderRows: (
    rowClassName: string,
    columnClassName: string,
  ) => ReactNode;
}

const Table: FC<Props> = ({ headers, renderRows }) => (
  <table className={styles.container}>
    <thead>
      <tr className={styles.headerRow}>
        {headers.map((header, i) => (
          <th
            className={styles.headerColumn}
            key={i}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {renderRows(styles.row, styles.column)}
    </tbody>
  </table>
)

Table.displayName = 'Table'

export default Table