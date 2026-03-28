import { Link } from 'react-router-dom';

export default function InsightsPage() {
  return (
    <main className="static-page">
      <h1 className="static-page-title">Insights</h1>
      <p className="static-page-lead">
        Use the map to explore how climate-related risks vary across U.S. counties and to compare
        places side by side.
      </p>

      <section className="static-section">
        <h2>Reading the map</h2>
        <ul className="static-list">
          <li>
            <strong>Layer selector</strong> switches the choropleth between heat, flood, wildfire,
            and an overall combined view.
          </li>
          <li>
            <strong>Hover</strong> a county for a quick summary; <strong>click</strong> to pin the
            side panel with full metrics and recommendations.
          </li>
          <li>
            <strong>Search</strong> jumps to a county or place so you can inspect it without
            panning manually.
          </li>
        </ul>
      </section>

      <section className="static-section">
        <h2>Scores</h2>
        <p>
          County scores are derived from the indicators in the bundled dataset, normalized so you
          can compare counties on a consistent scale. They are meant for planning and awareness,
          not for insurance or legal decisions.
        </p>
      </section>

      <p className="static-back">
        <Link to="/">Back to map</Link>
      </p>
    </main>
  );
}
