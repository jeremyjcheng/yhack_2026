import { useState } from 'react';

export default function MapLegend({ activeLayer, onLayerChange }) {
  const [expanded, setExpanded] = useState(false);
  const layers = [
    { key: 'all', label: 'All Risks', dots: true },
    { key: 'heat', label: 'Heat Risk', color: '#ef4444', icon: 'heat' },
    { key: 'flood', label: 'Flood Risk', color: '#3b82f6', icon: 'flood' },
    { key: 'wildfire', label: 'Wildfire Risk', color: '#f97316', icon: 'wildfire' },
  ];

  return (
    <div className="pointer-events-none absolute bottom-4 left-2 z-20 sm:left-4 sm:bottom-10">
      <button
        type="button"
        className="pointer-events-auto mb-2 inline-flex items-center gap-2 rounded-lg border border-app-border bg-app-surface px-3 py-2 text-xs font-semibold uppercase tracking-wide text-app-muted shadow-md lg:hidden"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        Risk layers
        <span className="text-app-text">{expanded ? 'Hide' : 'Show'}</span>
      </button>
      <div
        className={[
          'pointer-events-auto min-w-44 rounded-[14px] border border-app-border bg-app-surface p-3.5 shadow-lg',
          expanded ? 'block' : 'hidden',
          'lg:block',
        ].join(' ')}
      >
        <h4 className="mb-2.5 text-xs font-semibold tracking-wide text-app-muted uppercase">Risk Layers</h4>
        <div className="mb-3.5 flex flex-col gap-0.5">
        {layers.map(l => (
          <button
            key={l.key}
            type="button"
            className={[
              'flex items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary',
              activeLayer === l.key
                ? 'bg-app-primary-light text-app-primary'
                : 'text-app-text hover:bg-app-bg',
            ].join(' ')}
            onClick={() => onLayerChange(l.key)}
          >
            {l.dots ? (
              <>
                <span className="h-2 w-2 rounded-full bg-risk-heat" />
                <span className="h-2 w-2 rounded-full bg-risk-flood" />
                <span className="h-2 w-2 rounded-full bg-risk-fire" />
              </>
            ) : (
              <LayerIcon type={l.icon} color={l.color} />
            )}
            {l.label}
          </button>
        ))}
        </div>
        <div className="border-t border-app-border pt-3">
          <span className="mb-1.5 block text-xs font-medium text-app-muted">Risk Level</span>
          <div className="h-2.5 rounded-full bg-gradient-to-r from-risk-low via-yellow-500 to-risk-heat" />
          <div className="mt-1 flex items-center justify-between text-[11px] text-app-muted">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayerIcon({ type, color }) {
  if (type === 'heat') {
    return (
      <svg className="legend-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
      </svg>
    );
  }
  if (type === 'flood') {
    return (
      <svg className="legend-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2l-2 7h4l-2 7"/>
        <path d="M4 18c1.5-1.5 3-2 4.5-2s3 .5 4.5 2c1.5-1.5 3-2 4.5-2s3 .5 4.5 2" strokeLinecap="round"/>
      </svg>
    );
  }
  return (
    <svg className="legend-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 22c-4-4-8-7.5-8-12a8 8 0 0116 0c0 4.5-4 8-8 12z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}
