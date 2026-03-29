import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <main className="h-[calc(100vh-56px)] overflow-auto px-4 py-8 sm:px-6 sm:py-10">
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1 className="!mb-3">About</h1>
        <p className="lead !mb-8 !text-app-muted">
        Climate Risk Advisor is an interactive viewer for county-level climate risk signals across
        the United States.
        </p>

        <section>
        <h2>Data</h2>
        <p>
          County boundaries come from{' '}
          <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noreferrer">
            us-atlas
          </a>{' '}
          (via jsDelivr). Risk-related fields are loaded from{' '}
          <code>combined_final.csv</code>, including county climate summaries and
          hazard index values.
        </p>
        </section>

        <section>
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

        <section>
        <h2>Disclaimer</h2>
        <p>
          This tool is for educational and exploratory use. It does not replace professional hazard
          assessments, building codes, or official emergency guidance.
        </p>
        </section>

        <p className="mt-8 border-t border-app-border pt-4">
          <Link to="/" className="font-medium no-underline hover:underline">Back to map</Link>
        </p>
      </article>
    </main>
  );
}
