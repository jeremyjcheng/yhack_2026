import { useState, useEffect, useRef } from 'react';
import { feature } from 'topojson-client';
import Papa from 'papaparse';
import { computeRiskBounds, computeRiskScores } from '../utils/riskScoring';

const COUNTY_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';
const COUNTY_DATA_URL = '/combined_final.csv';

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeCountyRow(row) {
  const rawFips = row.fips_code || row['State-County FIPS Code'] || '';
  const fips = String(rawFips).padStart(5, '0');
  if (!/^\d{5}$/.test(fips)) return null;

  return {
    ...row,
    fips,
    fips_code: fips,
    name: row.name,
    state: row.state,
    lon: toNumber(row.lon),
    lat: toNumber(row.lat),
    avg_temp_max: toNumber(row.avg_temp_max),
    avg_temp_min: toNumber(row.avg_temp_min),
    total_rain: toNumber(row.total_rain),
    max_uv_index: toNumber(row.max_uv_index),
    total_snowfall: toNumber(row.total_snowfall),
  };
}

export default function useCountyData() {
  const [loading, setLoading] = useState(true);
  const [geojson, setGeojson] = useState(null);
  const countyDataMap = useRef({});
  const allCounties = useRef([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [topoRes, dataRes] = await Promise.all([
        fetch(COUNTY_TOPO_URL),
        fetch(COUNTY_DATA_URL),
      ]);

      const topoData = await topoRes.json();
      const csvText = await dataRes.text();
      const parsed = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
      });
      const rawCounties = parsed.data
        .map(normalizeCountyRow)
        .filter(Boolean);

      const map = {};
      rawCounties.forEach(c => { map[c.fips] = c; });

      computeRiskBounds(rawCounties);
      rawCounties.forEach(c => {
        const scores = computeRiskScores(c);
        c.heatRisk = scores.heat;
        c.floodRisk = scores.flood;
        c.wildfireRisk = scores.wildfire;
        c.overallRisk = scores.overall;
      });

      const geo = feature(topoData, topoData.objects.counties);
      geo.features.forEach(f => {
        const fips = String(f.id).padStart(5, '0');
        f.properties.fips = fips;
        const d = map[fips];
        if (d) {
          f.properties.name = d.name;
          f.properties.state = d.state;
          f.properties.heatRisk = d.heatRisk;
          f.properties.floodRisk = d.floodRisk;
          f.properties.wildfireRisk = d.wildfireRisk;
          f.properties.overallRisk = d.overallRisk;
        }
      });

      // us-atlas includes all counties (incl. territories). Only render counties present in
      // combined_final.csv — otherwise removed areas would still draw as shapes.
      geo.features = geo.features.filter(f => map[f.properties.fips] != null);

      if (!cancelled) {
        countyDataMap.current = map;
        allCounties.current = rawCounties;
        setGeojson(geo);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { loading, geojson, countyDataMap: countyDataMap.current, allCounties: allCounties.current };
}
