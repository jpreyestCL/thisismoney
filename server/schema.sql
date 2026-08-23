create table if not exists leaderboard_scores (
  quarter text not null,
  player_id uuid not null,
  display_name text not null,
  best_money bigint not null default 0 check (best_money >= 0 and best_money <= 1000000000000),
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

create index if not exists leaderboard_money_idx
  on leaderboard_scores (quarter, best_money desc, best_stage desc);
create index if not exists leaderboard_stage_idx
  on leaderboard_scores (quarter, best_stage desc, best_money desc);
create index if not exists leaderboard_recent_idx
  on leaderboard_scores (quarter, updated_at desc);

revoke all on leaderboard_scores from public;
grant select, insert, update on leaderboard_scores to timleaderboard;
