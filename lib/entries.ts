import { sql } from './db';

type ConflictResult = {
  show_title: string;
  time: string;
  duration: number | null;
} | null;

/**
 * Provjerava da li postoji preklapanje termina na istom kanalu i datumu.
 * excludeId se koristi pri ažuriranju (da se ignoruje sam termin).
 */
export async function findConflict(
  date: string,
  time: string,
  duration: number | null,
  channel: string,
  excludeId?: string,
): Promise<ConflictResult> {
  const dur = duration ?? 1;

  const rows = excludeId
    ? (await sql`
        SELECT s.title AS show_title, e.time, e.duration
        FROM entries e
        JOIN shows s ON s.id = e.show_id
        WHERE e.date = ${date}
          AND e.channel = ${channel}
          AND e.id != ${excludeId}
          AND (
            ${time}::time < (e.time::time + make_interval(mins => COALESCE(e.duration, 1)))
            AND e.time::time < (${time}::time + make_interval(mins => ${dur}))
          )
        LIMIT 1
      `)
    : (await sql`
        SELECT s.title AS show_title, e.time, e.duration
        FROM entries e
        JOIN shows s ON s.id = e.show_id
        WHERE e.date = ${date}
          AND e.channel = ${channel}
          AND (
            ${time}::time < (e.time::time + make_interval(mins => COALESCE(e.duration, 1)))
            AND e.time::time < (${time}::time + make_interval(mins => ${dur}))
          )
        LIMIT 1
      `);

  return (rows[0] as ConflictResult) ?? null;
}
