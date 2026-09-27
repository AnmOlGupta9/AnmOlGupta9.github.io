# Offline editing guide

This package contains the current source snapshot of Anmol — Personal Notebook.

## What you can edit completely offline
- `src/App.tsx` — React UI, navigation, post cards, article reader, author studio, editor, social links.
- `src/index.css` — all site styling and responsive layout.
- `index.html` — document shell/title.
- `public/resources/profile-photo.jpg` — profile image.
- `tests/tests.txt` — end-to-end test expectations.

## Run the React frontend locally
The first setup requires Node.js and the dependencies in `package.json` to be installed. After that, the source can be edited without internet access, provided the required packages are already present locally.

Commands:

```bash
npm install
npm run dev
```

## Important limitation
The current production app uses AppDeploy-specific authentication, API, and database SDKs in `@appdeploy/client` and `@appdeploy/sdk`. Those services are not replaced by this source archive, and the production database contents are not embedded in the ZIP.

Therefore, an offline local copy of the React UI is not the same thing as an offline copy of the production backend/database/authentication system.

The archive is intentionally the editable source of the deployed application, including its AppDeploy integration points, so it can be migrated later to Cloudflare/AWS or another backend.

## Current production seed notes
The backend seeds these three notes exactly once by slug:
1. Why I want a corner of the internet
2. What I’m learning while building things
3. On attention, curiosity, and doing less
