import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { EMPTY_EMPLOYEE, normalizeEmployee, validateEmployee } from './validateEmployee.js'

const validEmployee = {
  firstName: 'Jean-Luc',
  lastName: "O'Brien",
  dateOfBirth: '1990-05-17',
  startDate: '2024-01-15',
  street: '1 Main Street',
  city: 'Albany',
  state: 'NY',
  zipCode: '12207',
  department: 'Engineering',
}

describe('validateEmployee', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 8, 11))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('accepts a valid employee', () => {
    expect(validateEmployee(validEmployee)).toEqual({})
  })

  it('requires every field', () => {
    expect(Object.keys(validateEmployee(EMPTY_EMPLOYEE)).sort()).toEqual(Object.keys(EMPTY_EMPLOYEE).sort())
  })

  it.each([
    ['A', 'at least 2 characters'],
    ['R2D2', 'can only contain letters'],
    ['   ', 'is required'],
  ])('rejects the name "%s"', (firstName, message) => {
    expect(validateEmployee({ ...validEmployee, firstName }).firstName).toContain(message)
  })

  it('accepts accented names', () => {
    expect(validateEmployee({ ...validEmployee, firstName: 'Zoé', lastName: 'Müller' })).toEqual({})
  })

  it('rejects a date of birth in the future', () => {
    expect(validateEmployee({ ...validEmployee, dateOfBirth: '2030-01-01' }).dateOfBirth).toBe(
      'Date of birth must be in the past.',
    )
  })

  it('rejects a start date before the date of birth', () => {
    expect(validateEmployee({ ...validEmployee, startDate: '1980-01-01' }).startDate).toBe(
      'Start date must be after the date of birth.',
    )
  })

  it.each(['1234', '123456', 'ABCDE'])('rejects the zip code "%s"', (zipCode) => {
    expect(validateEmployee({ ...validEmployee, zipCode }).zipCode).toBe('Zip code must contain 5 digits.')
  })
})

describe('normalizeEmployee', () => {
  it('trims every value', () => {
    expect(normalizeEmployee({ ...validEmployee, firstName: '  Ada ', city: 'Albany ' })).toMatchObject({
      firstName: 'Ada',
      city: 'Albany',
    })
  })
})
