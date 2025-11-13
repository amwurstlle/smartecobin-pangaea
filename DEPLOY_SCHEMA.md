# How to Deploy the Database Schema to Supabase

Your Supabase project needs the database schema (users, trash_bins, notifications tables) to be created. Follow these steps:

## Step 1: Open Supabase Dashboard
1. Go to https://supabase.com
2. Sign in with your account
3. Click on your project: **"qsikmiewoeaxgqohymjl"**

## Step 2: Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** (top right)

## Step 3: Copy and Paste the Schema (Fresh Setup)
1. Open the file `SUPABASE_SCHEMA.sql` from your project root
2. Copy **ALL** the SQL code
3. Paste it into the SQL Editor in Supabase
4. Click **"Run"** button (bottom right, or press Ctrl+Enter)

## If You Already Have Tables (Legacy Structure)
If your database already has tables and you see errors like `column "field_officer_id" does not exist` or `column "name" does not exist`, run the migration below first. It will add the columns expected by the backend without deleting your data.

1. Open the file `migrations/001_add_missing_columns.sql` in this repo
2. Copy ALL SQL inside it
3. Paste into Supabase SQL Editor and click Run (safe to run multiple times)
4. After that, you can re-run parts of `SUPABASE_SCHEMA.sql` if you want sample data

## Step 4: Verify Tables Were Created
1. Click **"Table Editor"** in the left sidebar
2. You should see three new tables:
   - `users`
   - `trash_bins`
   - `notifications`

## Step 5: Test Registration
1. Go back to your application at `http://127.0.0.1:5000`
2. Try registering a new user with:
   - Full Name: Asyamaura
   - Email: asyamaw@gmail.com
   - Password: password123
   - Phone: +62 89765443

It should now work! ✅

---

## If You Get an Error During SQL Deployment

If the SQL fails with an error like "table already exists", you can:
1. Click **"Table Editor"** 
2. For each table that exists, click the menu and select **"Delete Table"**
3. Then run the SQL again

---

## Troubleshooting

**Error: "column users.name does not exist"**
- This means the `users` table exists but is missing the `name` column
- Delete the table and run the full schema SQL again

**Error: "Relation does not exist"**
- One of the tables doesn't exist
- Run the full schema SQL again

**The schema runs but registration still fails**
- Clear your browser cache (Ctrl+Shift+Delete)
- Restart the dev server (`npm run dev`)
- Try registering again
