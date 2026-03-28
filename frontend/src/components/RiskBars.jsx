import { useEffect, useRef } from 'react';
import { riskColor } from '../utils/riskScoring';
import styles from './RiskBars.module.css';

const RISK_TYPES = [
  { key: 'heatRisk', label: 'Heat Risk', barClass: 'heatBar', stroke: '#ef4444',
    icon: <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/> },
  { key: 'floodRisk', label: 'Flood Risk', barClass: 'floodBar', stroke: '#3b82f6',
    icon: <><path d="M12 2l-2 7h4l-2 7"/><path d="M4 18c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5-1.5 3-2 4.5-2s3 .5 4.5 2" strokeLinecap="round"/></> },
  { key: 'wildfireRisk', label: 'Wildfire Risk', barClass: 'wildfireBar', stroke: '#f97316',
    icon: <><path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0116 0c0 4.5-4 8-8 12z"/><circle cx="12" cy="10" r="3"/></> },
];

export default function RiskBars({ county }) {
  return (
    <div className={styles.bars}>
      {RISK_TYPES.map(r => (
        <RiskRow key={r.key} risk={r} score={county[r.key]} />
      ))}
    </div>
  );
}

function RiskRow({ risk, score }) {
  const barRef = useRef(null);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    el.style.width = '0%';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = `${Math.round(score * 100)}%`;
      });
    });
  }, [score]);

  return (
    <div className={styles.row}>
      <div className={styles.label}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke={risk.stroke} strokeWidth="2">
          {risk.icon}
        </svg>
        <span>{risk.label}</span>
      </div>
      <div className={styles.track}>
        <div ref={barRef} className={`${styles.bar} ${styles[risk.barClass]}`} />
      </div>
      <span className={styles.score} style={{ color: riskColor(score) }}>
        {Math.round(score * 100)}
      </span>
    </div>
  );
}
