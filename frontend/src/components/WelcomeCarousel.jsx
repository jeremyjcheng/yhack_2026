import { useCallback, useEffect } from 'react';

/**
 * @typedef {{ image: string; title: string; description: string; imageAlt?: string }} WelcomeSlide
 */

/**
 * @param {{ slides: WelcomeSlide[]; index: number; setIndex: import('react').Dispatch<import('react').SetStateAction<number>> }} props
 */
export default function WelcomeCarousel({ slides, index, setIndex }) {
  const n = slides.length;
  const safeIndex = ((index % n) + n) % n;

  const go = useCallback(
    (delta) => {
      setIndex((i) => (i + delta + n) % n);
    },
    [n, setIndex],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  useEffect(() => {
    /* Longer than enter animations (~2.5s) so each slide is readable before advancing */
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % n);
    }, 6000);
    return () => window.clearInterval(id);
  }, [safeIndex, n, setIndex]);

  const prevIdx = (safeIndex - 1 + n) % n;
  const nextIdx = (safeIndex + 1) % n;
  const current = slides[safeIndex];

  return (
    <div className="w-full max-w-3xl">
      <div
        className="relative flex min-h-[min(52vh,420px)] items-center justify-center gap-0 sm:min-h-[380px]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Welcome slides"
      >
        {/* Left peek */}
        <button
          type="button"
          onClick={() => go(-1)}
          className="group relative z-0 hidden w-[26%] min-w-0 shrink cursor-pointer rounded-2xl border border-app-border/80 bg-indigo-100/90 shadow-sm transition-[transform,box-shadow,filter] duration-[1.8s] ease-[cubic-bezier(0.33,1,0.68,1)] hover:-translate-x-0.5 hover:brightness-95 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 sm:block"
          aria-label="Previous slide"
        >
          <div
            key={prevIdx}
            className="welcome-carousel-animate-peek aspect-[4/5] w-full overflow-hidden rounded-2xl"
          >
            <img
              src={slides[prevIdx].image}
              alt=""
              className="h-full w-full object-cover opacity-85 transition-opacity duration-[1.8s]"
              draggable={false}
            />
          </div>
          <span
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-white drop-shadow-md"
            aria-hidden
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </span>
        </button>

        {/* Center (active) */}
        <div className="relative z-10 mx-0 w-full max-w-md shrink-0 px-2 sm:-mx-2 sm:w-[48%] sm:max-w-none">
          <div
            key={safeIndex}
            className="welcome-carousel-animate-main overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-xl ring-1 ring-black/5 transition-[box-shadow] duration-300 ease-out sm:hover:shadow-2xl"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img
                src={current.image}
                alt={current.imageAlt ?? ''}
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
            <div className="space-y-2 p-5 text-left">
              <h2 className="text-lg font-semibold tracking-tight text-app-text sm:text-xl">
                {current.title}
              </h2>
              <p className="text-sm leading-relaxed text-app-muted sm:text-[15px]">{current.description}</p>
            </div>
          </div>
        </div>

        {/* Right peek */}
        <button
          type="button"
          onClick={() => go(1)}
          className="group relative z-0 hidden w-[26%] min-w-0 shrink cursor-pointer rounded-2xl border border-app-border/80 bg-indigo-100/90 shadow-sm transition-[transform,box-shadow,filter] duration-[1.8s] ease-[cubic-bezier(0.33,1,0.68,1)] hover:translate-x-0.5 hover:brightness-95 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2 sm:block"
          aria-label="Next slide"
        >
          <div
            key={nextIdx}
            className="welcome-carousel-animate-peek aspect-[4/5] w-full overflow-hidden rounded-2xl"
          >
            <img
              src={slides[nextIdx].image}
              alt=""
              className="h-full w-full object-cover opacity-85 transition-opacity duration-[1.8s]"
              draggable={false}
            />
          </div>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-white drop-shadow-md"
            aria-hidden
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </span>
        </button>

        {/* Mobile arrows overlay */}
        <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-1 sm:hidden">
          <button
            type="button"
            onClick={() => go(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-app-text shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
            aria-label="Previous slide"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-app-text shadow-md backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
            aria-label="Next slide"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
