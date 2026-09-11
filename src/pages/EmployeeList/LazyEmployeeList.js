import { lazy } from 'react'

/** Employee list page, downloaded only when it is visited (separate bundle). */
export const LazyEmployeeList = lazy(() =>
  import('./EmployeeList.jsx').then((module) => ({ default: module.EmployeeList })),
)
