# Anmol — Personal Notebook

Source snapshot exported from the deployed AppDeploy app `anmol-notebook-aiu9x9` (authorization-hardened snapshot 1789143293474).

## Structure
- `src/App.tsx` — React UI, public notebook, article reader, author studio, live word/character count, social links, search/filtering.
- `src/index.css` — full visual styling.
- `src/main.tsx` — React entry point.
- `backend/index.ts` — public API plus owner-only CRUD/auth authorization.
- `backend/realtime*.ts` — AppDeploy realtime support files.
- `public/resources/profile-photo.jpg` — profile image asset.
- `appdeploy.auth-login.json` — Google author-login configuration.
- `tests/tests.txt` — deployment test plan.

## Important
This is the application source, not a database export. Posts are stored in the AppDeploy backend database, so existing production posts are not contained in this ZIP.

The production admin allowlist is configured for the owner account in `backend/index.ts`. Do not publish that file as a public static site without understanding the AppDeploy backend/auth setup.
