import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DatePicker } from './DatePicker.jsx'

function ControlledDatePicker({ initialValue = '', ...props }) {
  const [value, setValue] = useState(initialValue)
  return (
    <>
      <label htmlFor="date">Start Date</label>
      <DatePicker id="date" value={value} onChange={setValue} {...props} />
      <output data-testid="value">{value}</output>
      <button type="button">Outside</button>
    </>
  )
}

const getInput = () => screen.getByRole('textbox', { name: 'Start Date' })
const getValue = () => screen.getByTestId('value').textContent
const openCalendar = () => userEvent.click(screen.getByRole('button', { name: 'Choose date' }))
const getDialog = () => screen.getByRole('dialog', { name: 'Choose a date' })

describe('DatePicker', () => {
  beforeEach(() => {
    // Only fake the date: "today" is Friday September 11, 2026.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 8, 11, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('typing', () => {
    it('saves a typed date as an ISO string when leaving the field', async () => {
      render(<ControlledDatePicker />)
      await userEvent.type(getInput(), '1/5/1990')
      await userEvent.tab()

      expect(getValue()).toBe('1990-01-05')
      expect(getInput()).toHaveValue('01/05/1990')
    })

    it('saves the typed date with Enter', async () => {
      render(<ControlledDatePicker />)
      await userEvent.type(getInput(), '12/31/2025{Enter}')
      expect(getValue()).toBe('2025-12-31')
    })

    it('reverts an invalid date to the previous value', async () => {
      render(<ControlledDatePicker initialValue="2024-01-15" />)
      await userEvent.clear(getInput())
      await userEvent.type(getInput(), '02/30/2024')
      await userEvent.tab()

      expect(getValue()).toBe('2024-01-15')
      expect(getInput()).toHaveValue('01/15/2024')
    })

    it('clears the value when the field is emptied', async () => {
      render(<ControlledDatePicker initialValue="2024-01-15" />)
      await userEvent.clear(getInput())
      await userEvent.tab()
      expect(getValue()).toBe('')
    })
  })

  describe('calendar', () => {
    it('opens on the month of the selected date and marks it', async () => {
      render(<ControlledDatePicker initialValue="2024-02-29" />)
      await openCalendar()

      const dialog = getDialog()
      expect(within(dialog).getByRole('combobox', { name: 'Month' })).toHaveValue('1')
      expect(within(dialog).getByRole('combobox', { name: 'Year' })).toHaveValue('2024')
      const selectedDay = within(dialog).getByRole('button', { name: 'Thursday, February 29, 2024' })
      expect(selectedDay.closest('td')).toHaveAttribute('aria-selected', 'true')
      expect(selectedDay).toHaveFocus()
    })

    it('opens on today when there is no value and highlights it', async () => {
      render(<ControlledDatePicker />)
      await openCalendar()

      const todayButton = within(getDialog()).getByRole('button', { name: 'Friday, September 11, 2026' })
      expect(todayButton).toHaveAttribute('aria-current', 'date')
      expect(todayButton).toHaveFocus()
    })

    it('selects a day with the mouse, closes and gives the focus back to the field', async () => {
      render(<ControlledDatePicker />)
      await openCalendar()
      await userEvent.click(screen.getByRole('button', { name: 'Tuesday, September 15, 2026' }))

      expect(getValue()).toBe('2026-09-15')
      expect(getInput()).toHaveValue('09/15/2026')
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(getInput()).toHaveFocus()
    })

    it('navigates with the keyboard and selects with Enter', async () => {
      render(<ControlledDatePicker />)
      getInput().focus()
      await userEvent.keyboard('{ArrowDown}') // opens and focuses today (Sep 11)
      await userEvent.keyboard('{ArrowRight}{ArrowDown}') // Sep 12, then Sep 19
      expect(screen.getByRole('button', { name: 'Saturday, September 19, 2026' })).toHaveFocus()

      await userEvent.keyboard('{PageDown}') // Oct 19
      expect(screen.getByRole('button', { name: 'Monday, October 19, 2026' })).toHaveFocus()

      await userEvent.keyboard('{Home}') // Sunday of that week
      await userEvent.keyboard('{Enter}')
      expect(getValue()).toBe('2026-10-18')
    })

    it('changes month with the arrows and the month / year selects', async () => {
      render(<ControlledDatePicker initialValue="2026-09-11" />)
      await openCalendar()
      const dialog = getDialog()

      await userEvent.click(within(dialog).getByRole('button', { name: 'Next month' }))
      expect(within(dialog).getByRole('combobox', { name: 'Month' })).toHaveValue('9')

      await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Year' }), '1990')
      await userEvent.selectOptions(within(dialog).getByRole('combobox', { name: 'Month' }), 'March')
      await userEvent.click(within(dialog).getByRole('button', { name: 'Sunday, March 11, 1990' }))

      expect(getValue()).toBe('1990-03-11')
    })

    it('goes back to the current month with the Today button', async () => {
      render(<ControlledDatePicker initialValue="1990-03-11" />)
      await openCalendar()
      await userEvent.click(screen.getByRole('button', { name: 'Today' }))
      expect(screen.getByRole('button', { name: 'Friday, September 11, 2026' })).toHaveFocus()
    })

    it('closes with Escape without changing the value', async () => {
      render(<ControlledDatePicker initialValue="2024-01-15" />)
      await openCalendar()
      await userEvent.keyboard('{ArrowRight}{Escape}')

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(getValue()).toBe('2024-01-15')
      expect(getInput()).toHaveFocus()
    })

    it('closes when clicking outside', async () => {
      render(<ControlledDatePicker />)
      await openCalendar()
      await userEvent.click(screen.getByRole('button', { name: 'Outside' }))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('limits the years to the given range', async () => {
      render(<ControlledDatePicker minYear={2020} maxYear={2030} />)
      await openCalendar()
      const years = within(screen.getByRole('combobox', { name: 'Year' })).getAllByRole('option')
      expect(years.map((option) => option.textContent)).toEqual(
        Array.from({ length: 11 }, (_, index) => String(2020 + index)),
      )
    })
  })

  it('flags an invalid value', () => {
    render(<DatePicker id="d" value="" onChange={() => {}} invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })
})
