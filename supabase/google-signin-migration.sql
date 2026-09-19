-- TCT: Google sign-in migration (run once in Supabase Dashboard > SQL Editor; safe to re-run).
-- For an EXISTING project that already ran account-security.sql. Brand-new project: run schema.sql,
-- then the full supabase/account-security.sql instead (it contains everything below).
-- Adds: nullable mobile, Google-safe signup trigger, profile_mobile_missing(), complete_mobile_profile().
-- Does NOT touch algo_subscriptions or grant any premium access.
begin;
-- Google sign-ups have no mobile until /complete-profile. Existing projects created these columns NOT NULL.
-- The CHECK constraints stay as-is: a NULL comparison passes, so only non-null values are validated.
-- phone is NULL while either part is NULL, and UNIQUE permits any number of NULLs.
alter table public.account_profiles alter column country_code drop not null;
alter table public.account_profiles alter column mobile_number drop not null;

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

commit;
