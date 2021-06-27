import { FC, ReactNode } from 'react'
import { TableCellSortState } from 'simply-utils/dist/algo/sortTableRowsByEachCell'

import styles from './Table.module.scss'

export type SortSymbolRenderer = (cellIndex: number) => ReactNode

export interface Props {
  renderHeaderRow: (renderSortSymbol: SortSymbolRenderer) => ReactNode;
  renderRows: () => ReactNode;
  /** Pass an array of state to enable sorting for this table component */
  sortState?: TableCellSortState[];
}

const Table: FC<Props> = ({ renderHeaderRow, renderRows, sortState }) => {
  const isSortEnabled = Array.isArray(sortState)

  const renderSortSymbol: SortSymbolRenderer = cellIndex => {
    const cellSortStateIndex = sortState?.findIndex(s => s.index === cellIndex) ?? -1
    return (
      <span className={styles.sortSymbolContainer}>
        {Array.isArray(sortState) && cellSortStateIndex >= 0 && (() => {
          const cellSortState = sortState[cellSortStateIndex]
          return (
            <>
              {cellSortState?.isDescending ? '↓' : '↑'}
              {sortState.length > 1 && (
                <span className={styles.sortSequence}>
                  {`${cellSortStateIndex + 1}`}
                </span>
              )}
            </>
          )
        })()}
      </span>
    )
  }

  return (
    <table className={styles.container}>
      <thead className={isSortEnabled ? styles.tableHeadWithSort : styles.tableHead}>
        {renderHeaderRow(renderSortSymbol)}
      </thead>
      <tbody className={styles.tableBody}>
        {renderRows()}
      </tbody>
    </table>
  )
}

Table.displayName = 'Table'

export default Table