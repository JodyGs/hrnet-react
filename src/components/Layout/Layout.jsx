import { NavLink, Outlet } from 'react-router'
import styles from './Layout.module.css'

const navLinkClass = ({ isActive }) =>
  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink

/** Page frame shared by every route: header with navigation, main content, footer. */
export function Layout() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.brand} aria-label="HRnet, home">
            <span className={styles.logo} aria-hidden="true">
              H
            </span>
            HRnet
          </NavLink>
          <nav aria-label="Main">
            <ul className={styles.navList}>
              <li>
                <NavLink to="/" end className={navLinkClass}>
                  Create employee
                </NavLink>
              </li>
              <li>
                <NavLink to="/employees" className={navLinkClass}>
                  View current employees
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>WealthHealth · HRnet</footer>
    </div>
  )
}
