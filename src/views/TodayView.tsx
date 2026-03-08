import type { PlannerEntry, EntryStatus } from '../types/planner';
import { PHASE_ORDER, PHASE_LABELS } from '../types/planner';
import { TaskRow } from '../components/TaskRow';

interface Props {
  entries: PlannerEntry[];
  loading: boolean;
  error: string | null;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function cutoffStr() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

export function TodayView({ entries, loading, error, onStatusChange, onSelect }: Props) {
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

  const today  = todayStr();
  const cutoff = cutoffStr();

  const comingUp = entries
    .filter(e => {
      const date = e.startAt?.slice(0, 10) ?? e.dueDate;
      return date && date >= today && date <= cutoff
        && e.status !== 'DONE' && e.status !== 'DROPPED';
    })
    .sort((a, b) => {
      const da = a.startAt?.slice(0, 10) ?? a.dueDate ?? '';
      const db = b.startAt?.slice(0, 10) ?? b.dueDate ?? '';
      return da.localeCompare(db);
    });

  const actionRequired = entries.filter(e =>
    e.status === 'INBOX' || e.status === 'TO_BE_RESEARCHED' || e.status === 'WAITING'
  );

  const actionByPhase = PHASE_ORDER.reduce<Record<string, PlannerEntry[]>>((acc, phase) => {
    const items = actionRequired.filter(e => e.phase === phase);
    if (items.length) acc[phase] = items;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto py-6 px-6 md:px-10 space-y-8">
      {/* Coming up */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}
        >
          Coming up · next 14 days
        </h2>
        {comingUp.length === 0 ? (
          <p className="text-sm" style={{ color: '#c0bbb2', fontFamily: 'var(--font-body)' }}>
            Nothing scheduled in the next 14 days.
          </p>
        ) : (
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e8e4da' }}>
            {comingUp.map(entry => (
              <TaskRow key={entry.id} entry={entry} onStatusChange={onStatusChange} onClick={onSelect} />
            ))}
          </div>
        )}
      </section>

      {/* Action required */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}
        >
          Action required
        </h2>
        {Object.keys(actionByPhase).length === 0 ? (
          <p className="text-sm" style={{ color: '#c0bbb2', fontFamily: 'var(--font-body)' }}>
            Nothing needs attention right now.
          </p>
        ) : (
          <div className="space-y-4">
            {PHASE_ORDER.filter(p => actionByPhase[p]).map(phase => (
              <div key={phase}>
                <p className="text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>
                  {PHASE_LABELS[phase]}
                </p>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e8e4da' }}>
                  {actionByPhase[phase].map(entry => (
                    <TaskRow key={entry.id} entry={entry} onStatusChange={onStatusChange} onClick={onSelect} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
