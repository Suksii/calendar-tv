import { sql } from './db';

export async function writeLog(userId: string, action: string): Promise<void> {
  const rows = (await sql`
    SELECT name FROM users WHERE id = ${userId} LIMIT 1
  `) as { name: string }[];
  const userName = rows[0]?.name ?? 'Nepoznat';

  await sql`
    INSERT INTO audit_logs (user_id, user_name, action)
    VALUES (${userId}, ${userName}, ${action})
  `;

  // Obriši logove starije od 7 dana
  await sql`DELETE FROM audit_logs WHERE created_at < now() - interval '7 days'`;
}
