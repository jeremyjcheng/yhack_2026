import { useState, useEffect, useRef } from 'react';
import { feature } from 'topojson-client';
import { computeRiskBounds, computeRiskScores } from '../utils/riskScoring';

const COUNTY_TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';

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
        fetch('/county-data.json'),
      ]);

      const topoData = await topoRes.json();
      const rawCounties = await dataRes.json();

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
