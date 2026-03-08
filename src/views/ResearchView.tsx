import type { PlannerEntry, EntryStatus } from '../types/planner';
import { PHASE_ORDER } from '../types/planner';
import { TaskRow } from '../components/TaskRow';

const PRIORITY_RANK: Record<string, number> = { CRITICAL: 0, IMPORTANT: 1, NICE_TO_HAVE: 2 };

interface Props {
  entries: PlannerEntry[];
  loading: boolean;
  error: string | null;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
}

export function ResearchView({ entries, loading, error, onStatusChange, onSelect }: Props) {
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

  const research = entries
    .filter(e =>
      (e.type === 'RESEARCH' || e.status === 'TO_BE_RESEARCHED') &&
      e.status !== 'DONE' && e.status !== 'DROPPED'
    )
    .sort((a, b) => {
      const pd = (PRIORITY_RANK[a.priority] ?? 2) - (PRIORITY_RANK[b.priority] ?? 2);
      if (pd !== 0) return pd;
      return PHASE_ORDER.indexOf(a.phase) - PHASE_ORDER.indexOf(b.phase);
    });

  return (
    <div className="max-w-5xl mx-auto py-6 px-6 md:px-10">
      <div className="flex items-baseline justify-between mb-4">
        <h1
          className="font-display font-semibold text-xl"
          style={{ color: 'var(--ocean-deep)' }}
        >
          Research backlog
        </h1>
        <span className="text-sm" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
          {research.length} {research.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {research.length === 0 ? (
        <p className="text-sm py-12 text-center" style={{ color: '#c0bbb2', fontFamily: 'var(--font-body)' }}>
          Nothing left to research. 🎉
        </p>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #e8e4da' }}>
          {research.map(entry => (
            <TaskRow key={entry.id} entry={entry} onStatusChange={onStatusChange} onClick={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
