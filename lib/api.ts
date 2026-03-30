export type Show = { id: string; title: string };

export type EntryGuest = { id: string; name: string };

export type Channel = "RTCG1" | "RTCG2" | "SAT" | "PAR";

export type Entry = {
  id: string;
  show_id: string;
  show_title: string;
  date: string;
  time: string;
  duration: number | null;
  channel: Channel;
  type: "uzivo" | "snimanje";
  host: string | null;
  guests: EntryGuest[];
  topic: string | null;
};

export type EntryPayload = {
  showId: string;
  date: string;
  time: string;
  duration: number | null;
  channel: Channel;
  type: "uzivo" | "snimanje";
  host: string | null;
  guests: { name: string }[];
  topic: string | null;
};

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Greška pri komunikaciji sa serverom.");
  }
  return res.json() as Promise<T>;
}

export const getShows = () => apiFetch<Show[]>("/api/shows");

export const getEntries = (month: string) =>
  apiFetch<Entry[]>(`/api/entries?month=${month}`);

export const createEntry = (payload: EntryPayload) =>
  apiFetch<Entry>("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const updateEntry = (id: string, payload: EntryPayload) =>
  apiFetch<Entry>(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const deleteEntry = (id: string) =>
  apiFetch<void>(`/api/entries/${id}`, { method: "DELETE" });

export type BatchResult = {
  created: number;
  conflicts: { date: string; conflictWith: string }[];
};

export const createBatchEntries = (
  payload: Omit<EntryPayload, "date"> & { dates: string[] }
) =>
  apiFetch<BatchResult>("/api/entries/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
