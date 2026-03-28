import styles from './LoadingOverlay.module.css';

export default function LoadingOverlay({ visible }) {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.spinner} />
      <p className={styles.text}>Loading climate data...</p>
    </div>
  );
}
