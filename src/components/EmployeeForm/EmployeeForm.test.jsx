import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fillEmployeeForm } from '../../test/fillEmployeeForm.js'
import { EmployeeForm } from './EmployeeForm.jsx'

describe('EmployeeForm', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 8, 11))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('saves a valid employee with ISO dates, then resets the form', async () => {
    const onSave = vi.fn()
    render(<EmployeeForm onSave={onSave} />)

    await fillEmployeeForm()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).toHaveBeenCalledWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1990-12-10',
      startDate: '2024-01-15',
      street: '1 Main Street',
      city: 'Albany',
      state: 'NY',
      zipCode: '12207',
      department: 'Engineering',
    })
    expect(screen.getByLabelText('First Name')).toHaveValue('')
    expect(screen.getByLabelText('Date of Birth')).toHaveValue('')
    expect(screen.getByRole('combobox', { name: 'State' })).toHaveTextContent('Select a state')
  })

  it('shows the errors and focuses the first invalid field', async () => {
    const onSave = vi.fn()
    render(<EmployeeForm onSave={onSave} />)

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByLabelText('First Name')).toHaveFocus()
    expect(screen.getByLabelText('First Name')).toHaveAccessibleDescription('First name is required.')
    expect(screen.getByRole('combobox', { name: 'State' })).toHaveAccessibleDescription('Select a state.')
    expect(screen.getByLabelText('Zip Code')).toHaveAttribute('aria-invalid', 'true')
  })

  it('updates the errors while the user fixes them', async () => {
    render(<EmployeeForm onSave={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getByText('First name is required.')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('First Name'), 'Ada')
    expect(screen.queryByText('First name is required.')).not.toBeInTheDocument()
    expect(screen.getByLabelText('First Name')).not.toHaveAttribute('aria-invalid')
  })
})
