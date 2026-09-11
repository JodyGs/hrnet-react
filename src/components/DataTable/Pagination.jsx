import { getPageNumbers } from './dataTableUtils.js'
import styles from './DataTable.module.css'

/**
 * Previous / page numbers / Next buttons.
 *
 * @param {object} props
 * @param {number} props.page - current page (1-based)
 * @param {number} props.pageCount - number of pages
 * @param {(page: number) => void} props.onPageChange - called with the requested page
 */
export function Pagination({ page, pageCount, onPageChange }) {
  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <ul className={styles.pageList}>
        {getPageNumbers(page, pageCount).map((number, index) =>
          number === '…' ? (
            <li key={`ellipsis-${index}`} className={styles.ellipsis} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={number}>
              <button
                type="button"
                className={styles.pageButton}
                aria-label={`Page ${number}`}
                aria-current={number === page ? 'page' : undefined}
                onClick={() => onPageChange(number)}
              >
                {number}
              </button>
            </li>
          ),
        )}
      </ul>
      <button
        type="button"
        className={styles.pageButton}
        onClick={() => onPageChange(page + 1)}
        disabled={page === pageCount}
      >
        Next
      </button>
    </nav>
  )
}
