import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable.jsx'

const columns = [
  { key: 'name', title: 'Name' },
  { key: 'city', title: 'City' },
]

const CITIES = ['Albany', 'Boston', 'Chicago']

/** 30 rows: "Employee 01" … "Employee 30", cities in rotation. */
const rows = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  name: `Employee ${String(index + 1).padStart(2, '0')}`,
  city: CITIES[index % 3],
}))

const renderTable = (props = {}) =>
  render(<DataTable rows={rows} columns={columns} caption="Employees" {...props} />)

/** Text of the first cell of each body row. */
const getNames = () =>
  within(screen.getByRole('table'))
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getAllByRole('cell')[0].textContent)

const getInfo = () => screen.getByText(/^Showing/).textContent

describe('DataTable', () => {
  it('displays the first page of 10 entries with the information line', () => {
    renderTable()
    expect(screen.getByRole('table', { name: 'Employees' })).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Name', 'City'])
    expect(getNames()).toHaveLength(10)
    expect(getNames()[0]).toBe('Employee 01')
    expect(getInfo()).toBe('Showing 1 to 10 of 30 entries')
  })

  it('changes the number of entries per page', async () => {
    renderTable()
    await userEvent.click(screen.getByRole('combobox', { name: 'Show entries' }))
    await userEvent.click(screen.getByRole('option', { name: '25' }))

    expect(getNames()).toHaveLength(25)
    expect(getInfo()).toBe('Showing 1 to 25 of 30 entries')
  })

  it('goes through the pages', async () => {
    renderTable()
    const previous = screen.getByRole('button', { name: 'Previous' })
    const next = screen.getByRole('button', { name: 'Next' })
    expect(previous).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')

    await userEvent.click(next)
    expect(getNames()[0]).toBe('Employee 11')

    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(getInfo()).toBe('Showing 21 to 30 of 30 entries')
    expect(next).toBeDisabled()
  })

  it('filters the rows with the search box and goes back to page 1', async () => {
    renderTable()
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search:' }), 'boston')

    expect(getNames()).toEqual(['Employee 02', 'Employee 05', 'Employee 08', 'Employee 11', 'Employee 14', 'Employee 17', 'Employee 20', 'Employee 23', 'Employee 26', 'Employee 29'])
    expect(getInfo()).toBe('Showing 1 to 10 of 10 entries (filtered from 30 total entries)')
  })

  it('shows a message when nothing matches the search', async () => {
    renderTable()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search:' }), 'nobody')

    expect(screen.getByText('No matching records found')).toBeInTheDocument()
    expect(getInfo()).toBe('Showing 0 to 0 of 0 entries (filtered from 30 total entries)')
  })

  it('shows a message when there is no data', () => {
    renderTable({ rows: [] })
    expect(screen.getByText('No data available in table')).toBeInTheDocument()
    expect(getInfo()).toBe('Showing 0 to 0 of 0 entries')
  })

  it('sorts by column, ascending then descending', async () => {
    renderTable()
    const nameHeader = screen.getByRole('columnheader', { name: 'Name' })
    expect(nameHeader).not.toHaveAttribute('aria-sort')

    await userEvent.click(within(nameHeader).getByRole('button'))
    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(getNames()[0]).toBe('Employee 01')

    await userEvent.click(within(nameHeader).getByRole('button'))
    expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    expect(getNames()[0]).toBe('Employee 30')
  })

  it('applies the initial sort', () => {
    renderTable({ initialSort: { key: 'city', direction: 'desc' } })
    expect(screen.getByRole('columnheader', { name: 'City' })).toHaveAttribute('aria-sort', 'descending')
    expect(within(screen.getAllByRole('row')[1]).getAllByRole('cell')[1]).toHaveTextContent('Chicago')
  })

  it('displays new rows when the data changes', () => {
    const { rerender } = renderTable({ rows: rows.slice(0, 2) })
    expect(getInfo()).toBe('Showing 1 to 2 of 2 entries')

    rerender(<DataTable rows={rows.slice(0, 3)} columns={columns} caption="Employees" />)
    expect(getNames()).toEqual(['Employee 01', 'Employee 02', 'Employee 03'])
  })
})
