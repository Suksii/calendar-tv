import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Zabranjen pristup.' }, { status: 403 });

  const { id } = await params;
  await sql`DELETE FROM shows WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
