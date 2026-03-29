import styles from './StatsGrid.module.css';

export default function StatsGrid({ county }) {
  const stats = [
    { value: `${county.avg_temp_max.toFixed(1)}\u00B0C`, label: 'Avg High Temp' },
    { value: `${county.total_rain.toFixed(1)} mm`, label: 'Weekly Rainfall' },
    { value: county.max_uv_index.toFixed(1), label: 'UV Index' },
    { value: `${county.total_snowfall.toFixed(1)} cm`, label: 'Snowfall' },
  ];

  return (
    <div className={styles.grid}>
      {stats.map((s, i) => (
        <div key={i} className={styles.card}>
          <span className={styles.value}>{s.value}</span>
          <span className={styles.label}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
