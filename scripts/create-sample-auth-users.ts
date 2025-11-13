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

  const samples = [
    { email: 'admin@example.com', name: 'Admin User', phone: '+62812345678' },
    { email: 'ahmad@example.com', name: 'Officer Ahmad', phone: '+62812345679' },
    { email: 'budi@example.com', name: 'Budi Santoso', phone: '+62812345680' },
  ];

  for (const s of samples) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: s.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { name: s.name, phone: s.phone },
    } as any);

    if (error) {
      // If user already exists, ignore
      if (!String(error.message || '').toLowerCase().includes('already registered')) {
        console.warn(`Failed to create auth user ${s.email}:`, error.message);
      } else {
        console.log(`Auth user already exists: ${s.email}`);
      }
    } else {
      console.log(`Created auth user: ${s.email} (${data.user?.id})`);
    }
  }

  console.log('✅ Sample auth users ensured');
}

main().catch((err) => {
  console.error('Seeding auth users failed:', err);
  process.exit(1);
});
