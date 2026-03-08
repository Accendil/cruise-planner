import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { PlannerEntry, EntryStatus, TripPhase } from './types/planner';
import { useEntries } from './hooks/useEntries';
import { HeroHeader } from './components/HeroHeader';
import { TabBar } from './components/TabBar';
import { NotesPanel } from './components/NotesPanel';
import { TodayView } from './views/TodayView';
import { AgendaView } from './views/AgendaView';
import { TaskListView } from './views/TaskListView';
import { TimelineView } from './views/TimelineView';
import { ResearchView } from './views/ResearchView';
import { PhasesView } from './views/PhasesView';

export default function App() {
  const { entries, loading, error, add, update } = useEntries();
  const [selected, setSelected] = useState<PlannerEntry | null>(null);

  const handleStatusChange = (id: string, status: EntryStatus) => {
    void update(id, { status });
  };

  const handleSave = async (id: string, patch: Partial<PlannerEntry>) => {
    await update(id, patch);
  };

  const handleAdd = (title: string, phase: TripPhase) => add(title, phase);

  const viewProps = { entries, loading, error, onStatusChange: handleStatusChange, onSelect: setSelected };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
        <HeroHeader />
        <TabBar />
        <main style={{ paddingBottom: '4rem' }}>
          <Routes>
            <Route path="/"         element={<TodayView    {...viewProps} />} />
            <Route path="/agenda"   element={<AgendaView   {...viewProps} />} />
            <Route path="/tasks"    element={<TaskListView {...viewProps} onAdd={handleAdd} />} />
            <Route path="/timeline" element={<TimelineView {...viewProps} />} />
            <Route path="/research" element={<ResearchView {...viewProps} />} />
            <Route path="/phases"   element={<PhasesView   {...viewProps} />} />
          </Routes>
        </main>
        <NotesPanel
          entry={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
        />
      </div>
    </BrowserRouter>
  );
}
