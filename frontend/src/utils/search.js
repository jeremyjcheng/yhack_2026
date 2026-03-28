const GEOCODE_PREFIX = '/api/mapbox';

export async function performSearch(query, allCounties) {
  const localMatches = allCounties
    .filter(c => c.name.toLowerCase().includes(query) || c.state.toLowerCase().includes(query))
    .slice(0, 6);

  if (localMatches.length > 0) {
    return { type: 'counties', results: localMatches };
  }

  if (/^\d{5}$/.test(query)) {
    try {
      const url = `${GEOCODE_PREFIX}/geocoding/v5/mapbox.places/${query}.json?country=us&types=postcode`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.features?.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { type: 'flyTo', center: [lng, lat] };
      }
    } catch (_) { /* fall through */ }
  }

  try {
    const url = `${GEOCODE_PREFIX}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=us&types=place&limit=5`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      return {
        type: 'places',
        results: data.features.map(f => ({
          text: f.text,
          placeName: f.place_name.split(', ').slice(1).join(', '),
          center: f.center,
        })),
      };
    }
  } catch (_) { /* fall through */ }

  return { type: 'empty' };
}
