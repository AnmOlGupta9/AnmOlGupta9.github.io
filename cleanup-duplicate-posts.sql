-- Run this once in Supabase SQL Editor to remove duplicate starter posts.
-- It keeps one row per starter slug, preferring an owner-owned row over a seed row.

with ranked as (
  select
    id,
    row_number() over (
      partition by slug
      order by (owner_id = 'seed') asc, created_at asc, id asc
    ) as rn
  from public.posts
  where slug in ('welcome', 'building', 'attention')
)
delete from public.posts
where id in (select id from ranked where rn > 1);

-- Prevent the duplicate problem from returning.
create unique index if not exists posts_slug_unique
on public.posts (slug);
