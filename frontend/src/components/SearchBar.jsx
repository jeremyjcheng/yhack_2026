import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { performSearch } from '../utils/search';

export default function SearchBar({ allCounties, onSelectCounty, onFlyTo }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const listboxId = 'county-search-results';

  const resultItems = useMemo(() => {
    if (!results) return [];
    if (results.type === 'counties') {
      return results.results.map(c => ({
        key: c.fips,
        label: `${c.name} County`,
        detail: c.state,
        action: () => {
          onSelectCounty(c.fips);
          setVisible(false);
          setQuery('');
          setActiveIndex(-1);
        },
      }));
    }
    if (results.type === 'places') {
      return results.results.map((p, index) => ({
        key: `${p.text}-${index}`,
        label: p.text,
        detail: p.placeName,
        action: () => {
          onFlyTo(p.center);
          setVisible(false);
          setQuery('');
          setActiveIndex(-1);
        },
      }));
    }
    return [];
  }, [results, onFlyTo, onSelectCounty]);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setResults(null);
      setVisible(false);
      setActiveIndex(-1);
      return;
    }
    const result = await performSearch(q, allCounties);
    if (result.type === 'flyTo') {
      onFlyTo(result.center);
      setResults(null);
      setVisible(false);
      setActiveIndex(-1);
    } else if (result.type === 'counties' || result.type === 'places') {
      setResults(result);
      setVisible(true);
      setActiveIndex(-1);
    } else {
      setResults(null);
      setVisible(false);
      setActiveIndex(-1);
    }
  }, [allCounties, onFlyTo]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setActiveIndex(-1);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val.trim().toLowerCase()), 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setVisible(false);
      setActiveIndex(-1);
      e.target.blur();
      return;
    }
    if (!visible || resultItems.length === 0) {
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % resultItems.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? resultItems.length - 1 : prev - 1));
      return;
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      resultItems[activeIndex]?.action();
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setVisible(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const activeOptionId =
    visible && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <div className="absolute top-3 left-1/2 z-30 w-full max-w-[600px] -translate-x-1/2 px-3 sm:px-5">
      <div className="relative" ref={wrapperRef}>
        <svg
          className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-app-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          id="county-search"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={visible}
          aria-activedescendant={activeOptionId}
          className="w-full rounded-[20px] border border-app-border bg-app-surface py-3.5 pr-4 pl-12 text-sm text-app-text shadow-lg outline-none transition focus:border-app-primary focus:ring-[3px] focus:ring-app-primary-light/80"
          placeholder="Enter ZIP code or city"
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results && resultItems.length > 0) {
              setVisible(true);
            }
          }}
        />
        {visible && resultItems.length > 0 && (
          <div
            id={listboxId}
            role="listbox"
            aria-label="Search results"
            className="absolute top-[calc(100%+6px)] right-0 left-0 max-h-72 overflow-y-auto rounded-[10px] border border-app-border bg-app-surface shadow-xl"
          >
            {resultItems.map((item, index) => (
              <button
                key={item.key}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                type="button"
                className={[
                  'flex w-full cursor-pointer items-center justify-between border-b border-app-border px-4 py-3 text-left transition last:border-b-0',
                  index === activeIndex ? 'bg-app-primary-light/90' : 'hover:bg-app-primary-light/70',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary',
                ].join(' ')}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={item.action}
              >
                <span className="text-sm font-medium text-app-text">{item.label}</span>
                <span className="pl-3 text-xs text-app-muted">{item.detail}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
