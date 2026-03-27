import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) process.env[key.trim()] = rest.join("=").trim();
}

const sql = neon(process.env.DATABASE_URL!);

const name = process.env.SEED_ADMIN_NAME;
const username = process.env.SEED_ADMIN_USERNAME;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!password || !username || !name) {
  console.error(
    "Greška: SEED_ADMIN_PASSWORD, SEED_ADMIN_USERNAME, ili SEED_ADMIN_NAME nisu postavljeni u .env.local",
  );
  process.exit(1);
}

async function main() {
  const existing =
    await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
  if (existing.length > 0) {
    console.log("Admin nalog već postoji.");
    return;
  }

  const passwordHash = await bcrypt.hash(password!, 12);
  const id = crypto.randomUUID();

  await sql`
    INSERT INTO users (id, name, username, password_hash, role)
    VALUES (${id}, ${name}, ${username}, ${passwordHash}, 'admin')
  `;
}

main().catch(console.error);
