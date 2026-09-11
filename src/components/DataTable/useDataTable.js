import { useDeferredValue, useMemo, useState } from 'react'
import { filterRows, getNextSort, paginateRows, sortRows } from './dataTableUtils.js'

/**
 * State and derived data of the DataTable: search, sort, page size and page.
 *
 * Every step (filter → sort → paginate) is memoized, so adding one employee
 * or changing page does not recompute more than needed. The search uses a
 * deferred value to keep typing responsive with a large number of rows.
 *
 * @param {object} options
 * @param {object[]} options.rows - every row of the table
 * @param {import('./dataTableUtils.js').Column[]} options.columns
 * @param {import('./dataTableUtils.js').SortState | null} [options.initialSort=null]
 * @param {number} [options.initialPageSize=10]
 */
export function useDataTable({ rows, columns, initialSort = null, initialPageSize = 10 }) {
  const [search, setSearchValue] = useState('')
  const [sort, setSort] = useState(initialSort)
  const [pageSize, setPageSizeValue] = useState(initialPageSize)
  const [requestedPage, setRequestedPage] = useState(1)
  const deferredSearch = useDeferredValue(search)

  const filteredRows = useMemo(() => filterRows(rows, columns, deferredSearch), [rows, columns, deferredSearch])
  const sortedRows = useMemo(() => sortRows(filteredRows, sort), [filteredRows, sort])

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize))
  // The page can become out of range when rows are filtered out.
  const page = Math.min(requestedPage, pageCount)
  const pageRows = useMemo(() => paginateRows(sortedRows, page, pageSize), [sortedRows, page, pageSize])

  const filteredCount = sortedRows.length

  return {
    search,
    setSearch: (value) => {
      setSearchValue(value)
      setRequestedPage(1)
    },
    sort,
    toggleSort: (key) => {
      setSort((current) => getNextSort(current, key))
      setRequestedPage(1)
    },
    pageSize,
    setPageSize: (size) => {
      setPageSizeValue(size)
      setRequestedPage(1)
    },
    page,
    pageCount,
    setPage: setRequestedPage,
    pageRows,
    totalCount: rows.length,
    filteredCount,
    firstIndex: filteredCount === 0 ? 0 : (page - 1) * pageSize + 1,
    lastIndex: Math.min(page * pageSize, filteredCount),
  }
}
