import styles from './DataTable.module.css'

const ARIA_SORT = { asc: 'ascending', desc: 'descending' }

/**
 * Column header that sorts the table when clicked.
 *
 * @param {object} props
 * @param {import('./dataTableUtils.js').Column} props.column
 * @param {import('./dataTableUtils.js').SortState | null} props.sort - current sort of the table
 * @param {(key: string) => void} props.onSort - called with the key of the column
 */
export function SortableHeader({ column, sort, onSort }) {
  const direction = sort?.key === column.key ? sort.direction : undefined

  return (
    <th scope="col" aria-sort={direction ? ARIA_SORT[direction] : undefined} className={styles.headerCell}>
      <button type="button" className={styles.sortButton} onClick={() => onSort(column.key)}>
        {column.title}
        <span className={styles.sortIcon} data-direction={direction ?? 'none'} aria-hidden="true" />
      </button>
    </th>
  )
}
