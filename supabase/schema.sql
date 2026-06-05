create extension if not exists "pgcrypto";

create table if not exists practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  scenario text not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_seconds int not null default 0,
  overall_score int,
  grammar_score int,
  fluency_score int,
  vocabulary_score int,
  pronunciation_score int,
  report jsonb,
  created_at timestamptz not null default now()
);

create table if not exists practice_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references practice_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists practice_corrections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references practice_sessions(id) on delete cascade,
  original text not null,
  corrected text not null,
  reason text not null,
  better_expression text not null,
  scores jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists practice_sessions_created_at_idx
  on practice_sessions(created_at desc);

create index if not exists practice_messages_session_id_idx
  on practice_messages(session_id);

create index if not exists practice_corrections_session_id_idx
  on practice_corrections(session_id);
