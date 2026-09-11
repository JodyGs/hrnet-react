import { useEffect, useRef, useState } from 'react'
import { useTypeahead } from './useTypeahead.js'
import styles from './Select.module.css'

const PAGE_SIZE = 10

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Custom select — React replacement for the jQuery UI `selectmenu` widget.
 *
 * Implements the WAI-ARIA "select-only combobox" pattern: a button showing the
 * selected option and a listbox of options. The focus stays on the button and
 * the highlighted option is announced with `aria-activedescendant`.
 *
 * Keyboard: ↑ ↓ Home End PageUp PageDown to move, Enter / Space to select,
 * Escape to close, letters to jump to an option (type-ahead).
 *
 * @param {object} props
 * @param {string} props.id - id of the button, to link it with a `<label htmlFor>`
 * @param {string} [props.labelId] - id of the visible label, used to name the list of options
 * @param {string} [props.ariaLabelledBy] - ids of the elements naming the field, when there is no `<label>`
 * @param {{ value: string, label: string }[]} props.options - available options
 * @param {string} props.value - value of the selected option ('' when none)
 * @param {(value: string) => void} props.onChange - called with the value of the chosen option
 * @param {string} [props.placeholder='Select…'] - text shown when no option is selected
 * @param {boolean} [props.invalid=false] - marks the field as invalid (aria-invalid + style)
 * @param {string} [props.describedBy] - id of an element describing the field (e.g. error message)
 */
export function Select({
  id,
  labelId,
  ariaLabelledBy,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  invalid = false,
  describedBy,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const listRef = useRef(null)
  const typeahead = useTypeahead(options)

  const listboxId = `${id}-listbox`
  const optionId = (index) => `${id}-option-${index}`
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = options[selectedIndex]
  const lastIndex = options.length - 1

  // Keep the highlighted option visible when moving with the keyboard.
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return
    listRef.current?.children[activeIndex]?.scrollIntoView?.({ block: 'nearest' })
  }, [isOpen, activeIndex])

  const open = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index)
    setIsOpen(true)
  }

  const close = () => setIsOpen(false)

  const select = (index) => {
    if (index >= 0) onChange(options[index].value)
    close()
  }

  const handleKeyDown = (event) => {
    const { key } = event

    // Type-ahead: printable characters (without shortcut modifiers). A space
    // only belongs to the search when the user is already typing.
    const isPrintable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey
    if (isPrintable && (key !== ' ' || typeahead.isSearching())) {
      event.preventDefault()
      const current = isOpen ? activeIndex : selectedIndex
      const match = typeahead.search(key, current)
      if (match >= 0) {
        if (isOpen) setActiveIndex(match)
        else onChange(options[match].value)
      }
      return
    }

    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        event.preventDefault()
        open()
      } else if (key === 'Home' || key === 'End') {
        event.preventDefault()
        open(key === 'Home' ? 0 : lastIndex)
      }
      return
    }

    const moves = {
      ArrowDown: activeIndex + 1,
      ArrowUp: activeIndex - 1,
      Home: 0,
      End: lastIndex,
      PageDown: activeIndex + PAGE_SIZE,
      PageUp: activeIndex - PAGE_SIZE,
    }

    if (key in moves) {
      event.preventDefault()
      setActiveIndex(clamp(moves[key], 0, lastIndex))
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault()
      select(activeIndex)
    } else if (key === 'Escape') {
      event.preventDefault()
      close()
    } else if (key === 'Tab') {
      select(activeIndex)
    }
  }

  return (
    <div className={styles.select}>
      <button
        type="button"
        id={id}
        role="combobox"
        aria-haspopup="listbox"
        aria-labelledby={ariaLabelledBy}
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={`${styles.button} ${invalid ? styles.invalid : ''}`}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleKeyDown}
        onBlur={close}
      >
        <span className={selectedOption ? undefined : styles.placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={styles.chevron} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId ?? ariaLabelledBy}
          tabIndex={-1}
          className={styles.listbox}
          // Keep the focus on the button while clicking an option.
          onMouseDown={(event) => event.preventDefault()}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === selectedIndex}
              className={`${styles.option} ${index === activeIndex ? styles.active : ''}`}
              onClick={() => select(index)}
              onMouseMove={() => index !== activeIndex && setActiveIndex(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
