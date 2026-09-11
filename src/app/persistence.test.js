import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY, loadState, saveState } from './persistence.js'

describe('persistence', () => {
  it('saves and loads the state', () => {
    const state = { employees: { list: [{ id: '1', firstName: 'Ada' }] } }
    saveState(state)
    expect(loadState()).toEqual(state)
  })

  it('returns undefined when nothing is saved', () => {
    expect(loadState()).toBeUndefined()
  })

  it('returns undefined when the saved value is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadState()).toBeUndefined()
  })

  it('ignores storage errors when saving', () => {
    const failingStorage = { setItem: vi.fn(() => { throw new Error('QuotaExceededError') }) }
    expect(() => saveState({}, failingStorage)).not.toThrow()
  })
})
