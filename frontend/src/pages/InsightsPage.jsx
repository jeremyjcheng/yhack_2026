import { Link } from 'react-router-dom';

export default function InsightsPage() {
  return (
    <main className="h-[calc(100vh-56px)] overflow-auto px-4 py-8 sm:px-6 sm:py-10">
      <article className="prose prose-slate mx-auto max-w-3xl">
        <h1 className="!mb-3">Insights</h1>
        <p className="lead !mb-8 !text-app-muted">
        Use the map to explore how climate-related risks vary across U.S. counties and to compare
        places side by side.
        </p>

        <section>
        <h2>Reading the map</h2>
        <ul>
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

        <section>
        <h2>Scores</h2>
        <p>
          County scores are derived from the indicators in the bundled dataset, normalized so you
          can compare counties on a consistent scale. They are meant for planning and awareness,
          not for insurance or legal decisions.
        </p>
        </section>

        <p className="mt-8 border-t border-app-border pt-4">
          <Link to="/" className="font-medium no-underline hover:underline">Back to map</Link>
        </p>
      </article>
    </main>
  );
}
