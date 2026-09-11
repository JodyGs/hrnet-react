import { useId, useRef, useState } from 'react'
import { useClickOutside } from '../../hooks/useClickOutside.js'
import { formatDisplayDate, parseDisplayDate, today } from '../../utils/date.js'
import { Calendar } from './Calendar.jsx'
import styles from './DatePicker.module.css'

const CURRENT_YEAR = today().getFullYear()

/**
 * Date picker — React replacement for the jQuery plugin `xdan/datetimepicker`
 * (used with `timepicker: false` and `format: 'm/d/Y'` in HRnet).
 *
 * The date can be typed in the text field (MM/DD/YYYY) or chosen in a calendar
 * opened with the calendar button, a click on the field or ↓ in the field.
 *
 * @param {object} props
 * @param {string} props.id - id of the text field, to link it with a `<label htmlFor>`
 * @param {string} props.value - selected date as an ISO string ("YYYY-MM-DD"), '' when empty
 * @param {(iso: string) => void} props.onChange - called with the new ISO date ('' when cleared)
 * @param {number} [props.minYear] - first year of the calendar (default: 100 years ago)
 * @param {number} [props.maxYear] - last year of the calendar (default: in 10 years)
 * @param {string} [props.placeholder='MM/DD/YYYY'] - placeholder of the text field
 * @param {boolean} [props.invalid=false] - marks the field as invalid (aria-invalid + style)
 * @param {string} [props.describedBy] - id of an element describing the field (e.g. error message)
 */
export function DatePicker({
  id,
  value,
  onChange,
  minYear = CURRENT_YEAR - 100,
  maxYear = CURRENT_YEAR + 10,
  placeholder = 'MM/DD/YYYY',
  invalid = false,
  describedBy,
}) {
  const [text, setText] = useState(() => formatDisplayDate(value))
  const [syncedValue, setSyncedValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const [focusCalendar, setFocusCalendar] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const dialogId = useId()

  // The value changed from the outside (calendar, form reset): update the text.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(formatDisplayDate(value))
  }

  useClickOutside(containerRef, () => setIsOpen(false), isOpen)

  const openCalendar = ({ moveFocus }) => {
    setFocusCalendar(moveFocus)
    setIsOpen(true)
  }

  const closeCalendar = () => {
    setIsOpen(false)
    inputRef.current?.focus()
  }

  /** Validates the typed text: a valid date is saved, anything else is reverted. */
  const commitText = () => {
    if (text.trim() === '') {
      if (value) onChange('')
      return
    }
    const iso = parseDisplayDate(text)
    if (iso && iso !== value) onChange(iso)
    setText(formatDisplayDate(iso ?? value))
  }

  const handleInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openCalendar({ moveFocus: true })
    } else if (event.key === 'Enter') {
      event.preventDefault()
      commitText()
      setIsOpen(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault()
      closeCalendar()
    }
  }

  // Keyboard users leaving the component with Tab close the calendar.
  // (Mouse clicks outside are handled by useClickOutside.)
  const handleBlur = (event) => {
    if (event.relatedTarget && !containerRef.current.contains(event.relatedTarget)) setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={styles.datePicker} onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <div className={`${styles.field} ${invalid ? styles.invalid : ''}`}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          placeholder={placeholder}
          className={styles.input}
          value={text}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          onChange={(event) => setText(event.target.value)}
          onBlur={commitText}
          onClick={() => openCalendar({ moveFocus: false })}
          onKeyDown={handleInputKeyDown}
        />
        <button
          type="button"
          className={styles.toggle}
          aria-label="Choose date"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? dialogId : undefined}
          onClick={() => (isOpen ? closeCalendar() : openCalendar({ moveFocus: true }))}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
            <path
              fill="currentColor"
              d="M7 2h2v2h6V2h2v2h3a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3V2Zm12 8H5v9h14v-9ZM5 8h14V6H5v2Zm2 4h2v2H7v-2Zm4 0h2v2h-2v-2Zm4 0h2v2h-2v-2Z"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div id={dialogId} role="dialog" aria-modal="false" aria-label="Choose a date" className={styles.popover}>
          <Calendar
            value={value}
            minYear={minYear}
            maxYear={maxYear}
            autoFocus={focusCalendar}
            onSelect={(iso) => {
              onChange(iso)
              closeCalendar()
            }}
          />
        </div>
      )}
    </div>
  )
}
