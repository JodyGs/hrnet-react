/**
 * Persistence of the Redux state in the browser.
 *
 * HRnet has no back end yet: without persistence, every employee would be lost
 * when the page is reloaded. Redux stays the single source of truth, the
 * storage is only a snapshot read once at start-up.
 */

export const STORAGE_KEY = 'hrnet:state'

/**
 * Reads the saved state. Returns `undefined` when there is none or when it is
 * unreadable, so that the reducers use their own initial state.
 *
 * @param {Storage} [storage=window.localStorage]
 * @returns {object | undefined}
 */
export function loadState(storage = globalThis.localStorage) {
  try {
    const serialized = storage?.getItem(STORAGE_KEY)
    return serialized ? JSON.parse(serialized) : undefined
  } catch {
    return undefined
  }
}

/**
 * Saves the given state. Errors (private mode, quota exceeded…) are ignored:
 * the application keeps working with its in-memory state.
 *
 * @param {object} state
 * @param {Storage} [storage=window.localStorage]
 */
export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore write errors
  }
}
