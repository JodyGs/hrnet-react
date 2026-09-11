import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  formatDisplayDate,
  getCalendarDays,
  isSameDay,
  parseDisplayDate,
  parseISODate,
  toISODate,
} from './date.js'

describe('ISO dates', () => {
  it('converts a date to an ISO string in local time', () => {
    expect(toISODate(new Date(2024, 0, 5))).toBe('2024-01-05')
  })

  it('parses an ISO string', () => {
    expect(parseISODate('2024-02-29')).toEqual(new Date(2024, 1, 29))
  })

  it('rejects invalid ISO strings', () => {
    expect(parseISODate('2023-02-29')).toBeNull()
    expect(parseISODate('01/05/2024')).toBeNull()
    expect(parseISODate('')).toBeNull()
    expect(parseISODate(undefined)).toBeNull()
  })
})

describe('display format (MM/DD/YYYY)', () => {
  it('formats an ISO date', () => {
    expect(formatDisplayDate('2024-01-05')).toBe('01/05/2024')
  })

  it('formats an empty value as an empty string', () => {
    expect(formatDisplayDate('')).toBe('')
  })

  it.each([
    ['01/05/2024', '2024-01-05'],
    ['1/5/2024', '2024-01-05'],
    [' 12/31/1999 ', '1999-12-31'],
    ['01052024', '2024-01-05'],
  ])('parses "%s"', (text, expected) => {
    expect(parseDisplayDate(text)).toBe(expected)
  })

  it.each(['', '13/01/2024', '02/30/2024', '2024-01-05', '1/5/24', 'hello'])('rejects "%s"', (text) => {
    expect(parseDisplayDate(text)).toBeNull()
  })
})

describe('date arithmetic', () => {
  it('adds days across months and years', () => {
    expect(addDays(new Date(2023, 11, 31), 1)).toEqual(new Date(2024, 0, 1))
    expect(addDays(new Date(2024, 2, 1), -1)).toEqual(new Date(2024, 1, 29))
  })

  it('adds months and clamps the day to the end of the month', () => {
    expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(new Date(2024, 1, 29))
    expect(addMonths(new Date(2024, 0, 15), -1)).toEqual(new Date(2023, 11, 15))
    expect(addMonths(new Date(2024, 1, 29), 12)).toEqual(new Date(2025, 1, 28))
  })

  it('compares days', () => {
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 1))).toBe(true)
    expect(isSameDay(new Date(2024, 0, 1), new Date(2024, 0, 2))).toBe(false)
    expect(isSameDay(null, new Date())).toBe(false)
  })
})

describe('getCalendarDays', () => {
  it('returns 6 full weeks starting on a Sunday', () => {
    // September 2026 starts on a Tuesday
    const days = getCalendarDays(2026, 8)

    expect(days).toHaveLength(42)
    expect(days[0]).toEqual(new Date(2026, 7, 30))
    expect(days[0].getDay()).toBe(0)
    expect(days[2]).toEqual(new Date(2026, 8, 1))
    expect(days[41]).toEqual(new Date(2026, 9, 10))
  })
})
