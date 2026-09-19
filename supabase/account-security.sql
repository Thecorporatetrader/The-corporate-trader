-- Apply AFTER schema.sql for a new project; existing community projects run only this migration.
-- Transactional and rerunnable. Existing comments are retained.
-- Existing projects: re-run this whole file to pick up the nullable-mobile change (Google sign-in),
-- the hardened create_account_profile() trigger and the profile_mobile_missing() /
-- complete_mobile_profile() RPCs used by /auth/callback, /complete-profile and /dashboard.
begin;
create table if not exists public.account_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (full_name ~ '^[[:alpha:]][[:alpha:] ]*$' and char_length(full_name) <= 80),
  country_code text check (country_code ~ '^\+[1-9][0-9]{0,3}$'),
  mobile_number text check (mobile_number ~ '^[0-9]{8,15}$'),
  phone text generated always as (country_code || mobile_number) stored unique
);
-- Google sign-ups have no mobile until /complete-profile. Existing projects created these columns NOT NULL.
-- The CHECK constraints stay as-is: a NULL comparison passes, so only non-null values are validated.
-- phone is NULL while either part is NULL, and UNIQUE permits any number of NULLs.
alter table public.account_profiles alter column country_code drop not null;
alter table public.account_profiles alter column mobile_number drop not null;
alter table public.account_profiles enable row level security;
revoke all on public.account_profiles from anon, authenticated;
grant all on public.account_profiles to service_role;

-- Runs for email sign-ups (metadata: full_name/country_code/mobile_number) and Google OAuth sign-ups
-- (metadata: full_name and/or name, no mobile). It must never raise on an unusual Google display name.
-- It never touches algo_subscriptions: premium access is granted manually by an admin only.
create or replace function public.create_account_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_name text;
begin
  v_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    ''
  );
  v_name := regexp_replace(v_name, '[[:space:]_.-]+', ' ', 'g');    -- hyphens, dots, underscores, odd spaces become word breaks
  v_name := regexp_replace(v_name, '[^[:alpha:] ]', '', 'g');       -- drop anything the CHECK would reject (digits, symbols, emoji)
  v_name := trim(regexp_replace(v_name, ' {2,}', ' ', 'g'));        -- collapse repeated spaces
  v_name := trim(left(v_name, 80));                                  -- respect the 80-character limit
  if v_name = '' then v_name := 'TCT Trader'; end if;                -- generic placeholder when nothing usable remains

  insert into public.account_profiles (user_id, full_name, country_code, mobile_number)
  values (
    new.id,
    v_name,
    nullif(trim(new.raw_user_meta_data->>'country_code'), ''),
    nullif(trim(new.raw_user_meta_data->>'mobile_number'), '')
  );
  return new;
end;
$$;
revoke all on function public.create_account_profile() from public, anon, authenticated;
drop trigger if exists tct_create_account_profile on auth.users;
create trigger tct_create_account_profile after insert on auth.users
for each row execute function public.create_account_profile();

-- True when the signed-in user still needs to add a mobile number (first-time Google users).
-- Defaults to true if the user has no profile row at all.
create or replace function public.profile_mobile_missing()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select p.mobile_number is null from public.account_profiles p where p.user_id = auth.uid()),
    true
  );
$$;
revoke all on function public.profile_mobile_missing() from public, anon;
grant execute on function public.profile_mobile_missing() to authenticated;

-- Lets a signed-in user set their mobile ONCE. It validates like the table CHECKs and never overwrites
-- an existing number (changing a saved number remains an admin task).
create or replace function public.complete_mobile_profile(p_country_code text, p_mobile_number text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_country text := trim(p_country_code);
  v_mobile text := trim(p_mobile_number);
  v_rows integer;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if v_country is null or v_country !~ '^\+[1-9][0-9]{0,3}$' then raise exception 'Invalid country code'; end if;
  if v_mobile is null or v_mobile !~ '^[0-9]{8,15}$' then raise exception 'Invalid mobile number'; end if;
  begin
    update public.account_profiles
       set country_code = v_country, mobile_number = v_mobile
     where user_id = auth.uid() and mobile_number is null;
    get diagnostics v_rows = row_count;
  exception when unique_violation then
    raise exception 'This mobile number is already registered';
  end;
  if v_rows = 0 then raise exception 'Mobile number is already set or no profile was found'; end if;
end;
$$;
revoke all on function public.complete_mobile_profile(text, text) from public, anon;
grant execute on function public.complete_mobile_profile(text, text) to authenticated;

create table if not exists public.algo_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('active', 'inactive', 'cancelled')),
  verified boolean not null default false,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  check (expires_at > starts_at)
);
alter table public.algo_subscriptions enable row level security;
revoke all on public.algo_subscriptions from anon, authenticated;
grant all on public.algo_subscriptions to service_role;

create or replace function public.can_post_community()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.algo_subscriptions s join auth.users u on u.id = s.user_id
    where s.user_id = auth.uid() and s.status = 'active' and s.verified
    and s.starts_at <= now() and s.expires_at > now()
    and u.email_confirmed_at is not null and (u.banned_until is null or u.banned_until <= now())
  );
$$;
revoke all on function public.can_post_community() from public;
grant execute on function public.can_post_community() to anon, authenticated;

alter table public.community_comments add column if not exists user_id uuid references auth.users(id) on delete set null;
-- Remove the old unrestricted INSERT policy, including any other legacy write policies.
do $$ declare item record;
begin
  for item in select policyname from pg_policies where schemaname = 'public' and tablename = 'community_comments'
  loop execute format('drop policy %I on public.community_comments', item.policyname); end loop;
end $$;
alter table public.community_comments enable row level security;
revoke all on public.community_comments from anon, authenticated;
grant select on public.community_comments to anon, authenticated;
grant insert on public.community_comments to authenticated;
create policy "Public community reading" on public.community_comments for select to anon, authenticated using (true);
create policy "Verified active premium authors" on public.community_comments for insert to authenticated
with check (user_id = auth.uid() and public.can_post_community());

-- Derive author identity from the private profile; reject spoofing and rapid repeat posts.
create or replace function public.guard_community_post()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not public.can_post_community() then raise exception 'Premium subscription required'; end if;
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if exists (select 1 from public.community_comments where user_id = auth.uid() and created_at > now() - interval '30 seconds')
    then raise exception 'Please wait before posting again'; end if;
  select full_name into new.author_name from public.account_profiles where user_id = auth.uid();
  if new.author_name is null then raise exception 'Account profile required'; end if;
  new.author_name := left(new.author_name, 50);
  new.user_id := auth.uid();
  new.created_at := now();
  return new;
end;
$$;
revoke all on function public.guard_community_post() from public, anon, authenticated;
drop trigger if exists tct_guard_community_post on public.community_comments;
create trigger tct_guard_community_post before insert on public.community_comments
for each row execute function public.guard_community_post();
create index if not exists community_user_created on public.community_comments(user_id, created_at);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name ~ '^[[:alpha:]][[:alpha:] ]*$' and char_length(name) <= 80),
  email text not null check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' and char_length(email) <= 254),
  country_code text not null check (country_code ~ '^\+[1-9][0-9]{0,3}$'),
  mobile_number text not null check (mobile_number ~ '^[0-9]{8,15}$'),
  message text not null check (char_length(trim(message)) between 1 and 3000),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant all on public.contact_messages to service_role;

create table if not exists public.request_limits (
  bucket_key text primary key,
  window_start timestamptz not null,
  attempts integer not null
);
alter table public.request_limits enable row level security;
revoke all on public.request_limits from anon, authenticated;
grant all on public.request_limits to service_role;
create or replace function public.take_request_slot(bucket_key text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  delete from public.request_limits where window_start < now() - interval '1 day';
  insert into public.request_limits as limits values (bucket_key, now(), 1)
  on conflict on constraint request_limits_pkey do update
    set attempts = case when limits.window_start < now() - interval '15 minutes' then 1 else limits.attempts + 1 end,
        window_start = case when limits.window_start < now() - interval '15 minutes' then now() else limits.window_start end
  returning attempts into n;
  return n <= 8;
end;
$$;
revoke all on function public.take_request_slot(text) from public, anon, authenticated;
grant execute on function public.take_request_slot(text) to service_role;
commit;

