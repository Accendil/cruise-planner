import { useState } from 'react';
import type { PlannerEntry, EntryStatus } from '../types/planner';

const TRIP_START = '2026-05-22';
const TRIP_END   = '2026-06-04';

function buildTripDays(): string[] {
  const days: string[] = [];
  const cur = new Date(TRIP_START + 'T12:00:00Z');
  const end = new Date(TRIP_END   + 'T12:00:00Z');
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

const TRIP_DAYS = buildTripDays();

function defaultDay(): string {
  const today = new Date().toISOString().slice(0, 10);
  return today >= TRIP_START && today <= TRIP_END ? today : TRIP_START;
}

function fmtHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

interface Props {
  entries: PlannerEntry[];
  loading: boolean;
  error: string | null;
  onStatusChange: (id: string, status: EntryStatus) => void;
  onSelect: (entry: PlannerEntry) => void;
}

export function AgendaView({ entries, loading, error, onSelect }: Props) {
  const [selectedDay, setSelectedDay] = useState(defaultDay);
  const dayIdx = TRIP_DAYS.indexOf(selectedDay);

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

  const dayEntries = entries.filter(e => {
    const d = e.startAt?.slice(0, 10) ?? e.dueDate;
    return d === selectedDay && e.status !== 'DROPPED';
  });

  const allDay = dayEntries.filter(e => !e.startAt || e.allDay);
  const timed  = dayEntries.filter(e => e.startAt && !e.allDay);

  const byHour = timed.reduce<Record<number, PlannerEntry[]>>((acc, e) => {
    const h = new Date(e.startAt!).getUTCHours();
    (acc[h] ??= []).push(e);
    return acc;
  }, {});

  const activeHours = Object.keys(byHour).map(Number);
  // Show 06:00–23:00 plus any entries outside that range
  const displayHours = [...new Set([...Array.from({ length: 18 }, (_, i) => i + 6), ...activeHours])].sort((a, b) => a - b);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Day selector */}
      <div
        className="flex items-center gap-3 px-6 md:px-10 py-3 sticky top-[97px] z-20"
        style={{ background: 'var(--cream)', borderBottom: '1px solid #e8e4da' }}
      >
        <button
          onClick={() => dayIdx > 0 && setSelectedDay(TRIP_DAYS[dayIdx - 1])}
          disabled={dayIdx === 0}
          className="text-xl px-2 leading-none disabled:opacity-30"
          style={{ color: 'var(--ocean-deep)' }}
        >
          ‹
        </button>
        <span className="flex-1 text-center text-sm font-medium" style={{ color: 'var(--ocean-deep)', fontFamily: 'var(--font-body)' }}>
          {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </span>
        <button
          onClick={() => dayIdx < TRIP_DAYS.length - 1 && setSelectedDay(TRIP_DAYS[dayIdx + 1])}
          disabled={dayIdx === TRIP_DAYS.length - 1}
          className="text-xl px-2 leading-none disabled:opacity-30"
          style={{ color: 'var(--ocean-deep)' }}
        >
          ›
        </button>
      </div>

      <div className="px-6 md:px-10 py-4 space-y-4">
        {/* All day strip */}
        {allDay.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: '#9a9590', fontFamily: 'var(--font-body)' }}>
              All day
            </p>
            <div className="space-y-1">
              {allDay.map(e => (
                <div
                  key={e.id}
                  onClick={() => onSelect(e)}
                  className="px-3 py-2 rounded text-sm cursor-pointer"
                  style={{ background: '#e8f4f8', color: 'var(--ocean-deep)', fontFamily: 'var(--font-body)', border: '1px solid #d0e8ef' }}
                >
                  {e.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {dayEntries.length === 0 && (
          <p className="text-sm py-12 text-center" style={{ color: '#c0bbb2', fontFamily: 'var(--font-body)' }}>
            Nothing scheduled for this day.
          </p>
        )}

        {/* Time grid */}
        {timed.length > 0 && (
          <div>
            {displayHours.map(h => {
              const items = byHour[h] ?? [];
              return (
                <div key={h} className="flex gap-3" style={{ minHeight: items.length ? 'auto' : 28 }}>
                  <span
                    className="w-12 shrink-0 text-xs pt-1 text-right"
                    style={{ color: items.length ? '#7a7570' : '#d4cfc6', fontFamily: 'var(--font-body)' }}
                  >
                    {fmtHour(h)}
                  </span>
                  <div
                    className="flex-1 pb-1"
                    style={{ borderLeft: `1px solid ${items.length ? '#c0bbb2' : '#e8e4da'}`, paddingLeft: 12 }}
                  >
                    {items.map(e => (
                      <div
                        key={e.id}
                        onClick={() => onSelect(e)}
                        className="px-3 py-2 rounded mb-1 text-sm cursor-pointer"
                        style={{ background: '#fff', border: '1px solid #e8e4da', color: 'var(--ocean-deep)', fontFamily: 'var(--font-body)' }}
                      >
                        <span className="text-xs mr-2" style={{ color: '#9a9590' }}>
                          {new Date(e.startAt!).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
