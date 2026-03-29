import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const tabClass = ({ isActive }) =>
    [
      'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none',
      'focus-visible:ring-2 focus-visible:ring-app-surface/90 focus-visible:ring-offset-2 focus-visible:ring-offset-app-primary',
      isActive
        ? 'bg-white/20 text-white'
        : 'text-white/75 hover:bg-white/15 hover:text-white',
    ].join(' ');

  return (
    <nav className="relative z-50 flex h-14 items-center justify-between bg-app-primary px-3 text-white shadow-md sm:px-6">
      <Link
        to="/"
        className="inline-flex min-w-0 items-center gap-2 rounded-md px-1 py-1 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-surface/90 focus-visible:ring-offset-2 focus-visible:ring-offset-app-primary"
      >
        <div className="shrink-0">
          <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2"/>
            <path d="M10 20 Q16 8 22 20" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M8 18 Q16 6 24 18" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5"/>
          </svg>
        </div>
        <span className="hidden truncate text-base font-semibold tracking-tight sm:block">
          Climate Risk Advisor
        </span>
        <span className="truncate text-sm font-semibold tracking-tight sm:hidden">
          Climate Risk
        </span>
      </Link>
      <div className="flex items-center gap-1">
        <NavLink to="/" end className={tabClass}>
          Welcome
        </NavLink>
        <NavLink to="/map" className={tabClass}>
          Map
        </NavLink>
        <NavLink to="/insights" className={tabClass}>
          Insights
        </NavLink>
        <NavLink to="/about" className={tabClass}>
          About
        </NavLink>
      </div>
    </nav>
  );
}
