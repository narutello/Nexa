-- Nexa chat, presence, reporting, and moderation schema.
-- Per-user ids are TEXT to match Better Auth / the preview dev user.

create table if not exists profiles (
  user_id text primary key references "user" ("id") on delete cascade,
  display_name text not null,
  handle text not null unique,
  avatar_hue integer not null default 200,
  role text not null default 'USER' check (role in ('USER', 'ADMIN', 'OWNER')),
  status text not null default 'active' check (status in ('active', 'warned', 'suspended', 'banned')),
  status_reason text,
  status_until timestamptz,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists profiles_one_owner_idx
  on profiles (role) where role = 'OWNER';
create index if not exists profiles_handle_idx on profiles (handle);
create index if not exists profiles_status_idx on profiles (status);
create index if not exists profiles_last_seen_idx on profiles (last_seen_at);

create table if not exists conversations (
  id text primary key,
  pair_key text unique,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create index if not exists conversations_last_message_idx
  on conversations (last_message_at desc);

create table if not exists conversation_members (
  conversation_id text not null references conversations (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  last_read_at timestamptz,
  last_read_message_id text,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

create index if not exists conversation_members_user_idx
  on conversation_members (user_id);

create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations (id) on delete cascade,
  sender_id text not null references "user" ("id") on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists messages_conversation_created_idx
  on messages (conversation_id, created_at desc);
create index if not exists messages_conversation_id_idx
  on messages (conversation_id, id);

create table if not exists message_receipts (
  message_id text not null references messages (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  primary key (message_id, user_id)
);

create index if not exists message_receipts_user_idx
  on message_receipts (user_id);

create table if not exists typing_indicators (
  conversation_id text not null references conversations (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  expires_at timestamptz not null,
  primary key (conversation_id, user_id)
);

create table if not exists reports (
  id text primary key,
  reporter_id text not null references "user" ("id") on delete cascade,
  target_type text not null check (target_type in ('user', 'conversation', 'message')),
  target_user_id text references "user" ("id") on delete set null,
  target_conversation_id text,
  reason text not null,
  details text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewing', 'resolved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_by text,
  resolved_at timestamptz,
  resolution_note text
);

create index if not exists reports_status_created_idx
  on reports (status, created_at desc);
create index if not exists reports_target_user_idx on reports (target_user_id);
create index if not exists reports_reporter_idx on reports (reporter_id);

-- Frozen snapshots. This is the ONLY message content admins may read.
create table if not exists report_evidence (
  id text primary key,
  report_id text not null references reports (id) on delete cascade,
  message_id text,
  sender_id text,
  body text not null,
  sent_at timestamptz not null,
  is_reported boolean not null default false,
  sort_order integer not null
);

create index if not exists report_evidence_report_idx
  on report_evidence (report_id, sort_order);

create table if not exists moderation_actions (
  id text primary key,
  actor_id text not null,
  target_user_id text not null,
  action text not null,
  reason text,
  metadata text,
  created_at timestamptz not null default now()
);

create index if not exists moderation_actions_target_idx
  on moderation_actions (target_user_id, created_at desc);
create index if not exists moderation_actions_actor_idx
  on moderation_actions (actor_id, created_at desc);

create table if not exists audit_logs (
  id text primary key,
  actor_id text not null,
  action text not null,
  resource_type text not null,
  resource_id text,
  target_user_id text,
  metadata text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_created_idx on audit_logs (created_at desc);
create index if not exists audit_logs_actor_idx on audit_logs (actor_id, created_at desc);
create index if not exists audit_logs_target_idx on audit_logs (target_user_id, created_at desc);

create table if not exists rate_limits (
  key text primary key,
  count integer not null,
  window_start timestamptz not null
);
