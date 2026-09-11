import { useDispatch } from 'react-redux'
import { EmployeeForm } from '../../components/EmployeeForm/EmployeeForm.jsx'
import { employeeAdded } from '../../features/employees/employeesSlice.js'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'
import styles from './CreateEmployee.module.css'

/** "Create Employee" page (home). */
export function CreateEmployee() {
  useDocumentTitle('Create Employee')
  const dispatch = useDispatch()

  const handleSave = (employee) => {
    dispatch(employeeAdded(employee))
  }

  return (
    <section className={styles.page} aria-labelledby="create-employee-title">
      <h1 id="create-employee-title" className={styles.title}>
        Create Employee
      </h1>
      <EmployeeForm onSave={handleSave} />
    </section>
  )
}
