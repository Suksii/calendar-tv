import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sql } from '@/lib/db';
import { writeLog } from '@/lib/log';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });

  const { id } = await params;
  const rows = await sql`
    SELECT e.*, s.title AS show_title,
      COALESCE(json_agg(g ORDER BY g.order) FILTER (WHERE g.id IS NOT NULL), '[]') AS guests
    FROM entries e
    JOIN shows s ON s.id = e.show_id
    LEFT JOIN guests g ON g.entry_id = e.id
    WHERE e.id = ${id}
    GROUP BY e.id, s.title
  `;
  if (!rows[0]) return NextResponse.json({ error: 'Termin nije pronađen.' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Zabranjen pristup.' }, { status: 403 });

  const { id } = await params;
  const { showId, date, time, duration, channel, type, host, guests: guestList, topic } = await request.json();

  if (!showId || !date || !time || !type || !channel) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 });
  }

  await sql`
    UPDATE entries
    SET show_id = ${showId}, date = ${date}, time = ${time}, duration = ${duration ?? null},
        channel = ${channel}, type = ${type}, host = ${host ?? null}, topic = ${topic ?? null}, updated_at = NOW()
    WHERE id = ${id}
  `;

  await sql`DELETE FROM guests WHERE entry_id = ${id}`;
  if (Array.isArray(guestList)) {
    for (let i = 0; i < guestList.length; i++) {
      const name = guestList[i]?.name?.trim();
      if (name) {
        await sql`INSERT INTO guests (id, entry_id, name, "order") VALUES (${crypto.randomUUID()}, ${id}, ${name}, ${i})`;
      }
    }
  }

  const [show] = (await sql`SELECT title FROM shows WHERE id = ${showId}`) as { title: string }[];
  await writeLog(session.userId, `Ažuriran termin "${show?.title ?? showId}" — ${date} ${time} (${channel})`);

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Neovlašćen pristup.' }, { status: 401 });
  if (session.role !== 'admin') return NextResponse.json({ error: 'Zabranjen pristup.' }, { status: 403 });

  const { id } = await params;
  const [entry] = (await sql`
    SELECT s.title, e.date, e.time, e.channel
    FROM entries e JOIN shows s ON s.id = e.show_id
    WHERE e.id = ${id}
  `) as { title: string; date: string; time: string; channel: string }[];

  await sql`DELETE FROM entries WHERE id = ${id}`;

  await writeLog(session.userId, `Obrisan termin "${entry?.title ?? id}" — ${entry?.date} ${entry?.time} (${entry?.channel})`);

  return NextResponse.json({ ok: true });
}
