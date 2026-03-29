const AUTHOR_SLOTS = [
  {
    name: "Jeremy Cheng",
    role: "Developer",
    college: "UC San Diego",
    year: "Junior",
    linkedin: "https://www.linkedin.com/in/jeremy-cheng-8978881b7/",
    github: "https://github.com/jeremyjcheng",
  },
  {
    name: "Eric Wang",
    role: "Developer",
    college: "Yale University",
    year: "Junior",
    linkedin: "https://www.linkedin.com/in/ericwang343/",
    github: "https://github.com/ImJustEric",
  },
  {
    name: "Cole Haynes",
    role: "Developer",
    college: "Yale University",
    year: "Junior",
    linkedin: "https://www.linkedin.com/in/cole-haynes-837403259/",
    github: "https://github.com/coleh44",
  },
];

const TECH_STACK = [
  {
    category: "Front End",
    items: ["React", "Vite", "Tailwind CSS", "Mapbox GL"],
  },
  {
    category: "Back End",
    items: ["Python", "FastAPI", "Uvicorn", "Event Registry API"],
  },
  {
    category: "ML",
    items: ["Gemini API", "Lava API", "FAISS similarity search", "Risk-scoring pipeline"],
  },
];

const FEATURES = [
  {
    title: "Interactive County Map",
    description:
      "Explore climate risk for every U.S. county with hover tooltips, click-to-select details, and fly-to navigation across heat, flood, and wildfire layers.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
        />
      </svg>
    ),
  },
  {
    title: "AI Recommendations",
    description:
      "Get hazard-specific recommendations powered by Gemini and grounded in real-time news context from Event Registry for any selected county.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
        />
      </svg>
    ),
  },
  {
    title: "Climate Risk Chatbot",
    description:
      "Ask questions grounded in FEMA NRI documentation and real county data. The RAG pipeline retrieves relevant methodology and statistics for data-backed answers.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
    ),
  },
  {
    title: "Insights Dashboard",
    description:
      "Analyze national trends with KPI cards, risk histograms, state rankings, top/bottom county lists, sortable tables, and side-by-side county comparisons.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
    ),
  },
  {
    title: "Similar County Search",
    description:
      "Find counties with comparable risk profiles using FAISS nearest-neighbor search over normalized hazard feature vectors.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
        />
      </svg>
    ),
  },
  {
    title: "Multi-Hazard Scoring",
    description:
      "View composite and per-hazard risk scores for heat waves, inland/coastal flooding, hurricanes, wildfires, and drought using FEMA NRI methodology.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z"
        />
      </svg>
    ),
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Select a County",
    description:
      "Click any county on the interactive map or use the search bar to find a specific county, city, or ZIP code.",
  },
  {
    step: "2",
    title: "Explore Risk Data",
    description:
      "View heat, flood, and wildfire risk scores alongside weather metrics, demographics, and expected annual loss figures.",
  },
  {
    step: "3",
    title: "Get AI Insights",
    description:
      "Read AI-generated recommendations grounded in recent news, or ask the chatbot questions backed by FEMA methodology and real data.",
  },
];

const DATA_SOURCES = [
  {
    name: "FEMA National Risk Index",
    url: "https://hazards.fema.gov/nri/",
    description:
      "Hazard risk scores, expected annual loss, exposure, and historic loss ratios for every U.S. county.",
  },
  {
    name: "FEMA NRI Technical Documentation",
    description:
      "Detailed methodology PDF used by the RAG chatbot to explain risk scoring and hazard calculations.",
  },
  {
    name: "US Atlas (TopoJSON)",
    url: "https://github.com/topojson/us-atlas",
    description:
      "County boundary geometries rendered on the interactive map via jsDelivr CDN.",
  },
  {
    name: "Event Registry",
    url: "https://eventregistry.org/",
    description:
      "Real-time news API providing context for AI-generated county recommendations.",
  },
];

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function renderNameTwoLines(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/);
  if (parts.length < 2) {
    return (
      <>
        {name}
        <br />
        &nbsp;
      </>
    );
  }
  const firstLine = parts.slice(0, -1).join(" ");
  const secondLine = parts[parts.length - 1];
  return (
    <>
      {firstLine}
      <br />
      {secondLine}
    </>
  );
}

export default function AboutPage() {
  return (
    <main className="relative h-[calc(100vh-56px)] overflow-auto bg-app-bg">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-app-primary-light/80 to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
        {/* Hero header */}
        <header className="relative mb-10 overflow-hidden rounded-2xl border border-app-border bg-app-surface/95 p-8 shadow-md ring-1 ring-app-primary/10 backdrop-blur-sm sm:p-10">
          <div
            className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-app-primary/10 blur-2xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-8 left-1/4 h-24 w-48 rounded-full bg-app-primary-light/40 blur-2xl"
            aria-hidden
          />
          <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-app-primary">
                Climate Risk Advisor
              </p>
              <h1 className="mb-4 text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
                About
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-app-muted">
                Climate Risk Advisor is an interactive web app for exploring
                county-level climate risk across the United States. We built it
                to make climate hazard data easier to understand, compare, and
                act on for local planning and awareness.
              </p>
            </div>
            <div className="hidden sm:flex sm:flex-col sm:items-center sm:gap-2">
              <img
                src="/yale_dog.png"
                alt="YHack 2026"
                className="h-20 w-20 rounded-2xl object-contain"
              />
              <span className="text-xs font-medium text-app-muted">
                YHack 2026
              </span>
            </div>
          </div>
        </header>

        {/* Features grid */}
        <section
          className="mt-10 rounded-2xl border border-app-border bg-app-surface p-8 shadow-sm sm:p-10"
          aria-labelledby="about-features-heading"
        >
          <h2
            id="about-features-heading"
            className="mb-2 text-xl font-semibold tracking-tight text-app-text"
          >
            Features
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-app-muted">
            Key capabilities that make Climate Risk Advisor a comprehensive tool
            for understanding and acting on climate hazard data.
          </p>
          <ul className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <li key={feature.title}>
                <div className="group flex h-full flex-col rounded-xl border border-app-border/80 bg-app-bg/70 p-5 transition-all hover:-translate-y-0.5 hover:border-app-primary/30 hover:shadow-md">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-app-primary/10 text-app-primary transition-colors group-hover:bg-app-primary/15">
                    {feature.icon}
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold text-app-text">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-app-muted">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section
          className="mt-10 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-app-primary-light/20 p-8 shadow-sm sm:p-10"
          aria-labelledby="about-how-heading"
        >
          <h2
            id="about-how-heading"
            className="mb-2 text-xl font-semibold tracking-tight text-app-text"
          >
            How It Works
          </h2>
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-app-muted">
            Three steps to go from curiosity to actionable climate insight.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-primary text-lg font-bold text-white shadow-sm">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-1 text-sm font-semibold text-app-text">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-app-muted">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack + Data sources side by side */}
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {/* Tech stack */}
          <section
            className="rounded-2xl border border-app-border bg-app-surface p-8 shadow-sm sm:p-10"
            aria-labelledby="about-tech-stack-heading"
          >
            <h2
              id="about-tech-stack-heading"
              className="mb-2 text-xl font-semibold tracking-tight text-app-text"
            >
              Tech Stack
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-app-muted">
              Core technologies powering the frontend, backend, and machine
              learning workflow.
            </p>
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {TECH_STACK.map((group) => (
                <li key={group.category}>
                  <div className="h-full rounded-xl border border-app-border/80 bg-app-bg/70 p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-app-primary">
                      {group.category}
                    </h3>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-app-muted">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Data sources */}
          <section
            className="rounded-2xl border border-app-border bg-app-surface p-8 shadow-sm sm:p-10"
            aria-labelledby="about-data-heading"
          >
            <h2
              id="about-data-heading"
              className="mb-2 text-xl font-semibold tracking-tight text-app-text"
            >
              Data Sources
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-app-muted">
              Authoritative datasets and APIs backing the risk analysis.
            </p>
            <ul className="space-y-4">
              {DATA_SOURCES.map((source) => (
                <li
                  key={source.name}
                  className="rounded-xl border border-app-border/80 bg-app-bg/70 p-5"
                >
                  <h3 className="text-sm font-semibold text-app-text">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-app-primary/40 underline-offset-2 transition-colors hover:text-app-primary"
                      >
                        {source.name}
                      </a>
                    ) : (
                      source.name
                    )}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-app-muted">
                    {source.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Authors */}
        <section
          className="mt-10 rounded-2xl border border-app-border bg-gradient-to-br from-app-surface to-app-primary-light/30 p-8 shadow-sm sm:p-10"
          aria-labelledby="about-authors-heading"
        >
          <h2
            id="about-authors-heading"
            className="mb-2 text-xl font-semibold tracking-tight text-app-text"
          >
            Authors
          </h2>
          <p className="mb-8 max-w-xl text-sm leading-relaxed text-app-muted">
            Built for YHack 2026.
          </p>
          <ul className="grid list-none gap-4 p-0 sm:grid-cols-3">
            {AUTHOR_SLOTS.map((slot, index) => (
              <li key={index}>
                <div className="flex min-h-[220px] flex-col items-center rounded-xl border border-app-border/80 bg-app-surface/90 px-5 py-6 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-app-primary/35 hover:shadow-md">
                  <p
                    className={`text-[1.85rem] font-semibold leading-tight ${slot.name === "Name" ? "italic text-app-muted/50" : "text-app-text"}`}
                  >
                    {renderNameTwoLines(slot.name)}
                  </p>
                  <p className="mt-2 rounded-full bg-app-primary-light/40 px-3 py-1 text-xs font-medium tracking-wide text-app-primary">
                    {slot.role}
                  </p>
                  <div className="mt-4 w-full border-t border-app-border/70 pt-4">
                    <p className="text-base text-app-muted">{slot.college}</p>
                    <p className="mt-1 text-sm text-app-muted">{slot.year}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-center gap-2 pt-4">
                    {slot.linkedin && (
                      <a
                        href={slot.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-app-border px-3 py-1.5 text-xs font-medium text-app-muted transition-colors hover:border-app-primary/40 hover:text-app-primary"
                        aria-label={`${slot.name} on LinkedIn`}
                      >
                        <LinkedInIcon />
                        LinkedIn
                      </a>
                    )}
                    {slot.github && (
                      <a
                        href={slot.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 rounded-full border border-app-border px-3 py-1.5 text-xs font-medium text-app-muted transition-colors hover:border-app-primary/40 hover:text-app-primary"
                        aria-label={`${slot.name} on GitHub`}
                      >
                        <GitHubIcon />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Disclaimer footer */}
        <footer className="mt-10 rounded-2xl border border-app-border bg-app-surface/60 px-8 py-6 text-center text-xs leading-relaxed text-app-muted">
          This project is intended for educational and exploratory analysis. It
          does not replace official risk assessments, engineering evaluations,
          insurance guidance, or emergency management directives.
        </footer>
      </div>
    </main>
  );
}
