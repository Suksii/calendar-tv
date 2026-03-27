'use server';

import { sql } from './db';
import { requireAdmin } from './dal';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { writeLog } from './log';

const USER_LIMITS = { admin: 2, viewer: 4 };

export async function addShow(title: string): Promise<{ id: string; title: string }> {
  const session = await requireAdmin();
  const [existing] = (await sql`
    SELECT id, title FROM shows WHERE title = ${title}
  `) as { id: string; title: string }[];
  if (existing) return existing;
  const [show] = (await sql`
    INSERT INTO shows (title) VALUES (${title}) RETURNING id, title
  `) as { id: string; title: string }[];
  await writeLog(session.userId, `Dodana emisija "${title}"`);
  return show;
}

export async function removeShow(showId: string): Promise<void> {
  const session = await requireAdmin();
  const [show] = (await sql`
    SELECT title FROM shows WHERE id = ${showId}
  `) as { title: string }[];
  // Briši u ispravnom redoslijedu zbog foreign key constraintova:
  // guests → entries → shows
  await sql`DELETE FROM guests WHERE entry_id IN (SELECT id FROM entries WHERE show_id = ${showId})`;
  await sql`DELETE FROM entries WHERE show_id = ${showId}`;
  await sql`DELETE FROM shows WHERE id = ${showId}`;
  if (show) await writeLog(session.userId, `Obrisana emisija "${show.title}"`);
  revalidatePath('/dashboard/shows');
}

const USERNAME_REGEX = /^[a-zA-ZšđžčćŠĐŽČĆ]+\.[a-zA-ZšđžčćŠĐŽČĆ]+$/;

export async function createUser(data: {
  name: string;
  username: string;
  password: string;
  role: 'admin' | 'viewer';
}): Promise<{ error?: string }> {
  const session = await requireAdmin();

  if (!USERNAME_REGEX.test(data.username)) {
    return { error: 'Korisničko ime mora biti u formatu ime.prezime (samo slova i tačka).' };
  }

  const [{ count }] = (await sql`
    SELECT COUNT(*)::int AS count FROM users WHERE role = ${data.role}
  `) as [{ count: number }];

  if (count >= USER_LIMITS[data.role]) {
    return { error: `Dostignut maksimum korisnika za rolu "${data.role}".` };
  }

  const [existing] = (await sql`
    SELECT id FROM users WHERE username = ${data.username}
  `) as { id: string }[];
  if (existing) return { error: 'Korisnik sa ovim korisničkim imenom već postoji.' };

  const password_hash = await bcrypt.hash(data.password, 12);
  await sql`
    INSERT INTO users (name, username, password_hash, role)
    VALUES (${data.name}, ${data.username}, ${password_hash}, ${data.role})
  `;

  const roleLabel = data.role === 'admin' ? 'administrator' : 'korisnik';
  await writeLog(session.userId, `Kreiran nalog "${data.username}" (${roleLabel})`);

  revalidatePath('/dashboard/users');
  return {};
}

export async function removeUser(userId: string): Promise<void> {
  const session = await requireAdmin();
  if (session.userId === userId) {
    throw new Error('Ne možete obrisati vlastiti nalog.');
  }

  const [target] = (await sql`
    SELECT username FROM users WHERE id = ${userId}
  `) as { username: string }[];

  const seedAdminUsername = process.env.SEED_ADMIN_USERNAME;
  if (seedAdminUsername && target?.username === seedAdminUsername) {
    throw new Error('Glavni administrator ne može biti obrisan.');
  }

  const deletedUsername = target?.username ?? userId;
  await sql`DELETE FROM users WHERE id = ${userId}`;
  await writeLog(session.userId, `Obrisan nalog "${deletedUsername}"`);
  revalidatePath('/dashboard/users');
}
