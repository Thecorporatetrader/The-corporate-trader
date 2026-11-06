-- Optional: create the first cycles. Edit dates / prize pool, then run once in the Supabase SQL editor.
-- Times are IST (+05:30). The sync job flips is_active on its own when start_date / end_date pass.

-- Next cycle: open for registration
insert into public.competitions (title, start_date, end_date, is_active, registration_open, total_prize_pool)
values (
  'December 2026 Championship',
  '2026-12-01 00:00:00+05:30',
  '2026-12-31 23:59:59+05:30',
  false,
  true,
  0            -- set your real prize pool
);
