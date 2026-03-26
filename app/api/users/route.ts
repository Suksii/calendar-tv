import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Neovlašćen pristup." }, { status: 401 });
  if (session.role !== "admin")
    return NextResponse.json({ error: "Zabranjen pristup." }, { status: 403 });

  const rows = await sql`
    SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC
  `;
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return NextResponse.json({ error: "Neovlašćen pristup." }, { status: 401 });
  if (session.role !== "admin")
    return NextResponse.json({ error: "Zabranjen pristup." }, { status: 403 });

  const { name, email, password, role } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Ime, email i lozinka su obavezni." },
      { status: 400 },
    );
  }

  const existing =
    await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Korisnik s tim emailom već postoji." },
      { status: 409 },
    );
  }

  const targetRole = role === "admin" ? "admin" : "viewer";
  const LIMITS = { admin: 2, viewer: 4 };

  const [{ count }] =
    (await sql`SELECT COUNT(*)::int AS count FROM users WHERE role = ${targetRole}`) as [
      { count: number },
    ];
  if (count >= LIMITS[targetRole]) {
    const label = targetRole === "admin" ? "administratora" : "korisnika";
    return NextResponse.json(
      {
        error: `Dostigli ste maksimalni broj ${label} (${LIMITS[targetRole]}).`,
      },
      { status: 422 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();

  await sql`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (${userId}, ${name}, ${email}, ${passwordHash}, ${role ?? "viewer"})
  `;

  return NextResponse.json({ id: userId }, { status: 201 });
}
