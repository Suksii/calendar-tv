import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

// Load .env.local manually
for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
}

const sql = neon(process.env.DATABASE_URL!);

const name = 'Administrator';
const email = 'admin@tv.me';
const password = 'admin123';

async function main() {
  const existing = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`;
  if (existing.length > 0) {
    console.log('Admin nalog već postoji.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();

  await sql`
    INSERT INTO users (id, name, email, password_hash, role)
    VALUES (${id}, ${name}, ${email}, ${passwordHash}, 'admin')
  `;

  console.log('Admin nalog kreiran:');
  console.log(`  Email:    ${email}`);
  console.log(`  Lozinka:  ${password}`);
  console.log('Promijenite lozinku nakon prve prijave!');
}

main().catch(console.error);
