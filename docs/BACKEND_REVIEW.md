# HEPCO Backend Assessment

Date: 2026-11-06. Scope: static source review of `HEPCO-API-main/` and its integration with the current restored frontend. The uploaded folder and ZIP are currently untracked in the frontend repository. Their upstream repository and production deployment identity have not been verified.

## Verification boundary

- Read application startup, schema, routing, JWT/login, content/banner/upload handlers, core models, Base.vn integration and relevant frontend hooks/services.
- Ran `node --check` against all 60 backend JavaScript files, including utility/setup scripts; all passed syntax checks. No script bodies were executed.
- Confirmed 15 Prisma models and three migration SQL files.
- Backend dependencies are not installed in this imported folder. Prisma generation/validation, server startup, database connectivity, API integration and concurrency tests remain unverified.
- Did not run database setup, migration, reset, seed or upload/delete operations. Did not change application code or deploy anything.
- Findings describe this source snapshot; they do not establish the state or exploitability of a live deployment.

## Architecture

```text
React frontend
  -> query/mutation hooks and services
  -> Axios with VITE_API_BASE_URL + /api/*
  -> Express 5 (CommonJS)
     -> route middleware / controllers
     -> Prisma models -> MySQL
     -> Cloudinary for images
     -> Base.vn Office / Request / Wework APIs
```

`src/index.js` loads environment configuration, enables CORS and JSON parsing, mounts public and authenticated route groups, connects Prisma and listens locally outside Vercel. Vercel exports the Express app through the supplied serverless configuration.

The root HTTP message claims database connectivity without performing a per-request check. `/api/health` actually queries MySQL. Use the latter when validating database readiness.

## Functional inventory

| Area | Route prefix | Persistence / behavior |
| --- | --- | --- |
| Authentication | `/api/login` | Username/password lookup, JWT valid for one day |
| Users / IP list | `/api/users`, `/api/ip` | MySQL; JWT-protected groups |
| Public content | `/api/news` | Public list/detail; JWT-protected create/update/delete |
| Banners | `/api/banner` | Public list; JWT-protected image creation/deletion |
| Uploads | `/api/upload` | JWT-protected Cloudinary image upload/deletion |
| Departments / employees | `/api/departments`, `/api/employees` | JWT-protected organizational records |
| IT assets / suppliers | `/api/devices`, `/api/suppliers` | JWT-protected inventory and component relationships |
| Asset assignments | `/api/assignments` | JWT-protected allocation/return/history/export |
| POS | `/api/pos` | JWT-protected devices, assignments, borrowing and returns |
| POS paper | `/api/pos-paper` | JWT-protected inventory and issue records |
| Base.vn | `/api/base-office` | Entire group JWT-protected at app mount; proxies Office/Request/Wework using server tokens |
| Health | `/api/health` | Public database health check |

Important: route files without their own authentication are still protected when mounted behind `verifyToken` in `src/index.js`. They must not be assessed as public in isolation.

### Data groups

- Content: `News`, `Banner`.
- Identity/access: `Users`, `IpWhitelist`.
- Organization/assets: `Department`, `Employee`, `DeviceCategory`, `Supplier`, `Device`, `DeviceAssignment`.
- POS: `PosDevice`, `PosAssignment`, `PosBorrowing`, `PosPaperInventory`, `PosPaperIssue`.

## Prioritized findings

### B01 — Authentication needs hardening before administrative release (P0)

Evidence: `src/models/user.model.js`, `src/controllers/auth.controller.js`, `src/middlewares/auth.middleware.js`.

- Login compares the submitted password directly to the database password field. No password-hash verification is present in this path.
- JWT signing and verification fall back to a fixed value in source if `JWT_SECRET` is absent. A strong configured production secret may prevent this fallback in practice; production configuration is unverified.
- `Users` has no role/permission model. Current middleware verifies a token but performs no module/action authorization or active-user lookup.
- No login throttling is present in the reviewed application middleware.

Next: require server configuration, implement password hashing with a controlled migration/reset strategy, remove frontend fallback login, and define administrative permissions. Preserve access for legitimate administrators during migration.

### B02 — IP whitelist exists but is not enforced (P1)

Evidence: `src/controllers/auth.controller.js`, `src/models/ipWhitelist.model.js`, `src/index.js`.

Login imports the whitelist model but only validates IPv4 format; it does not call `checkIp`. Protected mutations verify JWT only. The only observed `checkIp` caller checks duplicate entries while adding whitelist records.

The source therefore does not satisfy the whitelist requirement in either repository's AGENTS instructions. Raw `x-forwarded-for` is also consumed without an explicit trusted-proxy policy in this source.

Next: define actual proxy/IP behavior for local and Vercel deployments, implement reusable enforcement, and test allowed/denied access on isolated environments before enabling it for production administrators.

### B03 — Successful article creation triggers a local publication fallback (P1)

Evidence: backend `src/controllers/news.controller.js:27`, `src/models/news.model.js:67`; frontend `src/services/news.service.js:738`.

The backend creates a record but responds with `{ success: true }`. The frontend accepts creation as complete only when the response includes `id`; otherwise it creates a browser-local item with a timestamp ID and `status: 'published'`. This can occur even after a successful server write.

Next: agree one create response containing the persisted record/ID, consume it explicitly, and ensure failures never become successful local publication. Test that exactly one server record is created and opens from another browser.

### B04 — Migrated/local content masks current server records (P1)

Evidence: frontend `src/services/news.service.js:225`, `:285`, `:392`, `:770`.

- The merge adds migrated/local records first and excludes server items with the same ID or normalized title, allowing stale data to win.
- Detail reads use local content before contacting the API.
- Updates/deletes suppress API errors and write local overrides.
- Lists request only the first 50 server items and paginate/filter the merged collection locally, so larger server collections are incomplete.

Next: establish server records as authoritative for managed content. Plan legacy ID mapping and migration before changing lookup precedence; provide explicit read-only fallback/local draft states if retained.

### B05 — CMS fields and storage contracts are incomplete (P1)

Evidence: `prisma/schema.prisma` model `News`, content controller destructuring, frontend admin form and `news.service.js`.

Backend News stores ID, title, date string, HTML content, thumbnail, type and author ID. It has no persisted publication status, category/document type, publication year field, structured attachments, slug or lifecycle timestamps. Extra frontend form fields are ignored by current create/update controllers.

Gallery, hero/About settings and banner reordering currently use browser-local frontend storage; matching persistent backend endpoints/models are absent. Gallery, settings and contact submissions have no dedicated backend route in this snapshot.

Next: define versioned contracts and schema changes for the actual publishing workflow, including draft/published visibility and attachment metadata, then migrate on staging.

### B06 — Document upload is unsupported by the real endpoint (P1)

Evidence: `src/routes/upload.routes.js`; frontend `src/apis/upload.js`.

Backend accepts one multipart field named `image` and limits formats to common images. Frontend supports PDF/Word/Excel/archive attachments but falls back to Data URLs or session Blob URLs after upload failure. These local URLs do not establish durable cross-device publication.

No explicit Multer file-size limit is configured. Image deletion derives a Cloudinary identifier from a supplied URL without a persisted ownership record. Cloudinary deletion results are not checked for a successful deletion outcome before reporting success.

Next: design a document-capable upload flow with limits, validated types, persisted asset identifiers and controlled deletion. Keep Cloudinary configuration server-side; verify its suitability for required document types before implementation.

### B07 — Migration history does not reproduce the current schema (P1)

Evidence: `prisma/schema.prisma` and `prisma/migrations/*/migration.sql`.

The initial migration creates `IpWhitelist`, `News`, `Users` and a later migration creates `Banner`; the current schema maps these to lowercase plural table names. The supplied migrations do not create the current POS/paper tables, and the asset migration includes older structures absent from the current schema. Additional root-level SQL/update scripts exist, so the real database may have been maintained outside migrations.

Next: compare a disposable database built from migration history with the intended schema, inspect the actual deployed schema read-only, and prepare a reviewed baseline/data migration. Do not run reset, db push or setup scripts against production to resolve this discrepancy.

### B08 — Inventory/assignment consistency requires concurrency tests (P1)

Evidence: `src/models/posPaper.model.js:105`, `src/models/pos.model.js`, `src/models/assignment.model.js`.

Transactions are already used, which is a useful foundation. However, paper stock is read/validated outside the transaction and later written using the earlier absolute values. Concurrent requests can both pass the check and overwrite inventory counts. POS assignment/borrowing availability is also checked before the transactional writes. IT assignment creation does not check for an existing active assignment in the reviewed create path.

Next: atomic guarded updates or appropriate database locking/constraints, plus concurrent-request tests for issue, assignment and return operations. Also review count-based POS asset-code generation for collisions.

### B09 — Query validation and schema mismatches (P2)

- Paper quantity sorting references `current_quantity`, which is absent from `PosPaperInventory`; the current stored field is `in_stock_quantity`.
- News model supports sort branches using `created_at`, absent from `News`; the controller currently does not forward the sort parameter, so these branches are latent rather than active through that handler.
- Pagination uses numeric conversion without shared bounds/type validation.
- News dates are strings; server-side chronological sorting requires a defined temporal field and migration strategy.

Next: validate IDs, pagination, enums and dates at the boundary; align model fields and sorting contracts; use regression tests for supported filter/sort combinations.

### B10 — Deployment and integration readiness (P2)

- Lockfile records Prisma/client 6.2.1 and `@prisma/config` 7.8.0. Confirm CLI/config compatibility by isolated install, generation and validation before changing versions.
- Backend has build/generate/start scripts but no lint/test scripts.
- CORS currently allows all origins. Define intended clients; CORS does not replace authentication.
- Base.vn has timeout handling and normalization, but some error messages include token fragments and upstream/internal messages pass through to clients. Redact credentials and standardize production errors.
- Environment template omits some optional Request/generic-token aliases used by source. Document canonical required variables per enabled integration.
- Startup does not fail the process with an explicit nonzero exit after a local database connection failure. Root response is not database readiness evidence.

## Frontend/backend contract map

| Frontend feature | Backend support | Required action |
| --- | --- | --- |
| News/service CRUD | Present, limited schema | Return saved records; make server authoritative |
| Shareholder metadata/attachments | Extra fields not persisted | Extend contracts, storage and migration |
| Image upload | Present | Validate limits and deletion ownership/results |
| Document upload | Absent from current image endpoint | Add durable document storage flow |
| Banner list/upload/delete | Present | Remove silent local publication fallback |
| Banner ordering | No persistent order field/endpoint | Add server ordering if retained |
| Gallery and hero/About settings | No dedicated persistent implementation | Add settings/gallery contracts |
| Contact/feedback form | No endpoint | Add verifiable receipt flow |
| Internal operations | Broad existing implementation | Keep separate from public CMS changes; verify integrity |

## Revised phase sequence

1. **Finish Phase 1:** identify backend upstream/deployment, inventory environment names without publishing values, inspect DB schema/backups read-only, resolve migration baseline on staging.
2. **Phase 3A — Reliable publishing:** fix B03/B04 end-to-end; retain the restored public layout. Establish create/update/delete and failure-state tests across two browser sessions.
3. **Phase 3B — Access control:** address B01/B02 with a controlled credential/access transition before production admin acceptance. This is a release prerequisite for protected write flows and may proceed alongside contract work.
4. **Phase 3C — CMS persistence:** extend content/settings/attachment contracts and migrations, add document upload and contact receipt support.
5. **Internal operations workstream:** address B08/B09 without mixing POS/HR workflow changes into public website presentation.
6. **Resume Phases 2/4:** adjust individual UI elements only within the approved direction. Preserve the restored home page unless the user requests a new design.
7. **Phases 5–7:** optimize bundles/assets/metadata, complete integrated QA, release and hand over verified environments and recovery procedures.

## Next implementation boundary

Recommended first change: align article create response and frontend publication behavior, with isolated backend/controller and frontend-service tests. Do not enable production CMS writes until authentication and environment prerequisites are resolved. Avoid bulk importing existing migrated JSON until ID mapping, duplicate handling and backups have been reviewed.

The frontend deployment project and backend should have explicit separate build/upload boundaries. The newly supplied API ZIP/folder must not be inadvertently included in a later frontend CLI upload; decide repository ownership/layout before committing the imported backend.
