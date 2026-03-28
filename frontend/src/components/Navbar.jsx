import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/>
            <path d="M10 20 Q16 8 22 20" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M8 18 Q16 6 24 18" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
          </svg>
        </div>
        <span className={styles.title}>Climate Risk Advisor</span>
      </div>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>Map</button>
        <button className={styles.tab}>Insights</button>
        <button className={styles.tab}>About</button>
      </div>
    </nav>
  );
}
