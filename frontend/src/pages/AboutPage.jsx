import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main className="static-page">
      <h1 className="static-page-title">About</h1>
      <p className="static-page-lead">
        Climate Risk Advisor is an interactive viewer for county-level climate risk signals across
        the United States.
      </p>

      <section className="static-section">
        <h2>Data</h2>
        <p>
          County boundaries come from{' '}
          <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noreferrer">
            us-atlas
          </a>{' '}
          (via jsDelivr). Risk-related fields are joined from this project&apos;s{' '}
          <code>county-data.json</code> build output.
        </p>
      </section>

      <section className="static-section">
        <h2>Map</h2>
        <p>
          Basemaps and geocoding use{' '}
          <a href="https://www.mapbox.com/" target="_blank" rel="noreferrer">
            Mapbox
          </a>
          . A valid access token is required in <code>.env</code> as{' '}
          <code>MAPBOX_ACCESS_TOKEN</code>.
        </p>
      </section>

      <section className="static-section">
        <h2>Disclaimer</h2>
        <p>
          This tool is for educational and exploratory use. It does not replace professional hazard
          assessments, building codes, or official emergency guidance.
        </p>
      </section>

      <p className="static-back">
        <Link to="/">Back to map</Link>
      </p>
    </main>
  );
}
