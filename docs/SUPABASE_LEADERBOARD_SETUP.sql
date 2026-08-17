-- GreenNow leaderboard setup
-- Run in the Supabase SQL Editor as a project administrator.
-- This script is idempotent and restores the Profile opt-in plus authenticated leaderboard flow.

alter table public.profiles
  add column if not exists leaderboard_opt_in boolean not null default false;

comment on column public.profiles.leaderboard_opt_in is
  'Whether the member has chosen to share their name and aggregate cleanup impact on the authenticated GreenNow leaderboard.';

-- Return only opted-in member names and aggregate cleanup metrics. The security-definer
-- function keeps the browser from needing broad read access to every profile or RSVP row.
create or replace function public.get_leaderboard()
returns table (
  profile_id uuid,
  display_name text,
  events_attended bigint,
  trash_collected_lbs numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id as profile_id,
    coalesce(nullif(trim(p.name), ''), 'GreenNow volunteer') as display_name,
    count(r.id)::bigint as events_attended,
    coalesce(sum(coalesce(e.trash_collected_lbs, 0)), 0)::numeric as trash_collected_lbs
  from public.profiles p
  left join public.rsvps r on r.user_id = p.id
  left join public.events e on e.id = r.event_id
  where p.leaderboard_opt_in is true
  group by p.id, p.name
  order by count(r.id) desc, coalesce(sum(coalesce(e.trash_collected_lbs, 0)), 0) desc, coalesce(nullif(trim(p.name), ''), 'GreenNow volunteer') asc
  limit 100;
$$;

revoke all on function public.get_leaderboard() from public;
revoke execute on function public.get_leaderboard() from anon;
revoke execute on function public.get_leaderboard() from authenticated;
grant execute on function public.get_leaderboard() to authenticated;

-- Verification steps after running this script:
-- 1. On Profile, opt in and save. The existing Profile update policy must allow a user to update their own profile.
-- 2. Sign in as a non-admin user and open /leaderboard. Only opted-in names and aggregate metrics should be returned.
-- 3. Opt out and save. The member should disappear from the leaderboard immediately on the next load.
-- 4. Confirm direct browser queries to all profile rows remain restricted by existing RLS policies.
