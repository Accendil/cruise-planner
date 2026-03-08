import { useState, useEffect, useCallback } from 'react';
import type { PlannerEntry } from '../types/planner';
import { fetchEntries, createEntry, updateEntry, seedEntries } from '../api/client';
import seedData from '../data/seed.json';

export function useEntries() {
  const [entries, setEntries] = useState<PlannerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEntries();
      if (data.length === 0) {
        await seedEntries(seedData as PlannerEntry[]);
        const seeded = await fetchEntries();
        setEntries(seeded);
      } else {
        setEntries(data);
      }
    } catch {
      setError('Could not connect. Is the API running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const add = useCallback(async (title: string, phase: PlannerEntry['phase']) => {
    const created = await createEntry({
      title, phase,
      type: 'TASK', status: 'INBOX',
      confidence: 'NEEDS_CONFIRMING',
      owner: 'UNASSIGNED',
      priority: 'NICE_TO_HAVE',
    });
    setEntries(prev => [...prev, created]);
  }, []);

  const update = useCallback(async (id: string, patch: Partial<PlannerEntry>) => {
    const updated = await updateEntry(id, patch);
    setEntries(prev => prev.map(e => e.id === id ? updated : e));
  }, []);

  return { entries, loading, error, add, update, reload: load };
}
