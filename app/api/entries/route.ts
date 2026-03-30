import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { writeLog } from "@/lib/log";
import { findConflict } from "@/lib/entries";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Neovlašćen pristup." }, { status: 401 });

  const month = request.nextUrl.searchParams.get("month");

  const rows = month
    ? await sql`
        SELECT e.*, s.title AS show_title,
          COALESCE(json_agg(g ORDER BY g.order) FILTER (WHERE g.id IS NOT NULL), '[]') AS guests
        FROM entries e
        JOIN shows s ON s.id = e.show_id
        LEFT JOIN guests g ON g.entry_id = e.id
        WHERE e.date LIKE ${month + "-%"}
        GROUP BY e.id, s.title
        ORDER BY e.date, e.time
      `
    : await sql`
        SELECT e.*, s.title AS show_title,
          COALESCE(json_agg(g ORDER BY g.order) FILTER (WHERE g.id IS NOT NULL), '[]') AS guests
        FROM entries e
        JOIN shows s ON s.id = e.show_id
        LEFT JOIN guests g ON g.entry_id = e.id
        GROUP BY e.id, s.title
        ORDER BY e.date DESC, e.time
      `;

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Neovlašćen pristup." }, { status: 401 });
  const {
    showId,
    date,
    time,
    duration,
    channel,
    type,
    host,
    guests: guestList,
    topic,
  } = await request.json();

  if (!showId || !date || !time || !type || !channel) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 });
  }

  if (session.role !== "admin") {
    const assigned = (await sql`
      SELECT 1 FROM user_shows WHERE user_id = ${session.userId} AND show_id = ${showId}
    `);
    if (assigned.length === 0) {
      return NextResponse.json({ error: "Zabranjen pristup." }, { status: 403 });
    }
  }

  const conflict = await findConflict(date, time, duration ?? null, channel);
  if (conflict) {
    return NextResponse.json(
      { error: `Konflikt: "${conflict.show_title}" već zauzima ovaj termin u ${conflict.time} (${channel}).` },
      { status: 409 },
    );
  }

  const id = crypto.randomUUID();
  await sql`
    INSERT INTO entries (id, show_id, date, time, duration, channel, type, host, topic, created_by)
    VALUES (${id}, ${showId}, ${date}, ${time}, ${duration ?? null}, ${channel}, ${type}, ${host ?? null}, ${topic ?? null}, ${session.userId})
  `;

  if (Array.isArray(guestList)) {
    for (let i = 0; i < guestList.length; i++) {
      const name = guestList[i]?.name?.trim();
      if (name) {
        await sql`INSERT INTO guests (id, entry_id, name, "order") VALUES (${crypto.randomUUID()}, ${id}, ${name}, ${i})`;
      }
    }
  }

  const [show] = (await sql`SELECT title FROM shows WHERE id = ${showId}`) as { title: string }[];
  await writeLog(session.userId, `Dodan termin "${show?.title ?? showId}" — ${date} ${time} (${channel})`);

  return NextResponse.json({ id }, { status: 201 });
}
