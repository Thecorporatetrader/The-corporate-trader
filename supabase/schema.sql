-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 1 and 50),
  body text not null check (char_length(body) between 1 and 600),
  rating smallint check (rating between 1 and 5),
  parent_id uuid references public.community_comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  check ((parent_id is null and rating is not null) or (parent_id is not null and rating is null))
);

alter table public.community_comments enable row level security;

drop policy if exists "Anyone can read community comments" on public.community_comments;
create policy "Anyone can read community comments"
  on public.community_comments for select using (true);
-- Posting stays disabled until account-security.sql is applied.
drop policy if exists "Anyone can post community comments" on public.community_comments;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'community_comments') then
    alter publication supabase_realtime add table public.community_comments;
  end if;
end $$;
