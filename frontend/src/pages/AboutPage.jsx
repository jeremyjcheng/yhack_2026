/** Replace name / role for each author when ready. */
const AUTHOR_SLOTS = [
  { name: 'Name', role: 'Role or affiliation' },
  { name: 'Name', role: 'Role or affiliation' },
  { name: 'Name', role: 'Role or affiliation' },
];

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
            Climate Risk Advisor is an interactive web app for exploring county-level climate risk
            across the United States. We built it to make climate hazard data easier to understand,
            compare, and act on for local planning and awareness.
          </p>
        </header>

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
            Built for YHack 2026. Add your names and roles below.
          </p>
          <ul className="grid list-none gap-4 p-0 sm:grid-cols-3">
            {AUTHOR_SLOTS.map((slot, index) => (
              <li key={index}>
                <div className="flex min-h-[140px] flex-col justify-center rounded-xl border-2 border-dashed border-app-border/80 bg-app-surface/80 px-4 py-6 text-center shadow-inner transition-colors hover:border-app-primary/35 hover:bg-app-surface">
                  <span className="text-xs font-medium uppercase tracking-wider text-app-muted">
                    Author {index + 1}
                  </span>
                  <p
                    className={`mt-4 text-base font-medium ${slot.name === 'Name' ? 'italic text-app-muted/50' : 'text-app-text'}`}
                  >
                    {slot.name}
                  </p>
                  <p
                    className={`mt-1 text-sm ${slot.role === 'Role or affiliation' ? 'italic text-app-muted/40' : 'text-app-muted'}`}
                  >
                    {slot.role}
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
