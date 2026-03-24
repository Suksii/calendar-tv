// Shared types
export type Show = { id: string; title: string };

export type EntryGuest = { id: string; name: string };

export type Entry = {
  id: string;
  show_id: string;
  show_title: string;
  date: string;
  time: string;
  duration: number | null;
  type: 'uzivo' | 'snimanje';
  host: string | null;
  guests: EntryGuest[];
};

export type EntryPayload = {
  showId: string;
  date: string;
  time: string;
  duration: number | null;
  type: 'uzivo' | 'snimanje';
  host: string | null;
  guests: { name: string }[];
};

// Base helper — throws on non-ok responses
async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Greška pri komunikaciji sa serverom.');
  }
  return res.json() as Promise<T>;
}

// ── Shows ──────────────────────────────────────────────────────────
export const getShows = () =>
  apiFetch<Show[]>('/api/shows');

// ── Entries ────────────────────────────────────────────────────────
export const getEntries = (month: string) =>
  apiFetch<Entry[]>(`/api/entries?month=${month}`);

export const createEntry = (payload: EntryPayload) =>
  apiFetch<Entry>('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const updateEntry = (id: string, payload: EntryPayload) =>
  apiFetch<Entry>(`/api/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export const deleteEntry = (id: string) =>
  apiFetch<void>(`/api/entries/${id}`, { method: 'DELETE' });
