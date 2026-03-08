import type { PlannerEntry, EntryStatus, TripPhase } from '../types/planner';
import { TaskList } from '../components/TaskList';
import { QuickAdd } from '../components/QuickAdd';

interface Props {
  entries: PlannerEntry[];
  loading: boolean;
  error: string | null;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
  onAdd: (title: string, phase: TripPhase) => void;
}

export function TaskListView({ entries, loading, error, onStatusChange, onSelect, onAdd }: Props) {
  return (
    <>
      <QuickAdd onAdd={onAdd} />
      {loading && (
        <div
          className="flex items-center justify-center py-20 text-sm"
          style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}
        >
          Loading your trip…
        </div>
      )}
      {error && (
        <div
          className="mx-6 mt-6 px-4 py-3 rounded text-sm"
          style={{ background: '#fee2e2', color: '#991b1b', fontFamily: 'var(--font-body)' }}
        >
          {error}
        </div>
      )}
      {!loading && !error && (
        <TaskList entries={entries} onStatusChange={onStatusChange} onSelect={onSelect} />
      )}
    </>
  );
}
