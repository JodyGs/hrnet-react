import { useRef, useState } from 'react'
import { DEPARTMENT_OPTIONS } from '../../data/departments.js'
import { STATE_OPTIONS } from '../../data/states.js'
import {
  EMPTY_EMPLOYEE,
  normalizeEmployee,
  validateEmployee,
} from '../../features/employees/validateEmployee.js'
import { today } from '../../utils/date.js'
import { DatePicker } from '../DatePicker/DatePicker.jsx'
import { FormField } from '../FormField/FormField.jsx'
import { Select } from '../Select/Select.jsx'
import styles from './EmployeeForm.module.css'

const CURRENT_YEAR = today().getFullYear()

/** DOM id of each field (same ids as the jQuery application), in display order. */
const FIELD_IDS = {
  firstName: 'first-name',
  lastName: 'last-name',
  dateOfBirth: 'date-of-birth',
  startDate: 'start-date',
  street: 'street',
  city: 'city',
  state: 'state',
  zipCode: 'zip-code',
  department: 'department',
}

/**
 * "Create Employee" form. Validates the values and hands a clean employee to
 * `onSave`, then resets itself.
 *
 * @param {object} props
 * @param {(employee: typeof EMPTY_EMPLOYEE) => void} props.onSave - called with the valid employee
 */
export function EmployeeForm({ onSave }) {
  const [values, setValues] = useState(EMPTY_EMPLOYEE)
  const [errors, setErrors] = useState({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const formRef = useRef(null)

  const setField = (name, value) => {
    const nextValues = { ...values, [name]: value }
    setValues(nextValues)
    // After a first submit, errors are updated while the user fixes them.
    if (hasSubmitted) setErrors(validateEmployee(nextValues))
  }

  /** Props of a native text input bound to a field of the form. */
  const bindInput = (name) => ({
    value: values[name],
    onChange: (event) => setField(name, event.target.value),
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationErrors = validateEmployee(values)
    setErrors(validationErrors)
    setHasSubmitted(true)

    const firstInvalidField = Object.keys(FIELD_IDS).find((name) => validationErrors[name])
    if (firstInvalidField) {
      formRef.current.querySelector(`#${FIELD_IDS[firstInvalidField]}`)?.focus()
      return
    }

    onSave(normalizeEmployee(values))
    setValues(EMPTY_EMPLOYEE)
    setErrors({})
    setHasSubmitted(false)
  }

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit} noValidate>
      <fieldset className={styles.section}>
        <legend className={styles.legend}>Employee</legend>
        <div className={styles.grid}>
          <FormField id={FIELD_IDS.firstName} label="First Name" error={errors.firstName}>
            {({ inputProps }) => (
              <input {...inputProps} type="text" autoComplete="given-name" {...bindInput('firstName')} />
            )}
          </FormField>

          <FormField id={FIELD_IDS.lastName} label="Last Name" error={errors.lastName}>
            {({ inputProps }) => (
              <input {...inputProps} type="text" autoComplete="family-name" {...bindInput('lastName')} />
            )}
          </FormField>

          <FormField id={FIELD_IDS.dateOfBirth} label="Date of Birth" error={errors.dateOfBirth}>
            {({ id, invalid, describedBy }) => (
              <DatePicker
                id={id}
                value={values.dateOfBirth}
                onChange={(iso) => setField('dateOfBirth', iso)}
                maxYear={CURRENT_YEAR}
                invalid={invalid}
                describedBy={describedBy}
              />
            )}
          </FormField>

          <FormField id={FIELD_IDS.startDate} label="Start Date" error={errors.startDate}>
            {({ id, invalid, describedBy }) => (
              <DatePicker
                id={id}
                value={values.startDate}
                onChange={(iso) => setField('startDate', iso)}
                invalid={invalid}
                describedBy={describedBy}
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend className={styles.legend}>Address</legend>
        <div className={styles.grid}>
          <div className={styles.fullWidth}>
            <FormField id={FIELD_IDS.street} label="Street" error={errors.street}>
              {({ inputProps }) => (
                <input {...inputProps} type="text" autoComplete="street-address" {...bindInput('street')} />
              )}
            </FormField>
          </div>

          <FormField id={FIELD_IDS.city} label="City" error={errors.city}>
            {({ inputProps }) => (
              <input {...inputProps} type="text" autoComplete="address-level2" {...bindInput('city')} />
            )}
          </FormField>

          <FormField id={FIELD_IDS.state} label="State" error={errors.state}>
            {({ id, labelId, invalid, describedBy }) => (
              <Select
                id={id}
                labelId={labelId}
                options={STATE_OPTIONS}
                value={values.state}
                onChange={(value) => setField('state', value)}
                placeholder="Select a state"
                invalid={invalid}
                describedBy={describedBy}
              />
            )}
          </FormField>

          <FormField id={FIELD_IDS.zipCode} label="Zip Code" error={errors.zipCode}>
            {({ inputProps }) => (
              <input
                {...inputProps}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                {...bindInput('zipCode')}
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <div className={styles.section}>
        <FormField id={FIELD_IDS.department} label="Department" error={errors.department}>
          {({ id, labelId, invalid, describedBy }) => (
            <Select
              id={id}
              labelId={labelId}
              options={DEPARTMENT_OPTIONS}
              value={values.department}
              onChange={(value) => setField('department', value)}
              placeholder="Select a department"
              invalid={invalid}
              describedBy={describedBy}
            />
          )}
        </FormField>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.submit}>
          Save
        </button>
      </div>
    </form>
  )
}
