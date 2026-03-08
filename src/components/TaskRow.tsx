import type { PlannerEntry, EntryStatus } from '../types/planner';
import { STATUS_OPTIONS, STATUS_LABELS } from '../types/planner';

const OWNER_STYLE: Record<string, { bg: string; color: string }> = {
  RYAN:       { bg: '#1e3a5f', color: '#e0eeff' },
  ZOE:        { bg: '#7c3a60', color: '#ffe0f0' },
  BOTH:       { bg: '#1a5c52', color: '#d0f5ee' },
  UNASSIGNED: { bg: '#d4cfc6', color: '#6b6560' },
};

function fmtEst(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const TYPE_ICONS: Record<string, string> = {
  TASK: '✓', TRAVEL: '✈', BOOKING: '📋', ITINERARY: '🗓',
  RESEARCH: '🔍', DOCUMENT: '📄', NOTE: '📝', BUFFER: '⏱',
};

interface Props {
  entry: PlannerEntry;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onClick: (entry: PlannerEntry) => void;
}

export function TaskRow({ entry, onStatusChange, onClick }: Props) {
  const ownerStyle = OWNER_STYLE[entry.owner] ?? OWNER_STYLE.UNASSIGNED;
  const isDone = entry.status === 'DONE' || entry.status === 'DROPPED';

  return (
    <div
      onClick={() => onClick(entry)}
      className="flex items-center gap-3 px-6 md:px-10 py-2.5 cursor-pointer transition-colors"
      style={{
        borderBottom: '1px solid #f0ece4',
        background: 'transparent',
        opacity: isDone ? 0.5 : 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f5f2ec')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {/* Type icon */}
      <span className="text-sm w-5 text-center shrink-0" style={{ color: '#9a9590' }}>
        {TYPE_ICONS[entry.type] ?? '•'}
      </span>

      {/* Title */}
      <span
        className="flex-1 text-sm font-body truncate"
        style={{
          color: 'var(--ocean-deep)',
          textDecoration: isDone ? 'line-through' : 'none',
          fontFamily: 'var(--font-body)',
        }}
      >
        {entry.title}
      </span>

      {/* Estimated time */}
      {entry.estimatedMinutes != null && (
        <span className="text-xs shrink-0 hidden sm:block" style={{ color: '#c0bbb2' }}>
          {fmtEst(entry.estimatedMinutes)}
        </span>
      )}

      {/* Due date */}
      {entry.dueDate && (
        <span
          className="text-xs shrink-0 hidden sm:block"
          style={{ color: entry.dueDate < new Date().toISOString().slice(0, 10) ? '#c0392b' : '#9a9590' }}
        >
          {entry.dueDate}
        </span>
      )}

      {/* Owner badge */}
      <span
        className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 hidden sm:block"
        style={{ background: ownerStyle.bg, color: ownerStyle.color, fontSize: '0.65rem', fontFamily: 'var(--font-body)' }}
      >
        {entry.owner}
      </span>

      {/* Status pill - inline select, stop propagation so click doesn't open panel */}
      <div onClick={e => e.stopPropagation()} className="shrink-0">
        <select
          value={entry.status}
          onChange={e => onStatusChange(entry.id, e.target.value as EntryStatus)}
          className={`text-xs px-2 py-0.5 rounded-full border-0 font-medium cursor-pointer focus:outline-none status-${entry.status}`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
