import { Link } from 'react-router'
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js'

/** Fallback page for unknown URLs. */
export function NotFound() {
  useDocumentTitle('Page not found')

  return (
    <>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Back to the Create Employee page</Link>
    </>
  )
}
