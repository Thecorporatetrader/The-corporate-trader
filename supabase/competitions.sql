-- =====================================================================
-- The Corporate Trader — Monthly Trading Championship
-- Tables: competitions, competition_participants, lucky_draw_entries
-- View:   competition_leaderboard  (the ONLY thing the public can read)
--
-- Security model
--   * Participants' personal data (name, email, MT5 number, server) is never
--     publicly readable. The public reads a VIEW that exposes only the trader
--     handle + stats.
--   * Users can INSERT their own registration (stats must start at zero) and
--     read/delete their own row. They can NEVER update stats.
--   * Stats are written only by the server using the service-role key
--     (see app/api/competitions/sync/route.ts).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tier rules. Keep in sync with TIERS in lib/competitions/types.ts
-- ---------------------------------------------------------------------
create or replace function public.tier_min_lots(p_tier text) returns numeric
language sql immutable as $$
  select case p_tier when 'starter' then 1.0 when 'pro' then 3.0 when 'elite' then 5.0 end
$$;

create or replace function public.tier_max_drawdown(p_tier text) returns numeric
language sql immutable as $$
  select case p_tier when 'starter' then 20.0 when 'pro' then 15.0 when 'elite' then 10.0 end
$$;

create or replace function public.tier_for_equity(p_equity numeric) returns text
language sql immutable as $$
  select case
    when p_equity >= 2500 then 'elite'
    when p_equity >= 500  then 'pro'
    when p_equity >= 100  then 'starter'
    else null
  end
$$;

-- ---------------------------------------------------------------------
-- competitions
-- ---------------------------------------------------------------------
create table public.competitions (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  start_date        timestamptz not null,
  end_date          timestamptz not null,
  is_active         boolean not null default false,   -- the cycle currently running
  registration_open boolean not null default true,    -- accepting sign-ups (usually the NEXT cycle)
  total_prize_pool  numeric(12,2) not null default 0,
  created_at        timestamptz not null default now(),
  constraint competitions_dates_chk check (end_date > start_date)
);

-- only one cycle can be "active" at a time
create unique index competitions_one_active_uidx on public.competitions (is_active) where is_active;

-- ---------------------------------------------------------------------
-- competition_participants
-- ---------------------------------------------------------------------
create table public.competition_participants (
  id                  uuid primary key default gen_random_uuid(),
  competition_id      uuid not null references public.competitions(id) on delete cascade,
  user_id             uuid not null references auth.users(id) on delete cascade,

  -- registration (written by the user)
  display_handle      text not null
                        constraint competition_participants_handle_chk check (display_handle ~ '^[A-Za-z0-9_.-]{3,24}$'),
  full_name           text not null check (char_length(full_name) between 2 and 80),
  email               text not null check (char_length(email) between 5 and 254),
  mt5_account_number  text not null check (mt5_account_number ~ '^[0-9]{5,12}$'),
  mt5_server          text not null check (char_length(mt5_server) between 2 and 80),
  tier                text not null check (tier in ('starter', 'pro', 'elite')),
  ib_code             text check (ib_code is null or char_length(ib_code) <= 32),
  ib_verified         boolean not null default false,       -- set by an admin / IB-portal check
  accepted_rules_at   timestamptz not null default now(),
  registered_at       timestamptz not null default now(),

  -- tracking (written ONLY by the service role)
  metaapi_account_id  text,
  starting_equity     numeric(14,2) not null default 0,     -- 0 until the first sync after the cycle starts
  current_equity      numeric(14,2) not null default 0,
  peak_equity         numeric(14,2) not null default 0,
  percent_gain        numeric(10,2) generated always as (
                        case when starting_equity > 0
                             then round(((current_equity - starting_equity) / starting_equity * 100)::numeric, 2)
                             else 0 end
                      ) stored,
  lots_traded         numeric(12,2) not null default 0,     -- lots closed during the cycle
  max_drawdown        numeric(6,2)  not null default 0,     -- % peak-to-trough on equity
  baseline_lots       numeric(12,2) not null default 0,
  baseline_deposits   numeric(14,2) not null default 0,
  status              text not null default 'active' check (status in ('active', 'disqualified')),
  disqualified_reason text,
  last_synced_at      timestamptz,

  constraint competition_participants_user_uniq unique (competition_id, user_id),
  constraint competition_participants_mt5_uniq  unique (competition_id, mt5_server, mt5_account_number)
);

create unique index competition_participants_handle_uidx
  on public.competition_participants (competition_id, lower(display_handle));

create index competition_participants_rank_idx
  on public.competition_participants (competition_id, tier, percent_gain desc);
create index competition_participants_user_idx
  on public.competition_participants (user_id);

-- ---------------------------------------------------------------------
-- lucky_draw_entries  (refreshed by refresh_lucky_draw_entries())
-- ---------------------------------------------------------------------
create table public.lucky_draw_entries (
  id             uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  total_lots     numeric(12,2) not null default 0,
  qualified      boolean not null default false,
  updated_at     timestamptz not null default now(),
  unique (competition_id, user_id)
);

-- Qualified = still active AND traded at least the tier's minimum lots.
-- Rank does not matter. (Change the rule here if your policy differs.)
create or replace function public.refresh_lucky_draw_entries(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.lucky_draw_entries (competition_id, user_id, total_lots, qualified, updated_at)
  select p.competition_id,
         p.user_id,
         p.lots_traded,
         (p.status = 'active' and p.lots_traded >= public.tier_min_lots(p.tier)),
         now()
  from public.competition_participants p
  where p.competition_id = p_competition_id
    and p.starting_equity > 0
  on conflict (competition_id, user_id) do update
    set total_lots = excluded.total_lots,
        qualified  = excluded.qualified,
        updated_at = now();
end;
$$;

revoke all on function public.refresh_lucky_draw_entries(uuid) from public, anon, authenticated;
grant execute on function public.refresh_lucky_draw_entries(uuid) to service_role;

-- ---------------------------------------------------------------------
-- Public leaderboard view
-- A view runs with its owner's rights, so it bypasses RLS on the base table
-- ON PURPOSE: it exposes safe columns only (no name / email / MT5 number).
-- Supabase's linter will flag it as "security definer view" — expected.
-- ---------------------------------------------------------------------
create or replace view public.competition_leaderboard as
select
  p.id,
  p.competition_id,
  p.display_handle,
  p.tier,
  p.percent_gain,
  p.current_equity,
  p.lots_traded,
  p.max_drawdown,
  p.status,
  (p.lots_traded >= public.tier_min_lots(p.tier)) as volume_met,
  rank() over (
    partition by p.competition_id
    order by (p.status = 'active') desc, p.percent_gain desc
  ) as overall_rank,
  rank() over (
    partition by p.competition_id, p.tier
    order by (p.status = 'active') desc, p.percent_gain desc
  ) as tier_rank,
  p.last_synced_at
from public.competition_participants p
where p.starting_equity > 0;   -- only traders whose baseline has been captured

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.competitions              enable row level security;
alter table public.competition_participants  enable row level security;
alter table public.lucky_draw_entries        enable row level security;

-- competitions: public read of the running + registrable cycles; writes = service role only
create policy "competitions: public read"
  on public.competitions for select
  to anon, authenticated
  using (is_active or registration_open);

-- participants: owner can read their own row (public data goes through the view)
create policy "participants: read own"
  on public.competition_participants for select
  to authenticated
  using (user_id = auth.uid());

-- participants: authenticated users register THEMSELVES, with all tracking fields at zero
create policy "participants: register self"
  on public.competition_participants for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'active'
    and starting_equity = 0 and current_equity = 0 and peak_equity = 0
    and lots_traded = 0 and max_drawdown = 0
    and baseline_lots = 0 and baseline_deposits = 0
    and metaapi_account_id is null
    and ib_verified = false
    and disqualified_reason is null
    and last_synced_at is null
    and exists (
      select 1 from public.competitions c
      where c.id = competition_id
        and c.registration_open
        and c.end_date > now()
    )
  );

-- participants: may withdraw only before the cycle starts
create policy "participants: withdraw before start"
  on public.competition_participants for delete
  to authenticated
  using (
    user_id = auth.uid()
    and exists (select 1 from public.competitions c where c.id = competition_id and c.start_date > now())
  );

-- (no UPDATE policy on purpose: stats can only be written with the service-role key)

-- lucky draw: users can see their own entry; only the server writes
create policy "lucky draw: read own"
  on public.lucky_draw_entries for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Privileges (defence in depth on top of RLS)
-- ---------------------------------------------------------------------
revoke all on public.competition_participants from anon;
revoke update on public.competition_participants from authenticated;
revoke all on public.lucky_draw_entries from anon;
revoke insert, update, delete on public.lucky_draw_entries from authenticated;
revoke insert, update, delete on public.competitions from anon, authenticated;

grant select on public.competition_leaderboard to anon, authenticated;
