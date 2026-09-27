# Anmol Notebook — Supabase + Vercel migration

This version removes the AppDeploy database/auth dependencies and uses Supabase directly from the React app.

## Required environment variables

Create `.env.local` for local development:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

Use the project's client-safe Supabase publishable/anon key. Never put a service-role key, database password, Google OAuth secret, or other server secret in the frontend.

## Supabase setup already completed

- `posts` table created
- Row Level Security enabled
- Public published-post read policy
- Owner-only read/create/update/delete policies
- Google provider connected

## Google/Supabase URL configuration

For local testing, add your local Vite URL (normally `http://localhost:5173`) to Supabase Authentication URL Configuration.
After Vercel deployment, set the production Site URL to your Vercel URL and add `https://blogme.in` (and any `www` URL you use) to the redirect allow list.

## Starter posts

On the first successful owner login, the app creates the three starter notes if their slugs do not already exist. They are assigned to the authenticated owner, so they can be edited/deleted from Studio.

## Security

The frontend email check is only a UX guard. Real database authorization is enforced by Supabase RLS using the authenticated user's UUID and owner email claim.
