import { formatDisplayDate } from '../../utils/date.js'

/**
 * Columns of the Current Employees table, in the order of the jQuery
 * application. Dates are stored as ISO strings and displayed as MM/DD/YYYY.
 *
 * @type {import('../../components/DataTable/dataTableUtils.js').Column[]}
 */
export const EMPLOYEE_COLUMNS = [
  { key: 'firstName', title: 'First Name' },
  { key: 'lastName', title: 'Last Name' },
  { key: 'startDate', title: 'Start Date', format: formatDisplayDate },
  { key: 'department', title: 'Department' },
  { key: 'dateOfBirth', title: 'Date of Birth', format: formatDisplayDate },
  { key: 'street', title: 'Street' },
  { key: 'city', title: 'City' },
  { key: 'state', title: 'State' },
  { key: 'zipCode', title: 'Zip Code' },
]
