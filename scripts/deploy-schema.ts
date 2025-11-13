import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

async function main() {
  const sqlPath = path.resolve(process.cwd(), 'SUPABASE_SCHEMA.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error(`Schema file not found at ${sqlPath}`);
    process.exit(1);
  }
  const sql = await fs.promises.readFile(sqlPath, 'utf8');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Missing DATABASE_URL in .env. Please set it to your Supabase Postgres URI.');
    console.error('Tip: Supabase Dashboard → Project Settings → Database → Connection string → URI');
    process.exit(1);
  }

  const client = new Client({ connectionString: databaseUrl });
  console.log('Connecting to database...');
  await client.connect();
  try {
    console.log('Executing schema... this may take a minute.');
    await client.query(sql);
    console.log('✅ Schema deployed successfully');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Schema deploy failed:', err);
  process.exit(1);
});
