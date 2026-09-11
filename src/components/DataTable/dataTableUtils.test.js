import { describe, expect, it } from 'vitest'
import {
  filterRows,
  getCellText,
  getNextSort,
  getPageNumbers,
  paginateRows,
  sortRows,
} from './dataTableUtils.js'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'city', title: 'City' },
  { key: 'date', title: 'Date', format: (iso) => iso.split('-').reverse().join('/') },
]

const rows = [
  { id: 1, name: 'Zoé', city: 'Boston', date: '2024-03-01' },
  { id: 2, name: 'adam', city: 'Albany', date: '2023-12-25' },
  { id: 3, name: 'Bob', city: 'New York', date: '2024-01-10' },
]

describe('getCellText', () => {
  it('applies the column format', () => {
    expect(getCellText(rows[0], columns[2])).toBe('01/03/2024')
    expect(getCellText({}, columns[0])).toBe('')
  })
})

describe('filterRows', () => {
  it('returns every row for an empty search', () => {
    expect(filterRows(rows, columns, '  ')).toBe(rows)
  })

  it('searches in every column, ignoring case and accents', () => {
    expect(filterRows(rows, columns, 'zoe').map((row) => row.id)).toEqual([1])
    expect(filterRows(rows, columns, 'ALBANY').map((row) => row.id)).toEqual([2])
  })

  it('searches in the formatted text', () => {
    expect(filterRows(rows, columns, '25/12').map((row) => row.id)).toEqual([2])
  })

  it('requires every word to match', () => {
    expect(filterRows(rows, columns, 'bob york').map((row) => row.id)).toEqual([3])
    expect(filterRows(rows, columns, 'bob boston')).toEqual([])
  })
})

describe('sortRows', () => {
  it('sorts ascending and descending, case insensitive', () => {
    expect(sortRows(rows, { key: 'name', direction: 'asc' }).map((row) => row.name)).toEqual(['adam', 'Bob', 'Zoé'])
    expect(sortRows(rows, { key: 'name', direction: 'desc' }).map((row) => row.name)).toEqual(['Zoé', 'Bob', 'adam'])
  })

  it('sorts ISO dates chronologically', () => {
    expect(sortRows(rows, { key: 'date', direction: 'asc' }).map((row) => row.id)).toEqual([2, 3, 1])
  })

  it('compares numbers numerically', () => {
    const zips = [{ zip: '900' }, { zip: '10001' }, { zip: '2000' }]
    expect(sortRows(zips, { key: 'zip', direction: 'asc' }).map((row) => row.zip)).toEqual(['900', '2000', '10001'])
  })

  it('does not mutate the input and keeps the order without sort', () => {
    const copy = [...rows]
    sortRows(rows, { key: 'name', direction: 'asc' })
    expect(rows).toEqual(copy)
    expect(sortRows(rows, null)).toBe(rows)
  })
})

describe('paginateRows', () => {
  const numbers = Array.from({ length: 23 }, (_, index) => index + 1)

  it('returns the rows of the requested page', () => {
    expect(paginateRows(numbers, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(paginateRows(numbers, 3, 10)).toEqual([21, 22, 23])
  })
})

describe('getPageNumbers', () => {
  it('lists every page when there are few', () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('shortens long lists like DataTables', () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5, '…', 10])
    expect(getPageNumbers(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10])
    expect(getPageNumbers(9, 10)).toEqual([1, '…', 6, 7, 8, 9, 10])
  })
})

describe('getNextSort', () => {
  it('sorts a new column ascending, then toggles the direction', () => {
    expect(getNextSort(null, 'name')).toEqual({ key: 'name', direction: 'asc' })
    expect(getNextSort({ key: 'name', direction: 'asc' }, 'name')).toEqual({ key: 'name', direction: 'desc' })
    expect(getNextSort({ key: 'name', direction: 'desc' }, 'name')).toEqual({ key: 'name', direction: 'asc' })
    expect(getNextSort({ key: 'name', direction: 'desc' }, 'city')).toEqual({ key: 'city', direction: 'asc' })
  })
})
