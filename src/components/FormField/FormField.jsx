import styles from './FormField.module.css'

/**
 * Label + control + error message, wired together for accessibility.
 *
 * The control is given as a render function receiving the props to spread on
 * it, so that any kind of control (input, Select, DatePicker) can be used.
 *
 * @example
 * <FormField id="city" label="City" error={errors.city}>
 *   {(field) => <input {...field.inputProps} value={city} onChange={…} />}
 * </FormField>
 *
 * @param {object} props
 * @param {string} props.id - id of the control
 * @param {string} props.label - visible label
 * @param {string} [props.error] - error message; marks the control as invalid when present
 * @param {(field: {
 *   id: string,
 *   labelId: string,
 *   invalid: boolean,
 *   describedBy: string | undefined,
 *   inputProps: object,
 * }) => import('react').ReactNode} props.children - renders the control
 */
export function FormField({ id, label, error, children }) {
  const labelId = `${id}-label`
  const errorId = `${id}-error`
  const invalid = Boolean(error)
  const describedBy = invalid ? errorId : undefined

  return (
    <div className={styles.field}>
      <label id={labelId} htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children({
        id,
        labelId,
        invalid,
        describedBy,
        // Ready-made props for a native <input>
        inputProps: {
          id,
          className: `${styles.input} ${invalid ? styles.invalid : ''}`,
          'aria-invalid': invalid || undefined,
          'aria-describedby': describedBy,
        },
      })}
      {invalid && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
