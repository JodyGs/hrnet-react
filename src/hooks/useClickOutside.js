import { useEffect, useRef } from 'react'

/**
 * Calls `onClickOutside` when the user presses the mouse (or touches the
 * screen) outside of the element referenced by `ref`, while `enabled` is true.
 *
 * @param {{ current: HTMLElement | null }} ref
 * @param {() => void} onClickOutside
 * @param {boolean} [enabled=true]
 */
export function useClickOutside(ref, onClickOutside, enabled = true) {
  const handlerRef = useRef(onClickOutside)

  useEffect(() => {
    handlerRef.current = onClickOutside
  })

  useEffect(() => {
    if (!enabled) return undefined

    const handlePointerDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) handlerRef.current()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [ref, enabled])
}
