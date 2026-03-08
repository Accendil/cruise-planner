import { useState } from 'react';
import type { TripPhase } from '../types/planner';
import { PHASE_LABELS, PHASE_ORDER } from '../types/planner';

interface Props {
  onAdd: (title: string, phase: TripPhase) => Promise<void>;
}

export function QuickAdd({ onAdd }: Props) {
  const [title,  setTitle]  = useState('');
  const [phase,  setPhase]  = useState<TripPhase>('UK_PRE_FLIGHT');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    await onAdd(title.trim(), phase);
    setTitle('');
    setSaving(false);
  };

  return (
    <div style={{ background: '#fff', borderBottom: '1px solid #e8e4da' }}>
      <form onSubmit={handleSubmit} className="flex gap-2 px-6 py-3 md:px-10 max-w-5xl mx-auto">
        <input
          type="text"
          placeholder="Add a task to the list..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={saving}
          className="flex-1 px-3 py-2 text-sm font-body rounded border focus:outline-none focus:ring-2"
          style={{
            borderColor: '#d4cfc6',
            fontFamily: 'var(--font-body)',
            background: '#faf8f3',
            color: 'var(--ocean-deep)',
            // @ts-expect-error - css var
            '--tw-ring-color': '#0c7ca8',
          }}
        />
        <select
          value={phase}
          onChange={e => setPhase(e.target.value as TripPhase)}
          disabled={saving}
          className="px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2"
          style={{
            borderColor: '#d4cfc6',
            fontFamily: 'var(--font-body)',
            background: '#faf8f3',
            color: 'var(--ocean-deep)',
          }}
        >
          {PHASE_ORDER.map(p => (
            <option key={p} value={p}>{PHASE_LABELS[p]}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="px-5 py-2 text-sm font-medium rounded transition-opacity disabled:opacity-40"
          style={{
            background: 'var(--ocean-mid)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
          }}
        >
          {saving ? '…' : '+ Add'}
        </button>
      </form>
    </div>
  );
}
