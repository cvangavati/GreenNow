-- GreenNow feedback collection setup
-- Run this in the Supabase SQL Editor as a project administrator.
-- Review with the project owner before production use.

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  category text not null check (category in ('general', 'feature', 'issue', 'accessibility', 'safety_privacy')),
  message text not null check (char_length(message) between 20 and 3000),
  contact_email text check (contact_email is null or char_length(contact_email) <= 254),
  page_url text not null check (char_length(page_url) between 1 and 2048),
  status text not null default 'new' check (status in ('new', 'reviewed', 'closed')),
  handled_by uuid references auth.users(id) on delete set null,
  internal_notes text
);

alter table public.feedback enable row level security;

-- Public and signed-in visitors can submit one bounded feedback record.
-- The policy prevents a signed-in visitor from assigning the submission to a different user.
create policy "Anyone can submit bounded feedback"
on public.feedback
for insert
to anon, authenticated
with check (
  (user_id is null or user_id = auth.uid())
  and category in ('general', 'feature', 'issue', 'accessibility', 'safety_privacy')
  and char_length(message) between 20 and 3000
  and char_length(page_url) between 1 and 2048
  and (contact_email is null or char_length(contact_email) <= 254)
);

-- Only profiles already marked as administrators can read or manage submissions.
-- This matches the existing GreenNow admin-role convention.
create policy "Admins can manage feedback"
on public.feedback
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role = 'admin'
  )
);

grant insert on table public.feedback to anon, authenticated;
grant select, update, delete on table public.feedback to authenticated;

-- Optional operational check after configuration:
-- 1. Submit the form while signed out and confirm the row is created.
-- 2. Confirm a normal user cannot select, update, or delete feedback rows.
-- 3. Confirm an administrator can review and update status/internal_notes.
-- 4. Configure platform-level rate limits or CAPTCHA before inviting broad public use.
