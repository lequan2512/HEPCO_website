# HEPCO API

Express/MySQL/Prisma backend supplied locally with the HEPCO frontend. The original import was statically assessed before the current CMS/authentication implementation. Upstream repository and production hosting still need confirmation.

## Development

1. Use a supported Node runtime and install with `npm ci`.
2. Create `.env` from `.env.example` and supply a dedicated development database.
3. Run `npx prisma generate`; validate with `npx prisma validate`.
4. Reconcile the existing database/migration baseline before applying schema changes. Do not reset a production database.
5. Run `npm run dev` after configuration, schema and credentials are ready.

## Tests

`npm test` exercises real Express routes and JWT/password behavior using an in-memory database double. It starts a loopback HTTP server and never accesses MySQL or Cloudinary. It is not a substitute for staging tests against the actual database.

## Authentication transition

- `JWT_SECRET` is mandatory and must contain at least 32 bytes; generate it securely outside source control.
- Login requires an exact entry in `ip_whitelists`. Configure proxy trust explicitly for the real hosting path; raw forwarded headers are not trusted by default.
- Passwords must use the supported scrypt encoding. Existing plaintext accounts are rejected until reset.
- `scripts/reset-password.js` reads JSON with `username` and a new `password` from stdin. It defaults to dry-run; `--apply` changes that existing account in the configured database. Use a secure input method, not shell arguments/history, and verify the target environment first.
- New passwords supplied to the reset tool need at least 12 characters. Password changes invalidate previously issued sessions.
- `CMS_ADMIN_USER_IDS` explicitly grants article/banner/upload write access to existing account IDs; an empty list grants no CMS write access.
- `GET /api/session` validates a server session. Removed accounts, changed passwords and expired/invalid tokens cannot keep using protected routes.
- Login throttling is per process. Production needs a shared/edge rate limiter for multiple instances.

## CMS contract

Create/update return `{ success: true, data: <persisted article> }`. Delete returns `{ success: true, id: <deleted ID> }` only after database deletion. Missing records return 404. Metadata such as categories, publication year and attachment references is stored in the optional `News.metadata` JSON column.

The additive SQL in `prisma/migrations/20261106170000_news_metadata/migration.sql` has NOT been executed. Earlier migration history does not reproduce the supplied schema; reconcile the baseline before any deployment migration. Existing IDs must be reconciled with migrated frontend content before switching public reads to the API.

Document binaries are not implemented by the image upload endpoint. Use confirmed permanent document URLs for now; transient `blob:`/`data:` attachment references are rejected. A dedicated document-upload workflow remains a later phase.

## Release status

Current work is local and not deployed. Review paired frontend/backend changes, database migration, account reset, whitelist/proxy setup, CMS grants and dependency findings on staging before production acceptance. The public website keeps its restored layout.
