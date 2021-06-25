import { FC, ReactNode } from 'react'
import { TableCellSortState } from 'simply-utils/dist/algo/sortTableRowsByEachCell'

import styles from './Table.module.scss'

export interface Props {
  renderHeaderRow: () => ReactNode;
  renderRows: () => ReactNode;
  sortState?: TableCellSortState[];
}

const Table: FC<Props> = ({ renderHeaderRow, renderRows }) => (
  <table className={styles.container}>
    <thead className={styles.tableHead}>
      {renderHeaderRow()}
    </thead>
    <tbody className={styles.tableBody}>
      {renderRows()}
    </tbody>
  </table>
)

Table.displayName = 'Table'

export default Table