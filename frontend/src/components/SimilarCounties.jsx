import { useMemo } from 'react';
import { riskColor } from '../utils/riskScoring';
import styles from './SimilarCounties.module.css';

export default function SimilarCounties({ county, allCounties, onSelect }) {
  const similar = useMemo(() => {
    return allCounties
      .filter(c => c.fips !== county.fips)
      .map(c => ({
        ...c,
        dist: Math.abs(c.heatRisk - county.heatRisk) +
              Math.abs(c.floodRisk - county.floodRisk) +
              Math.abs(c.wildfireRisk - county.wildfireRisk),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 4);
  }, [county, allCounties]);

  return (
    <div className={styles.list}>
      {similar.map(c => (
        <div key={c.fips} className={styles.card} onClick={() => onSelect(c.fips)}>
          <div className={styles.info}>
            <span className={styles.name}>{c.name} County</span>
            <span className={styles.state}>{c.state}</span>
          </div>
          <div className={styles.dots}>
            <span className={styles.dot} style={{ background: riskColor(c.heatRisk) }} />
            <span className={styles.dot} style={{ background: riskColor(c.floodRisk) }} />
            <span className={styles.dot} style={{ background: riskColor(c.wildfireRisk) }} />
          </div>
        </div>
      ))}
    </div>
  );
}
