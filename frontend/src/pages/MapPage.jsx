import { useState, useCallback, useRef } from 'react';
import useCountyData from '../hooks/useCountyData';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import MapLegend from '../components/MapLegend';
import SidePanel from '../components/SidePanel';
import HoverTooltip from '../components/HoverTooltip';
import LoadingOverlay from '../components/LoadingOverlay';

export default function MapPage() {
  const { loading, geojson, countyDataMap, allCounties } = useCountyData();

  const [selectedFips, setSelectedFips] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all');
  const [hoverInfo, setHoverInfo] = useState(null);
  const [viewState, setViewState] = useState({
    longitude: -96,
    latitude: 38,
    zoom: 4,
  });

  const mapRef = useRef(null);

  const selectedCounty = selectedFips ? countyDataMap[selectedFips] : null;

  const handleSelectCounty = useCallback((fips) => {
    setSelectedFips(fips);
    const d = countyDataMap[fips];
    if (d) {
      mapRef.current?.flyTo({ center: [d.lon, d.lat], zoom: 7, duration: 1000 });
    }
  }, [countyDataMap]);

  const handleDeselectCounty = useCallback(() => {
    setSelectedFips(null);
  }, []);

  const handleFlyTo = useCallback((center) => {
    mapRef.current?.flyTo({ center, zoom: 9, duration: 1200 });
  }, []);

  const handleHover = useCallback((info) => {
    setHoverInfo(info);
  }, []);

  const handleHoverEnd = useCallback(() => {
    setHoverInfo(null);
  }, []);

  return (
    <>
      <div className="main-content">
        <SearchBar
          allCounties={allCounties}
          onSelectCounty={handleSelectCounty}
          onFlyTo={handleFlyTo}
        />
        <MapView
          ref={mapRef}
          geojson={geojson}
          countyDataMap={countyDataMap}
          activeLayer={activeLayer}
          selectedFips={selectedFips}
          onSelectCounty={handleSelectCounty}
          onDeselectCounty={handleDeselectCounty}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          viewState={viewState}
          onViewStateChange={setViewState}
        />
        <MapLegend activeLayer={activeLayer} onLayerChange={setActiveLayer} />
        <SidePanel
          county={selectedCounty}
          allCounties={allCounties}
          onClose={handleDeselectCounty}
          onSelectCounty={handleSelectCounty}
        />
        <HoverTooltip hoverInfo={hoverInfo} />
      </div>
      <LoadingOverlay visible={loading} />
    </>
  );
}
