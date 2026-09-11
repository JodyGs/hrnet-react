import { useEffect } from 'react'

/**
 * Sets the browser tab title while the calling page is displayed.
 *
 * @param {string} title - page name, displayed as "HRnet - <title>"
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `HRnet - ${title}`
  }, [title])
}
