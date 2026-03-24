import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

// GET /api/shows — lista svih emisija iz kataloga
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });

  const rows = await sql`SELECT id, title FROM shows ORDER BY title ASC`;
  return NextResponse.json(rows);
}

// POST /api/shows — dodaj novu emisiju u katalog
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Zabranjen pristup.' }, { status: 403 });

  const { title } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Naziv je obavezan.' }, { status: 400 });

  const existing = await sql`SELECT id FROM shows WHERE title = ${title.trim()} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json(existing[0]);
  }

  const id = crypto.randomUUID();
  await sql`INSERT INTO shows (id, title) VALUES (${id}, ${title.trim()})`;
  return NextResponse.json({ id, title: title.trim() }, { status: 201 });
}
