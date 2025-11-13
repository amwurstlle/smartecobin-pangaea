-- Create action_history table to store user actions like emptying bins
create table if not exists action_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  bin_id uuid references trash_bins(id) on delete set null,
  action text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_action_history_created_at on action_history(created_at desc);
create index if not exists idx_action_history_user on action_history(user_id);
create index if not exists idx_action_history_bin on action_history(bin_id);

alter table action_history enable row level security;
create policy "action_history_select_all" on action_history for select using (true);
create policy "action_history_insert_auth" on action_history for insert with check (true);