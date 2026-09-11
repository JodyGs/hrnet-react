import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { DEPARTMENT_OPTIONS } from '../../data/departments.js'
import { STATE_OPTIONS } from '../../data/states.js'
import { Select } from './Select.jsx'
import { findOptionByText } from './useTypeahead.js'

function ControlledSelect({ options = DEPARTMENT_OPTIONS, initialValue = '' }) {
  const [value, setValue] = useState(initialValue)
  return (
    <>
      <label id="field-label" htmlFor="field">
        Department
      </label>
      <Select id="field" labelId="field-label" options={options} value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
    </>
  )
}

const getCombobox = () => screen.getByRole('combobox', { name: 'Department' })
const getValue = () => screen.getByTestId('value').textContent

describe('Select', () => {
  it('shows the placeholder, then the selected option', async () => {
    render(<ControlledSelect />)
    expect(getCombobox()).toHaveTextContent('Select…')

    await userEvent.click(getCombobox())
    await userEvent.click(screen.getByRole('option', { name: 'Engineering' }))

    expect(getCombobox()).toHaveTextContent('Engineering')
    expect(getValue()).toBe('Engineering')
  })

  it('opens and closes the listbox', async () => {
    render(<ControlledSelect />)
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await userEvent.click(getCombobox())
    expect(getCombobox()).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox', { name: 'Department' })).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(DEPARTMENT_OPTIONS.length)

    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(getCombobox()).toHaveFocus()
  })

  it('opens when its label is clicked', async () => {
    render(<ControlledSelect />)
    await userEvent.click(screen.getByText('Department'))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('marks the selected option', async () => {
    render(<ControlledSelect initialValue="Legal" />)
    await userEvent.click(getCombobox())
    expect(screen.getByRole('option', { name: 'Legal' })).toHaveAttribute('aria-selected', 'true')
  })

  it('can be used with the keyboard only', async () => {
    render(<ControlledSelect />)
    await userEvent.tab()
    expect(getCombobox()).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}') // opens on "Sales"
    expect(getCombobox()).toHaveAttribute('aria-activedescendant', 'field-option-0')
    await userEvent.keyboard('{ArrowDown}{ArrowDown}') // "Engineering"
    expect(getCombobox()).toHaveAttribute('aria-activedescendant', 'field-option-2')
    await userEvent.keyboard('{Enter}')

    expect(getValue()).toBe('Engineering')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('jumps to the first and last options with Home and End', async () => {
    render(<ControlledSelect />)
    await userEvent.click(getCombobox())

    await userEvent.keyboard('{End}')
    expect(getCombobox()).toHaveAttribute('aria-activedescendant', 'field-option-4')
    await userEvent.keyboard('{Home}')
    expect(getCombobox()).toHaveAttribute('aria-activedescendant', 'field-option-0')
  })

  it('does not go past the ends of the list', async () => {
    render(<ControlledSelect />)
    await userEvent.click(getCombobox())
    await userEvent.keyboard('{ArrowUp}')
    expect(getCombobox()).toHaveAttribute('aria-activedescendant', 'field-option-0')
  })

  it('selects an option by typing its first letters', async () => {
    render(<ControlledSelect options={STATE_OPTIONS} />)
    getCombobox().focus()

    await userEvent.keyboard('new y')
    expect(getValue()).toBe('NY')
  })

  it('closes without changing the value when it loses the focus', async () => {
    render(
      <>
        <ControlledSelect initialValue="Sales" />
        <button type="button">Next</button>
      </>,
    )
    await userEvent.click(getCombobox())
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(getValue()).toBe('Sales')
  })

  it('flags an invalid value', () => {
    render(<Select id="s" options={DEPARTMENT_OPTIONS} value="" onChange={() => {}} invalid />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })
})

describe('findOptionByText', () => {
  const options = [{ label: 'Nebraska' }, { label: 'Nevada' }, { label: 'New York' }, { label: 'Ohio' }]

  it('finds the first option starting with the text', () => {
    expect(findOptionByText(options, 'nev')).toBe(1)
  })

  it('wraps around the end of the list', () => {
    expect(findOptionByText(options, 'ne', 3)).toBe(0)
  })

  it('returns -1 without match', () => {
    expect(findOptionByText(options, 'texas')).toBe(-1)
  })
})
