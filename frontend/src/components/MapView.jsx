import { useState, useRef, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import { getLayerColorExpr } from '../utils/riskScoring';
import styles from './MapView.module.css';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MapView = forwardRef(function MapView(
  { geojson, countyDataMap, activeLayer, selectedFips, onSelectCounty, onDeselectCounty, onHover, onHoverEnd, viewState, onViewStateChange },
  ref,
) {
  const mapRef = useRef(null);
  const hoveredIdRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    flyTo(opts) {
      mapRef.current?.flyTo(opts);
    },
  }));

  const fillColor = useMemo(() => getLayerColorExpr(activeLayer), [activeLayer]);

  const fillLayer = useMemo(() => ({
    id: 'county-fills',
    type: 'fill',
    paint: {
      'fill-color': fillColor,
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false], 0.85,
        0.55,
      ],
    },
  }), [fillColor]);

  const borderLayer = useMemo(() => ({
    id: 'county-borders',
    type: 'line',
    paint: {
      'line-color': '#94a3b8',
      'line-width': 0.3,
    },
  }), []);

  const selectedFilter = useMemo(
    () => ['==', ['get', 'fips'], selectedFips || ''],
    [selectedFips],
  );

  const selectedLayer = useMemo(() => ({
    id: 'county-selected',
    type: 'line',
    paint: {
      'line-color': '#1e40af',
      'line-width': 3,
    },
    filter: selectedFilter,
  }), [selectedFilter]);

  const onMouseMove = useCallback((e) => {
    const map = mapRef.current?.getMap();
    if (!map || !e.features?.length) return;

    map.getCanvas().style.cursor = 'pointer';
    const f = e.features[0];
    const fips = f.properties.fips;

    if (hoveredIdRef.current !== null && hoveredIdRef.current !== f.id) {
      map.setFeatureState({ source: 'counties', id: hoveredIdRef.current }, { hover: false });
    }
    hoveredIdRef.current = f.id;
    map.setFeatureState({ source: 'counties', id: f.id }, { hover: true });

    const d = countyDataMap[fips];
    if (d) {
      onHover({
        x: e.point.x,
        y: e.point.y,
        county: d,
      });
    }
  }, [countyDataMap, onHover]);

  const onMouseLeave = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.getCanvas().style.cursor = '';
    if (hoveredIdRef.current !== null) {
      map.setFeatureState({ source: 'counties', id: hoveredIdRef.current }, { hover: false });
      hoveredIdRef.current = null;
    }
    onHoverEnd();
  }, [onHoverEnd]);

  const onClick = useCallback((e) => {
    if (e.features?.length) {
      onSelectCounty(e.features[0].properties.fips);
    } else {
      onDeselectCounty();
    }
  }, [onSelectCounty, onDeselectCounty]);

  const interactiveLayerIds = useMemo(() => ['county-fills'], []);

  return (
    <div className={styles.mapContainer}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => onViewStateChange(evt.viewState)}
        onLoad={() => setMapLoaded(true)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/light-v11"
        minZoom={3}
        maxZoom={12}
        interactiveLayerIds={mapLoaded && geojson ? interactiveLayerIds : undefined}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
      >
        <NavigationControl position="top-left" />
        {mapLoaded && geojson && (
          <Source id="counties" type="geojson" data={geojson} generateId>
            <Layer {...fillLayer} />
            <Layer {...borderLayer} />
            <Layer {...selectedLayer} />
          </Source>
        )}
      </Map>
    </div>
  );
});

export default MapView;
