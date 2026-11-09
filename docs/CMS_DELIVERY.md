# CMS CRUD and Authentication Delivery

Date: 2026-11-07. Status: implemented locally; production acceptance pending.

## Scope

- Public home-page layout remains the restored baseline.
- News/service/shareholder/about article mutations require a confirmed server record/ID. Errors, timeouts and malformed success responses never become a local publication.
- Article lists/details in server mode read only from the API. Local overrides cannot replace current server content or resurrect deleted records.
- Admin article lists always require the API and show a retryable error inside the existing list layout.
- The API persists core fields and an optional metadata JSON object, preserving summary, category/document type, publication year, attachments, related IDs and slug.
- Create/update return `{ success: true, data: article }`; deletion returns `{ success: true, id }` after completion. Response IDs are checked by the frontend.
- Image-upload failures no longer return local Data URLs or Blob URLs as successful uploads. The existing image endpoint still does not support document binaries; permanent externally stored document links may be used.

## Access controls implemented

- No embedded frontend admin accounts or synthetic fallback tokens.
- Server-confirmed session check before rendering the admin application.
- Mandatory JWT secret, pinned HS256 algorithm, issuer, audience and expiry.
- Scrypt password verification; plaintext-password accounts are denied.
- Every protected request checks the current database account and password fingerprint; account removal/reset invalidates its tokens.
- Login and protected requests enforce the IP whitelist, using Express's explicit trusted-proxy policy rather than reading arbitrary forwarded headers.
- Article, banner and upload mutation permissions require IDs explicitly listed in `CMS_ADMIN_USER_IDS`.
- Bounded per-process login throttling. Distributed/edge limiting remains required before multi-instance production acceptance.
- Generic unexpected-error responses avoid returning internal exception details.

These controls cover the CMS authentication/write path, not a completed security audit of every internal module or HTML renderer.

## Explicit content-source transition

`VITE_CONTENT_SOURCE=legacy` is the default, preserving read-only migrated public content while the database is reconciled. Admin article CRUD still targets the server. The admin UI explicitly warns that server saves are not yet reflected in the public snapshot.

`VITE_CONTENT_SOURCE=server` enables authoritative API list/detail reads with no silent fallback. Configure the paired API origin through `VITE_API_BASE_URL` and rebuild. Do not switch before importing/reconciling legacy data and IDs; an empty server database would otherwise show empty public lists.

Legacy browser drafts are retained for export/recovery but are no longer treated as published article records by these reads. Gallery/banner/settings persistence remains outside this delivery. Their existing local behavior must not be treated as server publication acceptance.

## Database and account transition — not executed

1. Identify the canonical backend repository, deployment and target database; verify a restorable backup.
2. Reconcile existing migration history with the actual schema on staging.
3. Apply the reviewed additive `news.metadata` JSON column migration and regenerate Prisma Client.
4. Reset intended administrators to new strong scrypt passwords using the provided stdin-based reset tool. It defaults to dry-run; only an explicit `--apply` writes the selected account.
5. Set a secure JWT secret, explicit CMS administrator IDs, trusted proxy configuration and whitelist entries. Test allowed and denied IPs using the real deployment path.
6. Reconcile/import migrated content and IDs. Verify all metadata and permanent file references.
7. Deploy the paired backend/frontend to staging, then enable public server mode and verify from a clean second browser session.
8. Resolve remaining production dependency/security gates and record acceptance before production deployment.

No database setup, reset, seed, migration, credential reset or production deployment was performed in this implementation session.

## Validation

- Frontend contract tests cover canonical create IDs, invalid backend acknowledgements, create/update/delete failure propagation, ID mismatch, authoritative reads, no record resurrection, explicit legacy mode, unavailable authentication and failed uploads.
- Backend HTTP tests use real Express routing and jsonwebtoken/scrypt with an in-memory Prisma double. They cover login, plaintext rejection, missing JWT configuration, IP enforcement, untrusted forwarded headers, absent/forged/expired tokens, CMS permissions, CRUD metadata round-trips, missing records, database errors, input validation, session revocation and login throttling.
- Prisma validation/client generation use a synthetic database URL and do not connect to MySQL.
- Lint is scoped to the frontend repository; backend validation uses syntax checks and its own test command. The imported backend has no existing standalone lint configuration.

## Remaining production gates

- Actual MySQL integration, migration rehearsal and cross-browser staging tests.
- Actual proxy/IP behavior and distributed login throttling on the chosen hosting platform.
- Legacy content migration/ID mapping and review of date sorting. Current server `created_at_*` options map to ID creation order because the original schema has no creation timestamp.
- Dedicated document uploads, persistent gallery/settings/banner management and server-side rich-HTML sanitization review.
- Resolve dependency audit findings. Compatible Express/Multer/proxy dependency updates removed the observed critical finding; remaining package advisories still require review before production acceptance.
- No role-based authorization redesign for the separate POS/HR workflows is included; article-write permissions use the explicit CMS account allowlist.

## Recorded check results

- Frontend: 13 contract tests passed.
- Backend: 18 HTTP/authentication tests passed with a database double.
- All 68 backend JavaScript files passed Node syntax checks.
- Frontend ESLint and production build passed; the pre-existing large-bundle warning remains.
- Prisma 6.2.1 schema validation and client generation passed with a synthetic database URL. No connection or SQL execution occurred.
- Production-only npm audit after compatible updates reports 2 high advisories in `cloudinary` and `multer-storage-cloudinary`, with no critical advisories. These remain a production acceptance gate; a major upload-stack upgrade needs its own compatibility checks.

See [the extended test report](TEST_REPORT.md) for the 2026-11-07 verification run and its database/integration limits.

## Subsequent local MySQL integration — 2026-11-07

MySQL 8.4.9 was installed and configured locally. Seven additional tests passed against the isolated `hepco_integration` database, including the additive metadata migration and persistence through an independent connection. Only that newly created test database was populated; temporary test records were removed. No production changes occurred. See [local MySQL setup](LOCAL_MYSQL.md) and [test report](TEST_REPORT.md).
