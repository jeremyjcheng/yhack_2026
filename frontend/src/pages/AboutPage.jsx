/** Replace name / role for each author when ready. */
const AUTHOR_SLOTS = [
  {
    name: "Jeremy Cheng",
    role: "Developer",
    college: "UC San Diego",
    year: "Junior",
  },
  {
    name: "Eric Wang",
    role: "Developer",
    college: "Yale University",
    year: "Junior",
  },
  {
    name: "Cole Haynes",
    role: "Developer",
    college: "Yale University",
    year: "Junior",
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
    items: ["Gemini API", "FAISS similarity search", "Risk-scoring pipeline"],
  },
];

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
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <header className="relative mb-10 overflow-hidden rounded-2xl border border-app-border bg-app-surface/95 p-8 shadow-md ring-1 ring-app-primary/10 backdrop-blur-sm sm:p-10">
          <div
            className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-app-primary/10 blur-2xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-8 left-1/4 h-24 w-48 rounded-full bg-app-primary-light/40 blur-2xl"
            aria-hidden
          />
          <p className="relative mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-app-primary">
            Climate Risk Advisor
          </p>
          <h1 className="relative mb-4 text-3xl font-bold tracking-tight text-app-text sm:text-4xl">
            About
          </h1>
          <p className="relative max-w-2xl text-lg leading-relaxed text-app-muted">
            Climate Risk Advisor is an interactive web app for exploring
            county-level climate risk across the United States. We built it to
            make climate hazard data easier to understand, compare, and act on
            for local planning and awareness.
          </p>
        </header>

        <section
          className="mt-10 rounded-2xl border border-app-border bg-app-surface p-8 shadow-sm sm:p-10"
          aria-labelledby="about-tech-stack-heading"
        >
          <h2
            id="about-tech-stack-heading"
            className="mb-2 text-xl font-semibold tracking-tight text-app-text"
          >
            Tech Stack
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-app-muted">
            Core technologies used to build Climate Risk Advisor across the
            frontend, backend, and machine learning workflow.
          </p>
          <ul className="grid list-none gap-4 p-0 sm:grid-cols-3">
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
                    <p
                      className={`text-base ${slot.college === "Add college" ? "italic text-app-muted/40" : "text-app-muted"}`}
                    >
                      {slot.college}
                    </p>
                    <p
                      className={`mt-1 text-sm ${slot.year === "Add year" ? "italic text-app-muted/40" : "text-app-muted"}`}
                    >
                      {slot.year}
                    </p>
                  </div>
                  <p className="mt-auto pt-4 text-xs tracking-wide text-app-muted/70">
                    YHack 2026
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
