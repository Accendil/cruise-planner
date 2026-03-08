import { useState, useEffect, useRef } from 'react';
import type { PlannerEntry, EntryStatus, Owner, Confidence, Priority } from '../types/planner';
import { STATUS_OPTIONS, STATUS_LABELS, PHASE_LABELS } from '../types/planner';

interface Props {
  entry: PlannerEntry | null;
  onClose: () => void;
  onSave: (id: string, patch: Partial<PlannerEntry>) => Promise<void>;
}

const FIELD_STYLE = {
  fontFamily: 'var(--font-body)',
  background: '#faf8f3',
  borderColor: '#d4cfc6',
  color: 'var(--ocean-deep)',
  fontSize: '0.85rem',
} as const;

export function NotesPanel({ entry, onClose, onSave }: Props) {
  const [notes,      setNotes]      = useState('');
  const [status,     setStatus]     = useState<EntryStatus>('INBOX');
  const [owner,      setOwner]      = useState<Owner>('UNASSIGNED');
  const [confidence, setConfidence] = useState<Confidence>('NEEDS_CONFIRMING');
  const [priority,   setPriority]   = useState<Priority>('NICE_TO_HAVE');
  const [dueDate,    setDueDate]    = useState('');
  const [saving,     setSaving]     = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (entry) {
      setNotes(entry.notes ?? '');
      setStatus(entry.status);
      setOwner(entry.owner);
      setConfidence(entry.confidence);
      setPriority(entry.priority);
      setDueDate(entry.dueDate ?? '');
    }
  }, [entry]);

  // Animate open
  useEffect(() => {
    if (entry && panelRef.current) {
      panelRef.current.style.transform = 'translateX(100%)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (panelRef.current) {
            panelRef.current.style.transform = 'translateX(0)';
          }
        });
      });
    }
  }, [entry]);

  if (!entry) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(entry.id, {
      notes,
      status,
      owner,
      confidence,
      priority,
      dueDate: dueDate || undefined,
    });
    setSaving(false);
    onClose();
  };

  const selectClass = 'w-full px-2 py-1.5 rounded border focus:outline-none focus:ring-1';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(7,24,40,0.45)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 h-full z-50 flex flex-col overflow-y-auto"
        style={{
          width: 'min(420px, 100vw)',
          background: '#fff',
          boxShadow: '-4px 0 32px rgba(7,24,40,0.2)',
          transform: 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-start justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: '1px solid #e8e4da', background: 'var(--ocean-deep)' }}
        >
          <div className="pr-4">
            <p className="text-xs mb-1" style={{ color: '#06b6d4', fontFamily: 'var(--font-body)', letterSpacing: '0.1em' }}>
              {PHASE_LABELS[entry.phase].toUpperCase()}
            </p>
            <h2
              className="font-display italic font-medium leading-snug text-white"
              style={{ fontSize: '1.3rem' }}
            >
              {entry.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none shrink-0 mt-0.5"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 px-5 py-5 flex flex-col gap-4" style={{ background: 'var(--cream)' }}>

          {/* 2-col grid of selects */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as EntryStatus)} className={selectClass} style={FIELD_STYLE}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>Owner</label>
              <select value={owner} onChange={e => setOwner(e.target.value as Owner)} className={selectClass} style={FIELD_STYLE}>
                {(['RYAN','ZOE','BOTH','UNASSIGNED'] as Owner[]).map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>Confidence</label>
              <select value={confidence} onChange={e => setConfidence(e.target.value as Confidence)} className={selectClass} style={FIELD_STYLE}>
                {(['IDEA','NEEDS_CONFIRMING','CONFIRMED'] as Confidence[]).map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className={selectClass} style={FIELD_STYLE}>
                {(['CRITICAL','IMPORTANT','NICE_TO_HAVE'] as Priority[]).map(p => (
                  <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className={`${selectClass} col-span-2`}
                style={{ ...FIELD_STYLE, width: '100%' }}
              />
            </div>
          </div>

          {/* Reference info (read-only) */}
          {(entry.bookingRef || entry.location || entry.startAt) && (
            <div
              className="rounded p-3 text-xs space-y-1"
              style={{ background: '#f0ece4', fontFamily: 'var(--font-body)', color: '#5a5550' }}
            >
              {entry.bookingRef && <p><span className="font-semibold">Ref:</span> {entry.bookingRef}</p>}
              {entry.location   && <p><span className="font-semibold">Location:</span> {entry.location}</p>}
              {entry.startAt    && <p><span className="font-semibold">From:</span> {new Date(entry.startAt).toLocaleString()}</p>}
              {entry.endAt      && <p><span className="font-semibold">To:</span> {new Date(entry.endAt).toLocaleString()}</p>}
            </div>
          )}

          {/* Notes textarea */}
          <div className="flex flex-col flex-1">
            <label className="block text-xs font-medium mb-1" style={{ color: '#7a7570', fontFamily: 'var(--font-body)' }}>Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={6}
              placeholder="Add notes, links, reminders..."
              className="w-full px-3 py-2 rounded border resize-none focus:outline-none focus:ring-1 flex-1"
              style={{ ...FIELD_STYLE, minHeight: 140 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4" style={{ borderTop: '1px solid #e8e4da', background: '#fff' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded font-medium text-sm transition-opacity disabled:opacity-50"
            style={{ background: 'var(--ocean-mid)', color: '#fff', fontFamily: 'var(--font-body)' }}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  );
}
