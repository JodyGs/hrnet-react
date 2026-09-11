import { useRef } from 'react'

const RESET_DELAY = 500

/**
 * Finds the first option whose label starts with `search`, looking from
 * `startIndex` and wrapping around the end of the list.
 *
 * @param {{ label: string }[]} options
 * @param {string} search - lowercase text typed by the user
 * @param {number} startIndex
 * @returns {number} index of the match, or -1
 */
export function findOptionByText(options, search, startIndex = 0) {
  for (let offset = 0; offset < options.length; offset += 1) {
    const index = (startIndex + offset) % options.length
    if (options[index].label.toLowerCase().startsWith(search)) return index
  }
  return -1
}

/**
 * Keyboard "type to select" behaviour of native selects: typing "new y" jumps
 * to "New York", typing "n" several times cycles through the options starting
 * with "n".
 *
 * @param {{ label: string }[]} options
 * @returns {{
 *   search: (character: string, currentIndex: number) => number,
 *   isSearching: () => boolean,
 * }} `search` returns the index to activate (or -1); `isSearching` is true while
 * the user is typing, so that a space can be part of the search ("new york").
 */
export function useTypeahead(options) {
  const buffer = useRef('')
  const timer = useRef(undefined)

  const isSearching = () => buffer.current.length > 0

  const search = (character, currentIndex) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      buffer.current = ''
    }, RESET_DELAY)

    const previous = buffer.current
    buffer.current += character.toLowerCase()

    // Same key pressed again ("n", "n"…): go to the next option starting with it.
    const isRepeatedKey = previous.length > 0 && [...buffer.current].every((c) => c === buffer.current[0])
    if (isRepeatedKey) {
      return findOptionByText(options, buffer.current[0], currentIndex + 1)
    }

    const start = previous ? Math.max(currentIndex, 0) : currentIndex + 1
    return findOptionByText(options, buffer.current, start)
  }

  return { search, isSearching }
}
