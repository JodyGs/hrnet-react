/** Departments of the company, as listed in the original HRnet application. */
export const DEPARTMENTS = ['Sales', 'Marketing', 'Engineering', 'Human Resources', 'Legal']

/** Options for the Department select. */
export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((department) => ({
  value: department,
  label: department,
}))
