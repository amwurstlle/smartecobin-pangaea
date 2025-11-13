import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

async function main() {
  const migrationsDir = path.resolve(process.cwd(), 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations dir not found at ${migrationsDir}`);
    process.exit(1);
  }

  const files = (await fs.promises.readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No SQL migrations found.');
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL in .env');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    for (const file of files) {
      const full = path.join(migrationsDir, file);
      const sql = await fs.promises.readFile(full, 'utf8');
      console.log(`Applying migration: ${file}`);
      await client.query(sql);
      console.log(`✅ Applied ${file}`);
    }
    console.log('✅ All migrations applied');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});