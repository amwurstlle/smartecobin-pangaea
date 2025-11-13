import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);

  // bcrypt hash for 'password123' with 10 rounds
  const hash = '$2b$10$N9qo8uLOickgx2ZMRZoXyejNbxb7Jdv4oXk0f6qECbAL9Yfm2bZLa';

  const emails = ['admin@example.com', 'ahmad@example.com', 'budi@example.com'];

  const { error } = await supabase
    .from('users')
    .update({ password_hash: hash })
    .in('email', emails);

  if (error) {
    console.error('Failed to update sample passwords:', error.message);
    process.exit(1);
  }

  console.log('✅ Sample user passwords updated to password123');
}

main().catch((err) => {
  console.error('Password update failed:', err);
  process.exit(1);
});
