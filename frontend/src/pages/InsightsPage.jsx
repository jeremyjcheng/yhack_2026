import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useCountyData from "../hooks/useCountyData";
import {
  buildHistogram,
  summarizeByState,
  summarizeScores,
  topN,
} from "../utils/insightsStats";

const SCORE_KEY_BY_DIMENSION = {
  overall: "overallRisk",
  heat: "heatRisk",
  flood: "floodRisk",
  wildfire: "wildfireRisk",
};

const DIMENSIONS = [
  { id: "overall", label: "Overall" },
  { id: "heat", label: "Heat" },
  { id: "flood", label: "Flood" },
  { id: "wildfire", label: "Wildfire" },
];

const PAGE_SIZE = 5;

function formatScore(value) {
  return `${Math.round((value || 0) * 100)}%`;
}

function toCountyLabel(county) {
  return `${county.name} County, ${county.state} (${county.fips})`;
}

export default function InsightsPage() {
  const { loading, allCounties } = useCountyData();
  const [selectedState, setSelectedState] = useState("All States");
  const [dimension, setDimension] = useState("overall");
  const [sortKey, setSortKey] = useState("overallRisk");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [compareAInput, setCompareAInput] = useState("");
  const [compareBInput, setCompareBInput] = useState("");
  const [compareAFips, setCompareAFips] = useState("");
  const [compareBFips, setCompareBFips] = useState("");

  const stateOptions = useMemo(() => {
    const states = new Set(allCounties.map((county) => county.state));
    return ["All States", ...Array.from(states).sort()];
  }, [allCounties]);

  const scoreKey = SCORE_KEY_BY_DIMENSION[dimension];

  const filteredCounties = useMemo(() => {
    if (selectedState === "All States") return allCounties;
    return allCounties.filter((county) => county.state === selectedState);
  }, [allCounties, selectedState]);

  const summary = useMemo(
    () => summarizeScores(filteredCounties, scoreKey),
    [filteredCounties, scoreKey],
  );
  const histogram = useMemo(
    () => buildHistogram(filteredCounties, scoreKey, 10),
    [filteredCounties, scoreKey],
  );
  const stateSummary = useMemo(
    () => summarizeByState(allCounties, scoreKey).slice(0, 15),
    [allCounties, scoreKey],
  );

  const topCounties = useMemo(
    () => topN(filteredCounties, scoreKey, 5, true),
    [filteredCounties, scoreKey],
  );
  const bottomCounties = useMemo(
    () => topN(filteredCounties, scoreKey, 5, false),
    [filteredCounties, scoreKey],
  );

  const sortedCounties = useMemo(() => {
    const counties = [...filteredCounties];
    counties.sort((a, b) => {
      const left = a[sortKey];
      const right = b[sortKey];
      const multiplier = sortDirection === "asc" ? 1 : -1;
      if (typeof left === "number" && typeof right === "number") {
        return multiplier * (left - right);
      }
      return multiplier * String(left).localeCompare(String(right));
    });
    return counties;
  }, [filteredCounties, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedCounties.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedCounties = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return sortedCounties.slice(start, start + PAGE_SIZE);
  }, [safePage, sortedCounties]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedState, dimension, sortDirection, sortKey]);

  const countyByFips = useMemo(
    () => new Map(allCounties.map((county) => [county.fips, county])),
    [allCounties],
  );

  const compareCountyA = compareAFips ? countyByFips.get(compareAFips) : null;
  const compareCountyB = compareBFips ? countyByFips.get(compareBFips) : null;

  const handleSort = (column) => {
    if (sortKey === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(column);
    setSortDirection("desc");
  };

  if (loading) {
    return (
      <main className="h-[calc(100vh-56px)] overflow-auto px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="h-8 w-52 animate-pulse rounded-md bg-app-border" />
          <div className="h-16 animate-pulse rounded-xl bg-app-surface shadow-sm" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-xl bg-app-surface shadow-sm" />
            <div className="h-72 animate-pulse rounded-xl bg-app-surface shadow-sm" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="h-[calc(100vh-56px)] overflow-auto px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Row 1: Compact header with inline filters */}
        <section className="rounded-xl bg-app-surface px-5 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold tracking-tight text-app-text">
                Insights
              </h1>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="state-filter"
                  className="text-xs font-medium text-app-muted"
                >
                  State
                </label>
                <select
                  id="state-filter"
                  className="rounded-md border border-app-border bg-white px-2 py-1.5 text-xs"
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                >
                  {stateOptions.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-lg border border-app-border bg-app-bg p-0.5">
                {DIMENSIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={[
                      "rounded-md px-2.5 py-1 text-xs font-medium transition",
                      item.id === dimension
                        ? "bg-app-primary text-white"
                        : "text-app-text hover:bg-white",
                    ].join(" ")}
                    onClick={() => {
                      setDimension(item.id);
                      setSortKey(SCORE_KEY_BY_DIMENSION[item.id]);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Link
                to="/"
                className="text-xs font-medium text-app-primary hover:underline"
              >
                Back to map
              </Link>
            </div>
          </div>
        </section>

        {/* Row 2: KPI strip */}
        <section className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Counties in view"
            value={summary.count.toLocaleString()}
          />
          <KpiCard label="Median risk" value={formatScore(summary.median)} />
          <KpiCard label="Average risk" value={formatScore(summary.mean)} />
          <KpiCard
            label="Counties >= 50%"
            value={`${summary.aboveHalfPct.toFixed(1)}%`}
          />
        </section>

        {/* Row 3: Charts side-by-side */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <ChartCard
            title={`Distribution of ${dimension} risk`}
            ariaLabel={`Histogram showing county counts by ${dimension} risk buckets`}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={histogram}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="bucket"
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 10 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {selectedState === "All States" ? (
            <ChartCard
              title={`Avg ${dimension} risk by state (top 15)`}
              ariaLabel={`Bar chart of top states by average ${dimension} risk`}
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stateSummary}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="state"
                    tick={{ fontSize: 10 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tickFormatter={formatScore} domain={[0, 1]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatScore(value)} />
                  <Bar dataKey="avgRisk" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : null}
        </div>

        {/* Row 4: Table + ranked lists, equal height */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] items-stretch">
          <section className="rounded-xl bg-app-surface p-4 shadow-sm flex flex-col">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-app-text">
                County table
              </h2>
              <span className="text-[11px] text-app-muted">
                {sortedCounties.length === 0
                  ? "No rows"
                  : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, sortedCounties.length)} of ${sortedCounties.length.toLocaleString()}`}
              </span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-app-border text-left">
                    <SortableHeader
                      label="County"
                      column="name"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="State"
                      column="state"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Heat"
                      column="heatRisk"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Flood"
                      column="floodRisk"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Fire"
                      column="wildfireRisk"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <SortableHeader
                      label="Overall"
                      column="overallRisk"
                      sortKey={sortKey}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                    />
                    <th className="px-2 py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCounties.map((county) => (
                    <tr
                      key={county.fips}
                      className="border-b border-app-border/70 hover:bg-app-bg"
                    >
                      <td className="px-2 py-1.5 font-medium text-app-text whitespace-nowrap">
                        {county.name}
                      </td>
                      <td className="px-2 py-1.5 text-app-muted">{county.state}</td>
                      <td className="px-2 py-1.5">
                        {formatScore(county.heatRisk)}
                      </td>
                      <td className="px-2 py-1.5">
                        {formatScore(county.floodRisk)}
                      </td>
                      <td className="px-2 py-1.5">
                        {formatScore(county.wildfireRisk)}
                      </td>
                      <td className="px-2 py-1.5">
                        {formatScore(county.overallRisk)}
                      </td>
                      <td className="px-2 py-1.5">
                        <Link
                          to={`/?fips=${county.fips}`}
                          className="font-medium text-app-primary hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                className="rounded-md border border-app-border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safePage <= 1}
              >
                Prev
              </button>
              <span className="text-app-muted">
                {safePage} / {totalPages}
              </span>
              <button
                type="button"
                className="rounded-md border border-app-border px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safePage >= totalPages}
              >
                Next
              </button>
            </div>
          </section>

          <RankedList
            title={`Top 5 ${dimension} risk`}
            counties={topCounties}
            scoreKey={scoreKey}
          />
          <RankedList
            title={`Bottom 5 ${dimension} risk`}
            counties={bottomCounties}
            scoreKey={scoreKey}
          />
        </div>

        {/* Row 4: Collapsible footer sections */}
        <section className="rounded-xl bg-app-surface p-4 shadow-sm">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-app-text">
              Compare counties
            </summary>
            <div className="mt-3">
              <p className="mb-3 text-xs text-app-muted">
                Start typing to search counties.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <CompareCountyInput
                  id="compare-a"
                  label="County A"
                  counties={filteredCounties}
                  inputValue={compareAInput}
                  onChange={({ input, fips }) => {
                    setCompareAInput(input);
                    setCompareAFips(fips);
                  }}
                />
                <CompareCountyInput
                  id="compare-b"
                  label="County B"
                  counties={filteredCounties}
                  inputValue={compareBInput}
                  onChange={({ input, fips }) => {
                    setCompareBInput(input);
                    setCompareBFips(fips);
                  }}
                />
              </div>
              {compareCountyA && compareCountyB ? (
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <CompareCard county={compareCountyA} />
                  <CompareCard county={compareCountyB} />
                </div>
              ) : (
                <p className="mt-2 text-xs text-app-muted">
                  Select two counties to compare risks and core climate metrics.
                </p>
              )}
            </div>
          </details>
        </section>

        <section className="rounded-xl bg-app-surface p-4 shadow-sm">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-app-text">
              How scores are computed
            </summary>
            <p className="mt-3 text-xs leading-5 text-app-muted">
              Scores are derived from county hazard-index columns in{' '}
              <code>combined_final.csv</code>. Heat uses the Heat Wave index;
              Flood combines Inland Flooding, Coastal Flooding, and Hurricane;
              Wildfire combines Wildfire and Drought. Values are converted to a
              0-1 scale from their 0-100 index scores, and overall risk is the
              average of heat, flood, and wildfire. This page is for planning
              and awareness, not insurance or regulatory decisions.
            </p>
          </details>
        </section>
      </div>
    </main>
  );
}

const MAX_COMPARE_SUGGESTIONS = 50;

function filterCountiesForCompare(counties, query) {
  const q = query.trim().toLowerCase();
  if (q.length < 1) return [];
  return counties
    .filter((county) => {
      const blob =
        `${county.name} ${county.state} ${county.fips}`.toLowerCase();
      return blob.includes(q);
    })
    .slice(0, MAX_COMPARE_SUGGESTIONS);
}

function CompareCountyInput({ id, label, counties, inputValue, onChange }) {
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(
    () => filterCountiesForCompare(counties, inputValue),
    [counties, inputValue],
  );

  const showSuggestions = open && inputValue.trim().length >= 1;

  useEffect(() => {
    const handler = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-medium text-app-muted"
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        value={inputValue}
        placeholder="Type to search counties"
        className="w-full rounded-md border border-app-border px-3 py-2 text-sm"
        onChange={(event) => {
          onChange({ input: event.target.value, fips: "" });
          setOpen(true);
        }}
        onFocus={() => {
          if (inputValue.trim().length >= 1) setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      />
      {showSuggestions ? (
        <ul
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-app-border bg-app-surface py-1 shadow-lg"
          role="listbox"
          aria-label={`${label} suggestions`}
        >
          {suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-app-muted">
              No counties match
            </li>
          ) : (
            suggestions.map((county) => (
              <li key={county.fips}>
                <button
                  type="button"
                  role="option"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-app-primary-light/70"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange({
                      input: toCountyLabel(county),
                      fips: county.fips,
                    });
                    setOpen(false);
                  }}
                >
                  <span className="font-medium text-app-text">
                    {county.name} County
                  </span>
                  <span className="text-app-muted">, {county.state}</span>
                  <span className="ml-1 text-xs text-app-muted">
                    ({county.fips})
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <article className="rounded-xl bg-app-surface px-3 py-2.5 shadow-sm">
      <p className="text-[11px] font-medium tracking-wide text-app-muted uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-bold tracking-tight text-app-text">
        {value}
      </p>
    </article>
  );
}

function ChartCard({ title, ariaLabel, children }) {
  return (
    <section
      role="img"
      aria-label={ariaLabel}
      className="rounded-xl bg-app-surface p-4 shadow-sm"
    >
      <h2 className="mb-2 text-sm font-semibold text-app-text">{title}</h2>
      {children}
    </section>
  );
}

function RankedList({ title, counties, scoreKey }) {
  return (
    <section className="rounded-xl bg-app-surface p-4 shadow-sm">
      <h2 className="mb-2 text-sm font-semibold text-app-text">{title}</h2>
      <div className="space-y-1.5">
        {counties.map((county) => (
          <div
            key={`${title}-${county.fips}`}
            className="flex items-center justify-between rounded-md border border-app-border px-2.5 py-1.5"
          >
            <div>
              <p className="text-xs font-medium text-app-text">{county.name}</p>
              <p className="text-[11px] text-app-muted">{county.state}</p>
            </div>
            <span className="text-xs font-semibold text-app-primary">
              {formatScore(county[scoreKey])}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SortableHeader({ label, column, sortKey, sortDirection, onSort }) {
  const isActive = sortKey === column;
  return (
    <th className="px-2 py-1.5">
      <button
        type="button"
        className="inline-flex items-center gap-0.5 font-medium"
        onClick={() => onSort(column)}
      >
        {label}
        <span className="text-[10px] text-app-muted">
          {isActive ? (sortDirection === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

function CompareCard({ county }) {
  return (
    <article className="rounded-lg border border-app-border bg-app-bg p-4">
      <h3 className="text-base font-semibold text-app-text">
        {county.name} County
      </h3>
      <p className="mb-3 text-sm text-app-muted">{county.state}</p>
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-app-muted">Overall risk</dt>
        <dd className="text-right font-medium">
          {formatScore(county.overallRisk)}
        </dd>
        <dt className="text-app-muted">Heat risk</dt>
        <dd className="text-right font-medium">
          {formatScore(county.heatRisk)}
        </dd>
        <dt className="text-app-muted">Flood risk</dt>
        <dd className="text-right font-medium">
          {formatScore(county.floodRisk)}
        </dd>
        <dt className="text-app-muted">Wildfire risk</dt>
        <dd className="text-right font-medium">
          {formatScore(county.wildfireRisk)}
        </dd>
        <dt className="text-app-muted">Avg high temp</dt>
        <dd className="text-right font-medium">
          {county.avg_temp_max.toFixed(1)} C
        </dd>
        <dt className="text-app-muted">Total rain</dt>
        <dd className="text-right font-medium">
          {county.total_rain.toFixed(1)} mm
        </dd>
      </dl>
    </article>
  );
}
