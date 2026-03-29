import RiskBars from './RiskBars';
import StatsGrid from './StatsGrid';
import Recommendations from './Recommendations';
import SimilarCounties from './SimilarCounties';

export default function SidePanel({ county, allCounties, onClose, onSelectCounty }) {
  return (
    <>
      <div
        className={[
          'absolute inset-0 z-30 bg-slate-950/30 transition-opacity duration-300 lg:hidden',
          county ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
      />
      <aside
        aria-hidden={!county}
        className={[
          'absolute top-0 right-0 z-40 h-full w-full overflow-y-auto bg-app-surface shadow-[-4px_0_20px_rgba(0,0,0,0.1)]',
          'transition-transform duration-300 ease-out motion-reduce:transition-none md:w-[420px]',
          county ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <button
          type="button"
          aria-label="Close details panel"
          className="sticky top-0 float-right z-10 mt-3 mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-app-bg text-2xl leading-none text-app-muted transition-colors hover:bg-app-border hover:text-app-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
          onClick={onClose}
        >
          &times;
        </button>
        {county ? (
          <div className="px-6 pt-14 pb-8">
            <div className="mb-6 border-b border-app-border pb-4">
              <h2 className="text-3xl font-bold tracking-tight leading-tight">{county.name} County</h2>
              <p className="mt-1 text-sm text-app-muted">{county.state}</p>
            </div>

            <section className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-app-muted uppercase">
                Risk Assessment
              </h3>
              <RiskBars county={county} />
            </section>

            <section className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-app-muted uppercase">
                Key Statistics
              </h3>
              <StatsGrid county={county} />
            </section>

            <section className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-app-muted uppercase">
                Recommended Actions
              </h3>
              <Recommendations county={county} />
            </section>

            <section className="mb-6">
              <h3 className="mb-3 text-xs font-semibold tracking-wide text-app-muted uppercase">
                Similar Counties
              </h3>
              <SimilarCounties county={county} allCounties={allCounties} onSelect={onSelectCounty} />
            </section>
          </div>
        ) : null}
      </aside>
    </>
  );
}
