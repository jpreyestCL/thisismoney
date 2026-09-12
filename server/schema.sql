create table if not exists leaderboard_scores (
  quarter text not null,
  player_id uuid not null,
  display_name text not null,
  best_money bigint not null default 0 check (best_money >= 0 and best_money <= 1000000000000),   -- dinero actual, no el máximo histórico
  best_stage integer not null default 1 check (best_stage between 1 and 10000),
  creative boolean not null default false,
  source_hash text not null default '',
  updated_at timestamptz not null default now(),
  primary key (quarter, player_id),
  check (quarter ~ '^[0-9]{4}-Q[1-4]$'),
  check (char_length(display_name) between 1 and 20)
);

alter table leaderboard_scores
  add column if not exists creative boolean not null default false;

-- Versiones antiguas no enviaban el modo; sus cifras de dinero infinito se corrigen al migrar.
update leaderboard_scores set creative = true
  where best_money >= 999999999;

create index if not exists leaderboard_money_idx
  on leaderboard_scores (quarter, best_money desc, best_stage desc);
create index if not exists leaderboard_stage_idx
  on leaderboard_scores (quarter, best_stage desc, best_money desc);
create index if not exists leaderboard_recent_idx
  on leaderboard_scores (quarter, updated_at desc);

revoke all on leaderboard_scores from public;
grant select, insert, update on leaderboard_scores to timleaderboard;

-- CHAT MUNDIAL: el muro del inicio y los mensajes que aparecen jugando.
create table if not exists chat_messages (
  id bigserial primary key,
  player_id uuid not null,
  display_name text not null,
  body text not null,
  source_hash text not null default '',
  created_at timestamptz not null default now(),
  check (char_length(display_name) between 1 and 20),
  check (char_length(body) between 1 and 140)
);

create index if not exists chat_messages_created_idx on chat_messages (created_at);

-- Quién está en el chat ahora (para mostrar "12 jugadores conectados").
create table if not exists chat_presence (
  player_id uuid primary key,
  display_name text not null default 'Jugador',
  seen_at timestamptz not null default now()
);

create index if not exists chat_presence_seen_idx on chat_presence (seen_at desc);

revoke all on chat_messages from public;
revoke all on chat_presence from public;
grant select, insert, delete on chat_messages to timleaderboard;
grant usage, select on sequence chat_messages_id_seq to timleaderboard;
grant select, insert, update, delete on chat_presence to timleaderboard;
