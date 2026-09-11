import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/** Fills every field of the "Create Employee" form like a user would. */
export async function fillEmployeeForm() {
  await userEvent.type(screen.getByLabelText('First Name'), 'Ada')
  await userEvent.type(screen.getByLabelText('Last Name'), 'Lovelace')
  await userEvent.type(screen.getByLabelText('Date of Birth'), '12/10/1990')
  await userEvent.type(screen.getByLabelText('Start Date'), '01/15/2024')
  await userEvent.type(screen.getByLabelText('Street'), '1 Main Street')
  await userEvent.type(screen.getByLabelText('City'), 'Albany')
  await userEvent.click(screen.getByRole('combobox', { name: 'State' }))
  await userEvent.click(screen.getByRole('option', { name: 'New York' }))
  await userEvent.type(screen.getByLabelText('Zip Code'), '12207')
  await userEvent.click(screen.getByRole('combobox', { name: 'Department' }))
  await userEvent.click(screen.getByRole('option', { name: 'Engineering' }))
}
