/**
 * Pure functions used by the DataTable: filtering, sorting, pagination.
 * They never mutate their inputs.
 *
 * @typedef {object} Column
 * @property {string} key - property of the row displayed in the column
 * @property {string} title - header text
 * @property {(value: any) => string} [format] - converts the raw value into the displayed text
 *
 * @typedef {{ key: string, direction: 'asc' | 'desc' }} SortState
 */

/** Text displayed in a cell. */
export const getCellText = (row, column) => {
  const value = row[column.key] ?? ''
  return column.format ? column.format(value) : String(value)
}

/**
 * Keeps the rows where at least one cell contains every word of the search
 * (case and accent insensitive), like the DataTables search box.
 *
 * @param {object[]} rows
 * @param {Column[]} columns
 * @param {string} search
 * @returns {object[]}
 */
export function filterRows(rows, columns, search) {
  const words = normalize(search).split(/\s+/).filter(Boolean)
  if (words.length === 0) return rows

  return rows.filter((row) => {
    const rowText = columns.map((column) => normalize(getCellText(row, column))).join(' ')
    return words.every((word) => rowText.includes(word))
  })
}

const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' })

/**
 * Sorts the rows on the raw value of a column (ISO dates sort correctly as text,
 * numbers inside strings are compared as numbers).
 *
 * @param {object[]} rows
 * @param {SortState | null} sort
 * @returns {object[]}
 */
export function sortRows(rows, sort) {
  if (!sort) return rows
  const direction = sort.direction === 'desc' ? -1 : 1
  return [...rows].sort(
    (a, b) => direction * collator.compare(String(a[sort.key] ?? ''), String(b[sort.key] ?? '')),
  )
}

/**
 * @param {object[]} rows
 * @param {number} page - 1-based page number
 * @param {number} pageSize
 * @returns {object[]} rows of the page
 */
export function paginateRows(rows, page, pageSize) {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

/**
 * Page numbers to display, with '…' for the hidden ranges (like DataTables):
 * 1 … 4 5 6 … 10
 *
 * @param {number} currentPage
 * @param {number} pageCount
 * @returns {(number | '…')[]}
 */
export function getPageNumbers(currentPage, pageCount) {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
  if (currentPage <= 4) return [1, 2, 3, 4, 5, '…', pageCount]
  if (currentPage >= pageCount - 3) {
    return [1, '…', pageCount - 4, pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  }
  return [1, '…', currentPage - 1, currentPage, currentPage + 1, '…', pageCount]
}

/** Next sort state when a column header is clicked: ascending first, then toggle. */
export function getNextSort(sort, key) {
  if (sort?.key !== key) return { key, direction: 'asc' }
  return { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
}
