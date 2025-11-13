import 'dotenv/config';
import pg from 'pg';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
  }
  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    console.log('Connected to database');
    // Ensure column exists
    await client.query(`alter table if exists public.users add column if not exists password_hash text`);
    // Drop NOT NULL if present
    await client.query(`alter table public.users alter column password_hash drop not null`);
    // Optional: set default empty string to be extra safe for future inserts
    // await client.query(`alter table public.users alter column password_hash set default ''`);
    console.log('✅ password_hash constraint relaxed');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Failed to relax password_hash:', err);
  process.exit(1);
});
