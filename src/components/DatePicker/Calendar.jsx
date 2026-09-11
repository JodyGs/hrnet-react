import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  MONTH_NAMES,
  WEEKDAYS,
  addDays,
  addMonths,
  getCalendarDays,
  isSameDay,
  parseISODate,
  toISODate,
  today,
} from '../../utils/date.js'
import styles from './DatePicker.module.css'

const LONG_DATE = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/** Keyboard shortcuts of the grid, as described by the WAI-ARIA date picker pattern. */
const KEY_MOVES = {
  ArrowLeft: (date) => addDays(date, -1),
  ArrowRight: (date) => addDays(date, 1),
  ArrowUp: (date) => addDays(date, -7),
  ArrowDown: (date) => addDays(date, 7),
  Home: (date) => addDays(date, -date.getDay()),
  End: (date) => addDays(date, 6 - date.getDay()),
  PageUp: (date, shiftKey) => addMonths(date, shiftKey ? -12 : -1),
  PageDown: (date, shiftKey) => addMonths(date, shiftKey ? 12 : 1),
}

const clampDate = (date, minYear, maxYear) => {
  if (date.getFullYear() < minYear) return new Date(minYear, 0, 1)
  if (date.getFullYear() > maxYear) return new Date(maxYear, 11, 31)
  return date
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, index) => from + index)

/** Splits the 42 days of the grid into 6 weeks. */
const toWeeks = (days) => range(0, 5).map((week) => days.slice(week * 7, week * 7 + 7))

/**
 * Month view of the date picker: month / year navigation and a grid of days.
 *
 * @param {object} props
 * @param {string} props.value - selected date (ISO) or ''
 * @param {(iso: string) => void} props.onSelect - called with the chosen date (ISO)
 * @param {number} props.minYear - first year available
 * @param {number} props.maxYear - last year available
 * @param {boolean} [props.autoFocus=false] - move the focus to the grid when displayed
 */
export function Calendar({ value, onSelect, minYear, maxYear, autoFocus = false }) {
  const selectedDate = parseISODate(value)
  const [focusedDate, setFocusedDate] = useState(() =>
    clampDate(selectedDate ?? today(), minYear, maxYear),
  )
  // Only move the DOM focus to the day when the user is navigating in the grid
  // (not when using the month / year controls).
  const shouldFocusDay = useRef(autoFocus)
  const gridRef = useRef(null)
  const captionId = useId()

  const year = focusedDate.getFullYear()
  const month = focusedDate.getMonth()
  const weeks = useMemo(() => toWeeks(getCalendarDays(year, month)), [year, month])
  const currentDay = today()

  useEffect(() => {
    if (shouldFocusDay.current) gridRef.current?.querySelector('button[tabindex="0"]')?.focus()
  }, [focusedDate])

  const moveTo = (date, { focusDay }) => {
    shouldFocusDay.current = focusDay
    setFocusedDate(clampDate(date, minYear, maxYear))
  }

  const handleGridKeyDown = (event) => {
    const move = KEY_MOVES[event.key]
    if (!move) return
    event.preventDefault()
    moveTo(move(focusedDate, event.shiftKey), { focusDay: true })
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Previous month"
          onClick={() => moveTo(addMonths(focusedDate, -1), { focusDay: false })}
          disabled={year === minYear && month === 0}
        >
          ‹
        </button>
        <select
          aria-label="Month"
          className={`${styles.navSelect} ${styles.monthSelect}`}
          value={month}
          onChange={(event) => moveTo(addMonths(focusedDate, Number(event.target.value) - month), { focusDay: false })}
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={index}>
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          className={styles.navSelect}
          value={year}
          onChange={(event) => moveTo(addMonths(focusedDate, (Number(event.target.value) - year) * 12), { focusDay: false })}
        >
          {range(minYear, maxYear).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.navButton}
          aria-label="Next month"
          onClick={() => moveTo(addMonths(focusedDate, 1), { focusDay: false })}
          disabled={year === maxYear && month === 11}
        >
          ›
        </button>
      </div>

      <table ref={gridRef} role="grid" className={styles.grid} aria-labelledby={captionId} onKeyDown={handleGridKeyDown}>
        <caption id={captionId} className="visually-hidden" aria-live="polite">
          {MONTH_NAMES[month]} {year}
        </caption>
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th key={weekday.short} scope="col" abbr={weekday.long}>
                {weekday.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={toISODate(week[0])}>
              {week.map((day) => {
                const isSelected = isSameDay(day, selectedDate)
                const isFocused = isSameDay(day, focusedDate)
                const classes = [
                  styles.day,
                  day.getMonth() !== month && styles.outsideMonth,
                  isSameDay(day, currentDay) && styles.today,
                  isSelected && styles.selected,
                ]
                return (
                  <td key={day.getTime()} aria-selected={isSelected}>
                    <button
                      type="button"
                      tabIndex={isFocused ? 0 : -1}
                      className={classes.filter(Boolean).join(' ')}
                      aria-label={LONG_DATE.format(day)}
                      aria-current={isSameDay(day, currentDay) ? 'date' : undefined}
                      onClick={() => onSelect(toISODate(day))}
                    >
                      {day.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className={styles.todayButton}
        onClick={() => moveTo(today(), { focusDay: true })}
      >
        Today
      </button>
    </div>
  )
}
