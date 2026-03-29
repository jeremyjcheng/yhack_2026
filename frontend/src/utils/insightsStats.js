function numberOrZero(value) {
  return Number.isFinite(value) ? value : 0;
}

export function summarizeScores(counties, scoreKey = 'overallRisk') {
  const values = counties
    .map((county) => county[scoreKey])
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return {
      count: 0,
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      aboveHalfPct: 0,
    };
  }

  const sum = values.reduce((acc, value) => acc + value, 0);
  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2 === 0
      ? (values[mid - 1] + values[mid]) / 2
      : values[mid];

  const aboveHalfCount = values.filter((value) => value >= 0.5).length;

  return {
    count: values.length,
    min: values[0],
    max: values[values.length - 1],
    mean: sum / values.length,
    median,
    aboveHalfPct: (aboveHalfCount / values.length) * 100,
  };
}

export function buildHistogram(counties, scoreKey = 'overallRisk', bins = 10) {
  const safeBins = Math.max(1, bins);
  const counts = Array.from({ length: safeBins }, () => 0);

  counties.forEach((county) => {
    const value = numberOrZero(county[scoreKey]);
    const normalized = Math.max(0, Math.min(1, value));
    const idx = Math.min(safeBins - 1, Math.floor(normalized * safeBins));
    counts[idx] += 1;
  });

  return counts.map((count, idx) => {
    const start = idx / safeBins;
    const end = (idx + 1) / safeBins;
    return {
      bucket: `${start.toFixed(1)}-${end.toFixed(1)}`,
      start,
      end,
      count,
    };
  });
}

export function summarizeByState(counties, scoreKey = 'overallRisk') {
  const groups = new Map();

  counties.forEach((county) => {
    const state = county.state || 'Unknown';
    const current = groups.get(state) || { state, total: 0, count: 0 };
    current.total += numberOrZero(county[scoreKey]);
    current.count += 1;
    groups.set(state, current);
  });

  return Array.from(groups.values())
    .map((entry) => ({
      state: entry.state,
      count: entry.count,
      avgRisk: entry.count > 0 ? entry.total / entry.count : 0,
    }))
    .sort((a, b) => b.avgRisk - a.avgRisk);
}

export function topN(counties, key, n = 10, desc = true) {
  const direction = desc ? -1 : 1;
  return [...counties]
    .sort((a, b) => direction * (numberOrZero(a[key]) - numberOrZero(b[key])))
    .slice(0, n);
}
