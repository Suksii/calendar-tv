import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { writeLog } from "@/lib/log";
import { findConflict } from "@/lib/entries";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Neovlašćen pristup." }, { status: 401 });

  const { dates, showId, time, duration, channel, type, host, guests: guestList, topic } =
    await request.json();

  if (!Array.isArray(dates) || dates.length === 0 || !showId || !time || !type || !channel) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 });
  }

  if (session.role !== "admin") {
    const assigned = await sql`
      SELECT 1 FROM user_shows WHERE user_id = ${session.userId} AND show_id = ${showId}
    `;
    if (assigned.length === 0) {
      return NextResponse.json({ error: "Zabranjen pristup." }, { status: 403 });
    }
  }

  const [show] = (await sql`SELECT title FROM shows WHERE id = ${showId}`) as { title: string }[];

  const conflicts: { date: string; conflictWith: string }[] = [];
  let created = 0;

  for (const date of dates as string[]) {
    const conflict = await findConflict(date, time, duration ?? null, channel);
    if (conflict) {
      conflicts.push({ date, conflictWith: conflict.show_title });
      continue;
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

    created++;
  }

  if (created > 0) {
    await writeLog(
      session.userId,
      `Dodano ${created} ponavljajućih termina za "${show?.title ?? showId}" u ${time} (${channel})`
    );
  }

  return NextResponse.json({ created, conflicts });
}
