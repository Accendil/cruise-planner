import type { PlannerEntry } from '../types/planner';

const BASE = '/api';

export async function fetchEntries(): Promise<PlannerEntry[]> {
  const res = await fetch(`${BASE}/entries`);
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json() as Promise<PlannerEntry[]>;
}

export async function createEntry(entry: Omit<PlannerEntry, 'id'>): Promise<PlannerEntry> {
  const res = await fetch(`${BASE}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to create entry');
  return res.json() as Promise<PlannerEntry>;
}

export async function updateEntry(id: string, patch: Partial<PlannerEntry>): Promise<PlannerEntry> {
  const res = await fetch(`${BASE}/entries/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error('Failed to update entry');
  return res.json() as Promise<PlannerEntry>;
}

export async function deleteEntry(id: string): Promise<void> {
  const res = await fetch(`${BASE}/entries/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete entry');
}

export async function seedEntries(entries: PlannerEntry[]): Promise<void> {
  const res = await fetch(`${BASE}/seed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entries),
  });
  if (!res.ok) throw new Error('Seed failed');
}
