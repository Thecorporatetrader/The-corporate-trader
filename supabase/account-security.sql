-- Apply AFTER schema.sql for a new project; existing community projects run only this migration.
-- Transactional and rerunnable. Existing comments are retained.
begin;
create table if not exists public.account_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (full_name ~ '^[[:alpha:]][[:alpha:] ]*$' and char_length(full_name) <= 80),
  country_code text not null check (country_code ~ '^\+[1-9][0-9]{0,3}$'),
  mobile_number text not null check (mobile_number ~ '^[0-9]{8,15}$'),
  phone text generated always as (country_code || mobile_number) stored unique
);
alter table public.account_profiles enable row level security;
revoke all on public.account_profiles from anon, authenticated;
grant all on public.account_profiles to service_role;

create or replace function public.create_account_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.account_profiles (user_id, full_name, country_code, mobile_number)
  values (new.id, trim(new.raw_user_meta_data->>'full_name'), new.raw_user_meta_data->>'country_code', new.raw_user_meta_data->>'mobile_number');
  return new;
end;
$$;
revoke all on function public.create_account_profile() from public, anon, authenticated;
drop trigger if exists tct_create_account_profile on auth.users;
create trigger tct_create_account_profile after insert on auth.users
for each row execute function public.create_account_profile();

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

