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

export function TimelineView({ entries, loading, error, onStatusChange, onSelect }: Props) {
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

  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="relative">
        {/* Vertical spine */}
        <div
          className="absolute top-0 bottom-0 w-0.5"
          style={{ left: '2.75rem', background: '#e8e4da' }}
        />

        {PHASE_ORDER.map(phase => {
          const items = entries.filter(e => e.phase === phase && e.status !== 'DROPPED');
          const colour = PHASE_COLOURS[phase];
          const done = items.filter(e => e.status === 'DONE').length;

          return (
            <section key={phase} className="relative mb-10">
              {/* Phase node on spine */}
              <div
                className="absolute flex items-center justify-center w-5 h-5 rounded-full border-2 border-white z-10"
                style={{ left: '2rem', top: 18, background: colour }}
              />

              {/* Phase header */}
              <div className="pl-20 md:pl-24 pr-6 md:pr-10 py-3">
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display italic font-medium leading-none"
                    style={{ fontSize: '2rem', color: colour, opacity: 0.25 }}
                  >
                    {PHASE_NUMBERS[phase]}
                  </span>
                  <div>
                    <h2
                      className="font-display font-semibold"
                      style={{ fontSize: '1.1rem', color: 'var(--ocean-deep)' }}
                    >
                      {PHASE_LABELS[phase]}
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
                      {PHASE_DATES[phase]} · {items.length} items · {done} done
                    </p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: '#e8e4da', maxWidth: 200 }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${items.length ? (done / items.length) * 100 : 0}%`, background: colour }}
                  />
                </div>
              </div>

              {/* Entries */}
              {items.length > 0 && (
                <div
                  className="ml-20 md:ml-24 mr-6 md:mr-10 rounded-lg overflow-hidden"
                  style={{ border: '1px solid #e8e4da' }}
                >
                  {items.map(entry => (
                    <TaskRow
                      key={entry.id}
                      entry={entry}
                      onStatusChange={onStatusChange}
                      onClick={onSelect}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
