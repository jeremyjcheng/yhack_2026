import RiskBars from './RiskBars';
import StatsGrid from './StatsGrid';
import Recommendations from './Recommendations';
import SimilarCounties from './SimilarCounties';
import styles from './SidePanel.module.css';

export default function SidePanel({ county, allCounties, onClose, onSelectCounty }) {
  return (
    <div className={`${styles.panel} ${county ? styles.visible : ''}`}>
      <button className={styles.close} onClick={onClose}>&times;</button>
      {county && (
        <div className={styles.content}>
          <div className={styles.header}>
            <h2 className={styles.countyName}>{county.name} County</h2>
            <p className={styles.state}>{county.state}</p>
          </div>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Risk Assessment</h3>
            <RiskBars county={county} />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Key Statistics</h3>
            <StatsGrid county={county} />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Recommended Actions</h3>
            <Recommendations county={county} />
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Similar Counties</h3>
            <SimilarCounties county={county} allCounties={allCounties} onSelect={onSelectCounty} />
          </section>
        </div>
      )}
    </div>
  );
}
