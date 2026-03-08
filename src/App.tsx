import { useState } from 'react';
import type { PlannerEntry, EntryStatus, TripPhase } from './types/planner';
import { useEntries } from './hooks/useEntries';
import { HeroHeader } from './components/HeroHeader';
import { QuickAdd } from './components/QuickAdd';
import { TaskList } from './components/TaskList';
import { NotesPanel } from './components/NotesPanel';

export default function App() {
  const { entries, loading, error, add, update } = useEntries();
  const [selected, setSelected] = useState<PlannerEntry | null>(null);

  const handleAdd = (title: string, phase: TripPhase) => add(title, phase);

  const handleStatusChange = (id: string, status: EntryStatus) => {
    void update(id, { status });
  };

  const handleSave = async (id: string, patch: Partial<PlannerEntry>) => {
    await update(id, patch);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <HeroHeader />
      <QuickAdd onAdd={handleAdd} />

      <main style={{ paddingBottom: '4rem' }}>
        {loading && (
          <div
            className="flex items-center justify-center py-20 font-body text-sm"
            style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}
          >
            Loading your trip…
          </div>
        )}
        {error && (
          <div
            className="mx-6 mt-6 px-4 py-3 rounded text-sm font-body"
            style={{ background: '#fee2e2', color: '#991b1b', fontFamily: 'var(--font-body)' }}
          >
            {error}
          </div>
        )}
        {!loading && !error && (
          <TaskList
            entries={entries}
            onStatusChange={handleStatusChange}
            onSelect={setSelected}
          />
        )}
      </main>

      <NotesPanel
        entry={selected}
        onClose={() => setSelected(null)}
        onSave={handleSave}
      />
    </div>
  );
}
