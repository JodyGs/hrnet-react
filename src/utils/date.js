/**
 * Date helpers. Dates are stored as ISO strings ("YYYY-MM-DD") in the Redux
 * store (serializable, sortable as text) and displayed as "MM/DD/YYYY", the
 * format of the original HRnet application.
 *
 * Every Date object is built in local time, at midnight.
 */

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const WEEKDAYS = [
  { short: 'Su', long: 'Sunday' },
  { short: 'Mo', long: 'Monday' },
  { short: 'Tu', long: 'Tuesday' },
  { short: 'We', long: 'Wednesday' },
  { short: 'Th', long: 'Thursday' },
  { short: 'Fr', long: 'Friday' },
  { short: 'Sa', long: 'Saturday' },
]

const pad = (number) => String(number).padStart(2, '0')

/** Today at midnight. */
export const today = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** @returns {boolean} true if year / month (1-12) / day form an existing date */
function isValidDate(year, month, day) {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

/**
 * @param {Date} date
 * @returns {string} "YYYY-MM-DD"
 */
export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * @param {string} iso - "YYYY-MM-DD"
 * @returns {Date | null}
 */
export function parseISODate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '')
  if (!match) return null
  const [year, month, day] = match.slice(1).map(Number)
  return isValidDate(year, month, day) ? new Date(year, month - 1, day) : null
}

/**
 * @param {string} iso - "YYYY-MM-DD"
 * @returns {string} "MM/DD/YYYY", or '' for an empty / invalid date
 */
export function formatDisplayDate(iso) {
  const date = parseISODate(iso)
  return date ? `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}` : ''
}

/**
 * Parses a date typed by the user ("MM/DD/YYYY", "M/D/YYYY" or "MMDDYYYY").
 *
 * @param {string} text
 * @returns {string | null} ISO date, or null when the text is not a valid date
 */
export function parseDisplayDate(text) {
  const trimmed = text.trim()
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed) ?? /^(\d{2})(\d{2})(\d{4})$/.exec(trimmed)
  if (!match) return null
  const [month, day, year] = match.slice(1).map(Number)
  return isValidDate(year, month, day) ? toISODate(new Date(year, month - 1, day)) : null
}

/** @returns {Date} a new date, `amount` days later (or earlier if negative) */
export function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

/**
 * Moves by whole months, keeping the day when possible: Jan 31 + 1 month = Feb 28/29.
 *
 * @returns {Date}
 */
export function addMonths(date, amount) {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(date.getDate(), lastDay))
  return target
}

/** @returns {boolean} */
export function isSameDay(a, b) {
  return (
    Boolean(a && b) &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * The 42 days (6 weeks, starting on Sunday) displayed for a month, including
 * the end of the previous month and the beginning of the next one.
 *
 * @param {number} year
 * @param {number} month - 0 to 11
 * @returns {Date[]}
 */
export function getCalendarDays(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const start = addDays(firstOfMonth, -firstOfMonth.getDay())
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}
