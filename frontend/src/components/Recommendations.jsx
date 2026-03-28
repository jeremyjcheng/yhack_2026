import { useMemo } from 'react';
import { generateRecommendations } from '../utils/recommendations';
import styles from './Recommendations.module.css';

export default function Recommendations({ county }) {
  const recs = useMemo(() => generateRecommendations(county), [county]);

  return (
    <ul className={styles.list}>
      {recs.map((r, i) => (
        <li key={i} className={styles.item}>
          <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {r}
        </li>
      ))}
    </ul>
  );
}
