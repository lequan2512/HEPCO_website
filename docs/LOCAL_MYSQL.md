# Local MySQL Installation

Installed on 2026-11-07: Oracle MySQL Community Server 8.4.9 via the `Oracle.MySQL` WinGet package. The installer checksum was verified by WinGet and Windows elevation was confirmed by the user.

## Local instance

- Server binaries: `C:\Program Files\MySQL\MySQL Server 8.4\bin`.
- Listener: `127.0.0.1:3306`; MySQL X Protocol is disabled.
- Data/configuration: `%LOCALAPPDATA%\HEPCO\MySQL`.
- Dedicated databases: `hepco_local` and `hepco_integration`.
- Dedicated database account: `hepco_local`, restricted to connections from `127.0.0.1` and privileges on those two databases.
- API `.env` was created with generated local database credentials and a generated JWT secret. CMS administrator IDs remain empty; no permanent CMS administrator was seeded.
- Root credential is stored using Windows account-bound encryption in `root-credential.xml`, inside the access-restricted MySQL directory. Credentials are not included in this document or Git.
- The MySQL binary directory was added to the current user's PATH; open a new terminal to use `mysql` by name.

## Starting after a reboot

This is a local user-owned process, not a registered Windows service. Start it with:

```powershell
& 'D:\Laptrinh\Website\HEPCO-API-main\scripts\start-local-mysql.ps1'
```

Keep the installed server and local data directory intact. Do not rerun `setup-local-mysql.ps1` on an existing instance; it deliberately refuses to overwrite existing data/configuration or an existing API environment file.

## Actual MySQL verification

`npm run test:mysql` in the backend directory passed 7/7 tests using `hepco_integration` only:

1. Apply the additive JSON metadata migration to a real MySQL table.
2. Authenticate a temporary account using a scrypt password hash.
3. Persist article metadata and read it through a separate database connection.
4. Filter actual JSON metadata by category/document type/year.
5. Update the same persisted article ID.
6. Delete it and verify repeated deletion returns 404.
7. Revoke the existing session after changing the stored password hash.

The preparation script built the supplied pre-metadata schema on the newly created integration database; it did not validate the older production migration history. Temporary test articles, accounts and whitelist entries were removed after testing. The local development database remains unpopulated; no production connection, migration, import or deployment was performed.

For production readiness, migration-history reconciliation, legacy content/ID migration, hosting-specific proxy/IP checks and outstanding upload dependency advisories still remain.
