import { createSlice, nanoid } from '@reduxjs/toolkit'

/**
 * @typedef {object} Employee
 * @property {string} id - unique id generated when the employee is created
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} dateOfBirth - ISO date (YYYY-MM-DD)
 * @property {string} startDate - ISO date (YYYY-MM-DD)
 * @property {string} department
 * @property {string} street
 * @property {string} city
 * @property {string} state - two-letter abbreviation (e.g. "NY")
 * @property {string} zipCode
 */

/** @type {{ list: Employee[] }} */
const initialState = {
  list: [],
}

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    employeeAdded: {
      reducer(state, action) {
        state.list.push(action.payload)
      },
      /** Adds a unique id so that each employee can be used as a React key. */
      prepare(employee) {
        return { payload: { ...employee, id: nanoid() } }
      },
    },
  },
})

export const { employeeAdded } = employeesSlice.actions
export const employeesReducer = employeesSlice.reducer

/** @param {{ employees: { list: Employee[] } }} state */
export const selectEmployees = (state) => state.employees.list
