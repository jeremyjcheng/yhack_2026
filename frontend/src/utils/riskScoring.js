export function computeRiskBounds() {
  // Kept for compatibility; hazard-index based scoring does not need dynamic bounds.
}

function hazardToUnit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(1, n / 100));
}

function weightedAverage(entries) {
  const valid = entries.filter((entry) => entry.value != null && entry.weight > 0);
  if (valid.length === 0) return 0;
  const weighted = valid.reduce((sum, entry) => sum + entry.value * entry.weight, 0);
  const totalWeight = valid.reduce((sum, entry) => sum + entry.weight, 0);
  return totalWeight > 0 ? weighted / totalWeight : 0;
}

export function computeRiskScores(c) {
  const heatWave = hazardToUnit(c['Heat Wave - Hazard Type Risk Index Score']);
  const inlandFlood = hazardToUnit(c['Inland Flooding - Hazard Type Risk Index Score']);
  const coastalFlood = hazardToUnit(c['Coastal Flooding - Hazard Type Risk Index Score']);
  const hurricane = hazardToUnit(c['Hurricane - Hazard Type Risk Index Score']);
  const wildfireHazard = hazardToUnit(c['Wildfire - Hazard Type Risk Index Score']);
  const drought = hazardToUnit(c['Drought - Hazard Type Risk Index Score']);

  const heat = heatWave ?? 0;
  const flood = weightedAverage([
    { value: inlandFlood, weight: 0.6 },
    { value: coastalFlood, weight: 0.2 },
    { value: hurricane, weight: 0.2 },
  ]);
  const wildfire = weightedAverage([
    { value: wildfireHazard, weight: 0.8 },
    { value: drought, weight: 0.2 },
  ]);

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
