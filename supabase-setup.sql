-- Run this only if you need to recreate the posts table/policies from scratch.
-- Your existing table and policies are already set up if you followed our steps.

create table if not exists public.posts (
  id text primary key,
  created_at timestamptz not null default now(),
  slug text not null,
  title text not null,
  category text not null,
  date date not null,
  published boolean not null default false,
  owner_id text,
  updated_at timestamptz not null default now(),
  excerpt text,
  body text
);

alter table public.posts enable row level security;

create policy if not exists "Public can read published posts"
on public.posts for select to anon, authenticated using (published = true);

create policy if not exists "Owner can read own posts"
on public.posts for select to authenticated
using (auth.jwt() ->> 'email' = 'anmolgupta7487@gmail.com' and owner_id = auth.uid()::text);

create policy if not exists "Owner can create posts"
on public.posts for insert to authenticated
with check (auth.jwt() ->> 'email' = 'anmolgupta7487@gmail.com' and owner_id = auth.uid()::text);

create policy if not exists "Owner can update posts"
on public.posts for update to authenticated
using (auth.jwt() ->> 'email' = 'anmolgupta7487@gmail.com' and owner_id = auth.uid()::text)
with check (auth.jwt() ->> 'email' = 'anmolgupta7487@gmail.com' and owner_id = auth.uid()::text);

create policy if not exists "Owner can delete posts"
on public.posts for delete to authenticated
using (auth.jwt() ->> 'email' = 'anmolgupta7487@gmail.com' and owner_id = auth.uid()::text);
