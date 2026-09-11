import { parseISODate, today } from '../../utils/date.js'

/** Values of an empty "Create Employee" form. */
export const EMPTY_EMPLOYEE = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  startDate: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  department: '',
}

const NAME_PATTERN = /^[\p{L}][\p{L}' -]*$/u
const ZIP_CODE_PATTERN = /^\d{5}$/

const validateName = (value, label) => {
  const name = value.trim()
  if (!name) return `${label} is required.`
  if (name.length < 2) return `${label} must contain at least 2 characters.`
  if (!NAME_PATTERN.test(name)) return `${label} can only contain letters, spaces, hyphens and apostrophes.`
  return undefined
}

const required = (value, message) => (value.trim() ? undefined : message)

/**
 * Checks the values of the "Create Employee" form.
 *
 * @param {typeof EMPTY_EMPLOYEE} employee - form values (dates as ISO strings)
 * @returns {Partial<Record<keyof typeof EMPTY_EMPLOYEE, string>>} error message by field; empty when valid
 */
export function validateEmployee(employee) {
  const errors = {
    firstName: validateName(employee.firstName, 'First name'),
    lastName: validateName(employee.lastName, 'Last name'),
    street: required(employee.street, 'Street is required.'),
    city: required(employee.city, 'City is required.'),
    state: required(employee.state, 'Select a state.'),
    department: required(employee.department, 'Select a department.'),
  }

  const birthDate = parseISODate(employee.dateOfBirth)
  const startDate = parseISODate(employee.startDate)

  if (!birthDate) errors.dateOfBirth = 'Date of birth is required (MM/DD/YYYY).'
  else if (birthDate >= today()) errors.dateOfBirth = 'Date of birth must be in the past.'

  if (!startDate) errors.startDate = 'Start date is required (MM/DD/YYYY).'
  else if (birthDate && startDate <= birthDate) errors.startDate = 'Start date must be after the date of birth.'

  if (!employee.zipCode.trim()) errors.zipCode = 'Zip code is required.'
  else if (!ZIP_CODE_PATTERN.test(employee.zipCode.trim())) errors.zipCode = 'Zip code must contain 5 digits.'

  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message))
}

/**
 * Cleans the form values before saving them (trimmed text).
 *
 * @param {typeof EMPTY_EMPLOYEE} employee
 * @returns {typeof EMPTY_EMPLOYEE}
 */
export function normalizeEmployee(employee) {
  return Object.fromEntries(Object.entries(employee).map(([key, value]) => [key, value.trim()]))
}
