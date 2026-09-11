import { useSelector } from 'react-redux'
import { Link } from 'react-router'
import { DataTable } from '../../components/DataTable/DataTable.jsx'
import { EMPLOYEE_COLUMNS } from '../../features/employees/employeeColumns.js'
import { selectEmployees } from '../../features/employees/employeesSlice.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import styles from './EmployeeList.module.css'

/** "Current Employees" page. */
export function EmployeeList() {
  useDocumentTitle('Current Employees')
  const employees = useSelector(selectEmployees)

  return (
    <section aria-labelledby="employee-list-title">
      <div className={styles.header}>
        <h1 id="employee-list-title" className={styles.title}>
          Current Employees
        </h1>
        <Link to="/" className={styles.addLink}>
          + Create employee
        </Link>
      </div>
      <DataTable
        rows={employees}
        columns={EMPLOYEE_COLUMNS}
        caption="Current employees"
        initialSort={{ key: 'firstName', direction: 'asc' }}
      />
    </section>
  )
}
