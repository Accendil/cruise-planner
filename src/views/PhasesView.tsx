import { useState } from 'react';
import type { PlannerEntry, TripPhase, EntryStatus } from '../types/planner';
import { PHASE_ORDER, PHASE_LABELS, PHASE_DATES, PHASE_NUMBERS } from '../types/planner';
import { TaskRow } from '../components/TaskRow';

const PHASE_COLOURS: Record<TripPhase, string> = {
  UK_PRE_FLIGHT:       '#475569',
  FLORIDA_PRE_CRUISE:  '#0369a1',
  FLORIDA_CRUISE:      '#0d9488',
  FLORIDA_POST_CRUISE: '#c2410c',
  UK_POST_CRUISE:      '#64748b',
};

interface Props {
  entries: PlannerEntry[];
  loading: boolean;
  error: string | null;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
}

export function PhasesView({ entries, loading, error, onStatusChange, onSelect }: Props) {
  const [expanded, setExpanded] = useState<Set<TripPhase>>(new Set(PHASE_ORDER));
  const todayStr = new Date().toISOString().slice(0, 10);

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-sm" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
      Loading your trip…
    </div>
  );
  if (error) return (
    <div className="mx-6 mt-6 px-4 py-3 rounded text-sm" style={{ background: '#fee2e2', color: '#991b1b', fontFamily: 'var(--font-body)' }}>
      {error}
    </div>
  );

  function toggle(phase: TripPhase) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(phase) ? next.delete(phase) : next.add(phase);
      return next;
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-6 md:px-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display font-semibold text-xl" style={{ color: 'var(--ocean-deep)' }}>
          Phase summary
        </h1>
        <button
          onClick={() => window.print()}
          className="text-sm px-3 py-1.5 rounded border font-medium print:hidden"
          style={{ color: 'var(--ocean-deep)', borderColor: '#d4cfc6', fontFamily: 'var(--font-body)' }}
        >
          Print itinerary
        </button>
      </div>

      <div className="space-y-4">
        {PHASE_ORDER.map(phase => {
          const items = entries.filter(e => e.phase === phase);
          const active = items.filter(e => e.status !== 'DONE' && e.status !== 'DROPPED');
          const done   = items.filter(e => e.status === 'DONE').length;
          const overdue = active.filter(e => e.dueDate && e.dueDate < todayStr).length;
          const colour = PHASE_COLOURS[phase];
          const isOpen = expanded.has(phase);

          return (
            <div
              key={phase}
              className="rounded-lg overflow-hidden print:break-inside-avoid"
              style={{ border: '1px solid #e8e4da', background: '#fff' }}
            >
              {/* Card header — also the expand toggle */}
              <button
                onClick={() => toggle(phase)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left print:pointer-events-none"
                style={{ borderLeft: `4px solid ${colour}` }}
              >
                <span
                  className="font-display italic font-medium leading-none shrink-0"
                  style={{ fontSize: '2rem', color: colour, opacity: 0.25, width: 36 }}
                >
                  {PHASE_NUMBERS[phase]}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: 'var(--ocean-deep)', fontFamily: 'var(--font-body)' }}>
                    {PHASE_LABELS[phase]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
                    {PHASE_DATES[phase]}
                  </p>
                </div>
                {/* Stats */}
                <div className="flex gap-3 text-xs shrink-0" style={{ fontFamily: 'var(--font-body)' }}>
                  <span style={{ color: '#0d9488' }}>{done} done</span>
                  <span style={{ color: '#9a9590' }}>{active.length} open</span>
                  {overdue > 0 && (
                    <span style={{ color: '#c0392b' }}>{overdue} overdue</span>
                  )}
                </div>
                <span className="text-sm print:hidden" style={{ color: '#c0bbb2' }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Progress bar */}
              <div className="h-0.5" style={{ background: '#f0ece4' }}>
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${items.length ? (done / items.length) * 100 : 0}%`,
                    background: colour,
                    opacity: 0.6,
                  }}
                />
              </div>

              {/* Entries */}
              {isOpen && (
                <div style={{ background: 'var(--cream)' }}>
                  {active.length === 0 && done > 0 ? (
                    <p className="px-5 py-3 text-sm" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
                      All done ✓
                    </p>
                  ) : (
                    items
                      .filter(e => e.status !== 'DROPPED')
                      .map(entry => (
                        <TaskRow key={entry.id} entry={entry} onStatusChange={onStatusChange} onClick={onSelect} />
                      ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
