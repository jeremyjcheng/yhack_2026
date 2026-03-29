import { useEffect, useState } from 'react';
import styles from './Recommendations.module.css';

const HAZARD_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'heat', label: 'Heat' },
  { id: 'flood', label: 'Flood' },
  { id: 'wildfire', label: 'Wildfire' },
];

function getHighestRiskHazard(county) {
  if (!county) return 'all';
  const risks = [
    { id: 'heat', score: county.heatRisk ?? 0 },
    { id: 'flood', score: county.floodRisk ?? 0 },
    { id: 'wildfire', score: county.wildfireRisk ?? 0 },
  ];
  risks.sort((a, b) => b.score - a.score);
  return risks[0]?.id || 'all';
}

export default function Recommendations({ county }) {
  const [status, setStatus] = useState('idle');
  const [recommendationByHazard, setRecommendationByHazard] = useState(null);
  const [selectedHazard, setSelectedHazard] = useState('all');

  useEffect(() => {
    if (!county) {
      setStatus('idle');
      setRecommendationByHazard(null);
      setSelectedHazard('all');
      return;
    }
    setSelectedHazard(getHighestRiskHazard(county));
  }, [county?.fips]);

  useEffect(() => {
    if (!county) {
      return undefined;
    }

    const controller = new AbortController();
    const fetchAllHazards = async () => {
      setStatus('loading');
      setRecommendationByHazard(null);
      const payload = {
        county: county.name,
        state: county.state,
        fips: county.fips,
      };
      console.log('[recommendations] request payload:', payload);
      console.log(`query: ${payload.county} County, ${payload.state} [all-hazards-cache]`);

      try {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        console.log('[recommendations] response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[recommendations] response error body:', errorText);
          throw new Error('Recommendation request failed');
        }

        const data = await response.json();
        console.log('[recommendations] response body:', data);
        const nextRecommendations = data.recommendations || {};
        const hasAny =
          ['all', 'heat', 'flood', 'wildfire'].some(
            (k) => Array.isArray(nextRecommendations[k]) && nextRecommendations[k].length > 0,
          );
        console.log('output:', nextRecommendations);
        if (!hasAny) {
          setStatus('empty');
          return;
        }

        setRecommendationByHazard(nextRecommendations);
        setStatus('success');
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('[recommendations] request failed:', error);
        setStatus('empty');
      }
    };

    fetchAllHazards();
    return () => controller.abort();
  }, [county?.fips]);

  if (status === 'idle') return null;

  const filterRow = (
    <div className={styles.filterRow} role="tablist" aria-label="Recommendation hazard filters">
      {HAZARD_OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => {
            setSelectedHazard(option.id);
            console.log(`[recommendations] local filter switch: ${option.id}`);
          }}
          className={[
            styles.filterButton,
            selectedHazard === option.id ? styles.filterButtonActive : '',
          ].join(' ')}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  if (status === 'loading') {
    return (
      <>
        {filterRow}
        <div className={styles.loadingWrap} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          <span>Generating county-specific recommendations...</span>
        </div>
      </>
    );
  }

  if (status === 'empty') {
    return (
      <>
        {filterRow}
        <p className={styles.empty}>No recommendations available for this county right now.</p>
      </>
    );
  }

  const items = recommendationByHazard?.[selectedHazard] || [];
  if (!items.length) {
    return (
      <>
        {filterRow}
        <p className={styles.empty}>No recommendations available for this county right now.</p>
      </>
    );
  }

  return (
    <>
      {filterRow}
      <ul className={styles.bulletList}>
        {items.map((item, index) => (
          <li key={`${selectedHazard}-${index}`} className={styles.bulletItem}>
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}
