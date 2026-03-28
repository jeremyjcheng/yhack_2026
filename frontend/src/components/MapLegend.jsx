import styles from './MapLegend.module.css';

export default function MapLegend({ activeLayer, onLayerChange }) {
  const layers = [
    { key: 'all', label: 'All Risks', dots: true },
    { key: 'heat', label: 'Heat Risk', color: '#ef4444', icon: 'heat' },
    { key: 'flood', label: 'Flood Risk', color: '#3b82f6', icon: 'flood' },
    { key: 'wildfire', label: 'Wildfire Risk', color: '#f97316', icon: 'wildfire' },
  ];

  return (
    <div className={styles.legend}>
      <h4 className={styles.title}>Risk Layers</h4>
      <div className={styles.toggles}>
        {layers.map(l => (
          <button
            key={l.key}
            className={`${styles.btn} ${activeLayer === l.key ? styles.active : ''}`}
            onClick={() => onLayerChange(l.key)}
          >
            {l.dots ? (
              <>
                <span className={`${styles.dot} ${styles.dotHeat}`} />
                <span className={`${styles.dot} ${styles.dotFlood}`} />
                <span className={`${styles.dot} ${styles.dotFire}`} />
              </>
            ) : (
              <LayerIcon type={l.icon} color={l.color} />
            )}
            {l.label}
          </button>
        ))}
      </div>
      <div className={styles.scale}>
        <span className={styles.label}>Risk Level</span>
        <div className={styles.gradient} />
        <div className={styles.range}>
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

function LayerIcon({ type, color }) {
  if (type === 'heat') {
    return (
      <svg className="legend-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>
    );
  }
  if (type === 'flood') {
    return (
      <svg className="legend-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2l-2 7h4l-2 7"/>
        <path d="M4 18c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5-1.5 3-2 4.5-2s3 .5 4.5 2" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg className="legend-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0116 0c0 4.5-4 8-8 12z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
