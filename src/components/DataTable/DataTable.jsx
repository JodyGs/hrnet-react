import { memo, useId } from 'react'
import { Select } from '../Select/Select.jsx'
import { getCellText } from './dataTableUtils.js'
import { Pagination } from './Pagination.jsx'
import { SortableHeader } from './SortableHeader.jsx'
import { useDataTable } from './useDataTable.js'
import styles from './DataTable.module.css'

/**
 * One row of the table. Memoized: when a row is added, the existing rows are
 * not re-rendered (issue #2 of the jQuery DataTables plugin).
 */
const TableRow = memo(function TableRow({ row, columns }) {
  return (
    <tr>
      {columns.map((column) => (
        <td key={column.key}>{getCellText(row, column)}</td>
      ))}
    </tr>
  )
})

/**
 * Data table — React replacement for the jQuery plugin DataTables.
 *
 * Features of the HRnet usage of DataTables: number of entries per page,
 * global search, sort by column, information line and pagination.
 *
 * @param {object} props
 * @param {object[]} props.rows - data to display, one object per row
 * @param {import('./dataTableUtils.js').Column[]} props.columns - columns to display, in order
 * @param {string} props.caption - accessible name of the table
 * @param {(row: object) => string | number} [props.getRowKey] - unique key of a row (default: `row.id`)
 * @param {import('./dataTableUtils.js').SortState | null} [props.initialSort=null] - sort applied at first render
 * @param {number[]} [props.pageSizeOptions=[10, 25, 50, 100]] - choices of entries per page
 */
export function DataTable({
  rows,
  columns,
  caption,
  getRowKey = (row) => row.id,
  initialSort = null,
  pageSizeOptions = [10, 25, 50, 100],
}) {
  const table = useDataTable({ rows, columns, initialSort, initialPageSize: pageSizeOptions[0] })
  const id = useId()
  const pageSizeId = `${id}-page-size`
  const searchId = `${id}-search`

  const emptyMessage = table.totalCount === 0 ? 'No data available in table' : 'No matching records found'

  return (
    <div className={styles.dataTable}>
      <div className={styles.toolbar}>
        <div className={styles.pageSize}>
          <span id={`${pageSizeId}-show`}>Show</span>
          <div className={styles.pageSizeSelect}>
            <Select
              id={pageSizeId}
              ariaLabelledBy={`${pageSizeId}-show ${pageSizeId}-entries`}
              options={pageSizeOptions.map((size) => ({ value: String(size), label: String(size) }))}
              value={String(table.pageSize)}
              onChange={(value) => table.setPageSize(Number(value))}
            />
          </div>
          <span id={`${pageSizeId}-entries`}>entries</span>
        </div>

        <div className={styles.search}>
          <label htmlFor={searchId}>Search:</label>
          <input
            id={searchId}
            type="search"
            className={styles.searchInput}
            value={table.search}
            onChange={(event) => table.setSearch(event.target.value)}
            autoComplete="off"
          />
        </div>
      </div>

      <div className={styles.scrollArea} role="region" aria-label={caption} tabIndex={0}>
        <table className={styles.table}>
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <SortableHeader key={column.key} column={column} sort={table.sort} onSort={table.toggleSort} />
              ))}
            </tr>
          </thead>
          <tbody>
            {table.pageRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.empty}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              table.pageRows.map((row) => <TableRow key={getRowKey(row)} row={row} columns={columns} />)
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.footer}>
        <p className={styles.info} aria-live="polite">
          Showing {table.firstIndex} to {table.lastIndex} of {table.filteredCount} entries
          {table.filteredCount !== table.totalCount && ` (filtered from ${table.totalCount} total entries)`}
        </p>
        <Pagination page={table.page} pageCount={table.pageCount} onPageChange={table.setPage} />
      </div>
    </div>
  )
}
