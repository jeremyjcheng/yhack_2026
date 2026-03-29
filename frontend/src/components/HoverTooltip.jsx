import styles from './HoverTooltip.module.css';

export default function HoverTooltip({ hoverInfo }) {
  if (!hoverInfo) return null;

  const { x, y, county } = hoverInfo;

  return (
    <div className={styles.tooltip} style={{ left: x + 16, top: y - 10 }}>
      <div className={styles.name}>{county.name} County</div>
      <div className={styles.state}>{county.state}</div>
      <div className={styles.stats}>
        <div><span className={styles.statValue}>{county.avg_temp_max.toFixed(1)}&deg;C</span> Temp</div>
        <div><span className={styles.statValue}>{county.total_rain.toFixed(1)}mm</span> Rain</div>
      </div>
    </div>
  );
}
