import { useState, useRef, useEffect, useCallback } from 'react';
import { performSearch } from '../utils/search';
import styles from './SearchBar.module.css';

export default function SearchBar({ allCounties, onSelectCounty, onFlyTo }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback(async (q) => {
    if (q.length < 2) {
      setVisible(false);
      return;
    }
    const result = await performSearch(q, allCounties);
    if (result.type === 'flyTo') {
      onFlyTo(result.center);
      setVisible(false);
    } else if (result.type === 'counties' || result.type === 'places') {
      setResults(result);
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [allCounties, onFlyTo]);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val.trim().toLowerCase()), 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setVisible(false);
      e.target.blur();
    }
  };

  const handleCountyClick = (fips) => {
    onSelectCounty(fips);
    setVisible(false);
    setQuery('');
  };

  const handlePlaceClick = (center) => {
    onFlyTo(center);
    setVisible(false);
    setQuery('');
  };

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setVisible(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.wrapper} ref={wrapperRef}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter ZIP code or city"
          autoComplete="off"
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />
        {visible && results && (
          <div className={styles.results}>
            {results.type === 'counties' && results.results.map(c => (
              <div key={c.fips} className={styles.resultItem} onClick={() => handleCountyClick(c.fips)}>
                <span className={styles.resultName}>{c.name} County</span>
                <span className={styles.resultState}>{c.state}</span>
              </div>
            ))}
            {results.type === 'places' && results.results.map((p, i) => (
              <div key={i} className={styles.resultItem} onClick={() => handlePlaceClick(p.center)}>
                <span className={styles.resultName}>{p.text}</span>
                <span className={styles.resultState}>{p.placeName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
