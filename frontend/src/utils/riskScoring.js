let riskBounds = {};

export function computeRiskBounds(counties) {
  const fields = ['avg_temp_max', 'max_uv_index', 'total_rain', 'total_precip_hours', 'total_snowfall'];
  fields.forEach(f => {
    const vals = counties.map(c => c[f]).filter(v => v != null);
    riskBounds[f] = { min: Math.min(...vals), max: Math.max(...vals) };
  });
}

function normalize(value, field) {
  const b = riskBounds[field];
  if (!b || b.max === b.min) return 0;
  return Math.max(0, Math.min(1, (value - b.min) / (b.max - b.min)));
}

export function computeRiskScores(c) {
  const heat = 0.6 * normalize(c.avg_temp_max, 'avg_temp_max') +
               0.4 * normalize(c.max_uv_index, 'max_uv_index');

  const flood = 0.5 * normalize(c.total_rain, 'total_rain') +
                0.5 * normalize(c.total_precip_hours, 'total_precip_hours');

  const droughtFactor = 1 - normalize(c.total_rain, 'total_rain');
  const wildfire = 0.5 * normalize(c.avg_temp_max, 'avg_temp_max') +
                   0.3 * droughtFactor +
                   0.2 * (1 - normalize(c.total_snowfall, 'total_snowfall'));

  const overall = (heat + flood + wildfire) / 3;

  return {
    heat: Math.round(heat * 100) / 100,
    flood: Math.round(flood * 100) / 100,
    wildfire: Math.round(wildfire * 100) / 100,
    overall: Math.round(overall * 100) / 100,
  };
}

export function riskColor(score) {
  if (score == null) return 'rgba(200,200,200,0.3)';
  if (score < 0.25) return '#22c55e';
  if (score < 0.5) return '#eab308';
  if (score < 0.75) return '#f97316';
  return '#ef4444';
}

export function getLayerColorExpr(activeLayer) {
  const prop = activeLayer === 'heat' ? 'heatRisk'
    : activeLayer === 'flood' ? 'floodRisk'
    : activeLayer === 'wildfire' ? 'wildfireRisk'
    : 'overallRisk';

  return [
    'interpolate', ['linear'], ['coalesce', ['get', prop], 0],
    0, '#22c55e',
    0.25, '#a3e635',
    0.5, '#eab308',
    0.75, '#f97316',
    1, '#ef4444',
  ];
}
