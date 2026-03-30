import { sql } from './db';
import type { Entry, Show } from './api';

export async function getEntriesForMonth(month: string): Promise<Entry[]> {
  return sql`
    SELECT e.*, s.title AS show_title,
      COALESCE(json_agg(g ORDER BY g.order) FILTER (WHERE g.id IS NOT NULL), '[]') AS guests
    FROM entries e
    JOIN shows s ON s.id = e.show_id
    LEFT JOIN guests g ON g.entry_id = e.id
    WHERE e.date LIKE ${month + '-%'}
    GROUP BY e.id, s.title
    ORDER BY e.date, e.time
  ` as unknown as Promise<Entry[]>;
}

export async function getAllShows(): Promise<Show[]> {
  return sql`SELECT id, title FROM shows ORDER BY title ASC` as unknown as Promise<Show[]>;
}

export async function getAssignedShowIds(userId: string): Promise<string[]> {
  const rows = (await sql`
    SELECT show_id FROM user_shows WHERE user_id = ${userId}
  `) as { show_id: string }[];
  return rows.map((r) => r.show_id);
}
