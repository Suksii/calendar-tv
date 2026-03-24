'use server';

import { sql } from './db';
import { requireAdmin } from './dal';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

const USER_LIMITS = { admin: 2, viewer: 4 };

export async function addShow(title: string): Promise<{ id: string; title: string }> {
  await requireAdmin();
  const [existing] = (await sql`
    SELECT id, title FROM shows WHERE title = ${title}
  `) as { id: string; title: string }[];
  if (existing) return existing;
  const [show] = (await sql`
    INSERT INTO shows (title) VALUES (${title}) RETURNING id, title
  `) as { id: string; title: string }[];
  return show;
}

export async function removeShow(showId: string): Promise<void> {
  await requireAdmin();
  // Briši u ispravnom redoslijedu zbog foreign key constraintova:
  // guests → entries → shows
  await sql`DELETE FROM guests WHERE entry_id IN (SELECT id FROM entries WHERE show_id = ${showId})`;
  await sql`DELETE FROM entries WHERE show_id = ${showId}`;
  await sql`DELETE FROM shows WHERE id = ${showId}`;
  revalidatePath('/dashboard/shows');
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'viewer';
}): Promise<{ error?: string }> {
  await requireAdmin();

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM users WHERE role = ${data.role}
  `) as [{ count: number }];

  if (count >= USER_LIMITS[data.role]) {
    return { error: `Dostignut maksimum korisnika za rolu "${data.role}".` };
  }

  const [existing] = (await sql`
    SELECT id FROM users WHERE email = ${data.email}
  `) as { id: string }[];
  if (existing) return { error: 'Korisnik sa ovim emailom već postoji.' };

  const password_hash = await bcrypt.hash(data.password, 12);
  await sql`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${data.name}, ${data.email}, ${password_hash}, ${data.role})
  `;

  revalidatePath('/dashboard/users');
  return {};
}

export async function removeUser(userId: string): Promise<void> {
  const session = await requireAdmin();
  if (session.userId === userId) {
    throw new Error('Ne možete obrisati vlastiti nalog.');
  }
  await sql`DELETE FROM users WHERE id = ${userId}`;
  revalidatePath('/dashboard/users');
}
