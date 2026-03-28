import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';

function tabClass({ isActive }) {
  return `${styles.tab}${isActive ? ` ${styles.active}` : ''}`;
}

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        <div className={styles.logo}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/>
            <path d="M10 20 Q16 8 22 20" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M8 18 Q16 6 24 18" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
          </svg>
        </div>
        <span className={styles.title}>Climate Risk Advisor</span>
      </Link>
      <div className={styles.tabs}>
        <NavLink to="/" end className={tabClass}>
          Map
        </NavLink>
        <NavLink to="/insights" className={tabClass}>
          Insights
        </NavLink>
        <NavLink to="/about" className={tabClass}>
          About
        </NavLink>
      </div>
    </nav>
  );
}
