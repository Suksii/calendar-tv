import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Zabranjen pristup.' }, { status: 403 });

  const { id } = await params;
  const rows = await sql`SELECT show_id FROM user_shows WHERE user_id = ${id}`;
  return NextResponse.json(rows.map((r: { show_id: string }) => r.show_id));
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Zabranjen pristup.' }, { status: 403 });

  const { id } = await params;
  const { showIds }: { showIds: string[] } = await request.json();

  await sql`DELETE FROM user_shows WHERE user_id = ${id}`;

  for (const showId of showIds) {
    await sql`INSERT INTO user_shows (user_id, show_id) VALUES (${id}, ${showId})`;
  }

  return NextResponse.json({ ok: true });
}
