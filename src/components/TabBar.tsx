import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/',         label: 'Today',    end: true },
  { to: '/agenda',   label: 'Agenda',   end: false },
  { to: '/tasks',    label: 'Tasks',    end: false },
  { to: '/timeline', label: 'Timeline', end: false },
  { to: '/research', label: 'Research', end: false },
  { to: '/phases',   label: 'Phases',   end: false },
];

export function TabBar() {
  return (
    <nav
      className="sticky top-0 z-30 flex overflow-x-auto"
      style={{ background: 'var(--ocean-deep)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
    >
      {TABS.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="shrink-0 px-5 py-3 text-sm font-medium transition-colors"
          style={({ isActive }) => ({
            color: isActive ? '#06b6d4' : 'rgba(255,255,255,0.55)',
            borderBottom: isActive ? '2px solid #06b6d4' : '2px solid transparent',
            fontFamily: 'var(--font-body)',
          })}
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
