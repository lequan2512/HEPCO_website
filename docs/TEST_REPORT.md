# CMS Test Report

Date: 2026-11-07 (Asia/Saigon).

## Results

| Check | Result | Scope |
| --- | --- | --- |
| Frontend contract tests | PASS: 13/13 | Actual service functions evaluated with controlled HTTP doubles |
| Backend HTTP/authentication tests | PASS: 18/18 | Real Express routes, JWT and scrypt; in-memory Prisma database double |
| Frontend ESLint | PASS | Frontend scope; backend has its own tests/syntax checks |
| Production frontend build | PASS | Existing large-bundle warning remains |
| Prisma schema validation | PASS | Synthetic connection URL; no database connection |

## Additional scenarios verified

- Wrong JWT audience, issuer and algorithm are denied.
- Removing a CMS grant prevents subsequent writes immediately.
- Failed updates keep the previously saved record; failed deletes keep the record available.
- Client-supplied IDs and author IDs cannot override server-generated identity and authenticated ownership.
- Malformed server acknowledgements/session responses are rejected.
- Successful update/delete operations preserve the canonical server ID without local publication writes.

Previously covered scenarios remain passing: missing/expired/forged tokens, plaintext password denial, IP enforcement and forwarded-header spoofing, upload/banner permissions, password/account revocation, rate limiting, CRUD metadata round-trip, input validation and unavailable-server behavior.

## Limits of the initial mocked run

These results do not validate real MySQL persistence, migration compatibility, browser interaction, Cloudinary uploads or deployed proxy/IP behavior. No database reset, migration or production deployment was performed for this test run. Actual MySQL integration is a separate next step after local server installation/configuration.

The recorded production dependency audit still has two high advisories in the Cloudinary upload stack. Passing these tests is not production security acceptance.

## Subsequent real MySQL verification

After installing MySQL 8.4.9 locally, the isolated `hepco_integration` database passed 7/7 additional tests: additive metadata migration, hashed login, persisted CRUD, MySQL JSON filters, independent-connection reads and session revocation. Test-created data was removed afterward. Together with 13 frontend and 18 mocked HTTP tests, this records 38 passing tests. Production data, older migration history, Cloudinary and browser behavior remain outside this verification. See [local MySQL setup](LOCAL_MYSQL.md).
