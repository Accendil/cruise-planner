import type { PlannerEntry, TripPhase, EntryStatus } from '../types/planner';
import { PHASE_ORDER, PHASE_LABELS, PHASE_NUMBERS, PHASE_DATES } from '../types/planner';
import { TaskRow } from './TaskRow';

const PHASE_COLOURS: Record<TripPhase, string> = {
  UK_PRE_FLIGHT:       '#475569',
  FLORIDA_PRE_CRUISE:  '#0369a1',
  FLORIDA_CRUISE:      '#0d9488',
  FLORIDA_POST_CRUISE: '#c2410c',
  UK_POST_CRUISE:      '#64748b',
};

// One small floating polaroid per phase section (rotated, positioned in the section header)
const PHASE_PHOTOS: Partial<Record<TripPhase, { src: string; rotate: number }>> = {
  FLORIDA_CRUISE:      { src: '/images/caribbean.jpg', rotate: -2.5 },
  FLORIDA_POST_CRUISE: { src: '/images/family-2.jpg',  rotate:  3.1 },
};

interface Props {
  entries: PlannerEntry[];
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
}

export function TaskList({ entries, onStatusChange, onSelect }: Props) {
  const byPhase = PHASE_ORDER.reduce<Record<TripPhase, PlannerEntry[]>>((acc, phase) => {
    acc[phase] = entries.filter(e => e.phase === phase && e.status !== 'DROPPED');
    return acc;
  }, {} as Record<TripPhase, PlannerEntry[]>);

  return (
    <div className="max-w-5xl mx-auto">
      {PHASE_ORDER.map(phase => {
        const items = byPhase[phase];
        if (items.length === 0) return null;
        const colour = PHASE_COLOURS[phase];
        const photo  = PHASE_PHOTOS[phase];
        const done   = items.filter(e => e.status === 'DONE').length;

        return (
          <section key={phase} className={`phase-${phase}`}>
            {/* Phase header */}
            <div
              className="relative flex items-center gap-4 px-6 md:px-10 py-4"
              style={{ borderLeft: `4px solid ${colour}`, background: '#fff', borderBottom: '1px solid #e8e4da' }}
            >
              {/* Chapter number */}
              <span
                className="font-display italic font-medium text-4xl leading-none shrink-0"
                style={{ color: colour, opacity: 0.35, width: 40 }}
              >
                {PHASE_NUMBERS[phase]}
              </span>

              <div className="flex-1 min-w-0">
                <h2
                  className="font-display font-semibold leading-tight"
                  style={{ fontSize: '1.25rem', color: 'var(--ocean-deep)', fontFamily: 'var(--font-display)' }}
                >
                  {PHASE_LABELS[phase]}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
                  {PHASE_DATES[phase]} · {items.length} items · {done} done
                </p>
              </div>

              {/* Optional decorative polaroid in header */}
              {photo && (
                <div
                  className="photo-frame hidden lg:block shrink-0"
                  style={{
                    position: 'relative',
                    width: 56,
                    height: 52,
                    transform: `rotate(${photo.rotate}deg)`,
                    flexShrink: 0,
                  }}
                >
                  <img src={photo.src} alt="" draggable={false} />
                </div>
              )}

              {/* Progress bar */}
              <div
                className="absolute bottom-0 left-0 h-0.5 transition-all"
                style={{ width: `${items.length ? (done / items.length) * 100 : 0}%`, background: colour, opacity: 0.6 }}
              />
            </div>

            {/* Task rows */}
            <div style={{ background: 'var(--cream)' }}>
              {items.map(entry => (
                <TaskRow
                  key={entry.id}
                  entry={entry}
                  onStatusChange={onStatusChange}
                  onClick={onSelect}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
