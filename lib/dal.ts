import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { getSession, type SessionPayload } from './session';
import { sql } from './db';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'viewer';
};

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
});

export const getUser = cache(async (): Promise<UserProfile | null> => {
  const session = await getSession();
  if (!session) return null;
  const rows = (await sql`
    SELECT id, name, email, role
    FROM users
    WHERE id = ${session.userId}
    LIMIT 1
  `) as UserProfile[];
  return rows[0] ?? null;
});

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await verifySession();
  if (session.role !== 'admin') redirect('/dashboard/calendar');
  return session;
}
