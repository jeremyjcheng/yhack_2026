import { useEffect, useState } from 'react';

export default function LoadingOverlay({ visible }) {
  const [statusText, setStatusText] = useState('Loading climate data...');

  useEffect(() => {
    setStatusText(visible ? 'Loading climate data...' : 'Climate data loaded.');
  }, [visible]);

  return (
    <>
      <div className="sr-only" role="status" aria-live="polite">
        {statusText}
      </div>
      {visible ? (
        <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white/92 backdrop-blur-sm">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-app-border border-t-app-primary" />
          <p className="mt-4 text-sm font-medium text-app-muted">Loading climate data...</p>
        </div>
      ) : null}
    </>
  );
}
