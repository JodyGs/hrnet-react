import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { employeesReducer } from '../features/employees/employeesSlice.js'
import { loadState, saveState } from './persistence.js'

const rootReducer = combineReducers({
  employees: employeesReducer,
})

/**
 * Creates a Redux store. Exported as a function so that tests can build an
 * isolated store with their own preloaded state.
 *
 * @param {object} [preloadedState]
 */
export function setupStore(preloadedState) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

export const store = setupStore(loadState())

// Save the employees each time they change.
let previousEmployees = store.getState().employees
store.subscribe(() => {
  const { employees } = store.getState()
  if (employees !== previousEmployees) {
    previousEmployees = employees
    saveState({ employees })
  }
})
