import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { createSession } from '@/lib/session';

type UserRow = {
  id: string;
  role: 'admin' | 'viewer';
  password_hash: string;
};

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Korisničko ime i lozinka su obavezni.' }, { status: 400 });
  }

  const rows = (await sql`
    SELECT id, role, password_hash FROM users WHERE username = ${username} LIMIT 1
  `) as UserRow[];
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Pogrešno korisničko ime ili lozinka.' }, { status: 401 });
  }

  await createSession(user.id, user.role);
  return NextResponse.json({ role: user.role });
}
