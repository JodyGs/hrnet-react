import { describe, expect, it } from 'vitest'
import { setupStore } from '../../app/store.js'
import { employeeAdded, employeesReducer, selectEmployees } from './employeesSlice.js'

const employee = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  dateOfBirth: '1990-12-10',
  startDate: '2024-01-15',
  department: 'Engineering',
  street: '1 Main Street',
  city: 'Albany',
  state: 'NY',
  zipCode: '12207',
}

describe('employees slice', () => {
  it('starts with an empty list', () => {
    expect(employeesReducer(undefined, { type: 'unknown' })).toEqual({ list: [] })
  })

  it('adds an employee with a generated id', () => {
    const state = employeesReducer(undefined, employeeAdded(employee))

    expect(state.list).toHaveLength(1)
    expect(state.list[0]).toMatchObject(employee)
    expect(state.list[0].id).toEqual(expect.any(String))
  })

  it('gives every employee a different id', () => {
    const store = setupStore()
    store.dispatch(employeeAdded(employee))
    store.dispatch(employeeAdded(employee))

    const [first, second] = selectEmployees(store.getState())
    expect(first.id).not.toBe(second.id)
  })

  it('accepts a preloaded state', () => {
    const store = setupStore({ employees: { list: [{ ...employee, id: 'a' }] } })
    expect(selectEmployees(store.getState())).toHaveLength(1)
  })
})
