# Managing Home-page Activities and Projects

Implemented locally on 2026-11-07. Public home-page styling is retained.

## Admin entry

Open **Hoạt động & Dự án trọng điểm** in the CMS sidebar, at `/admin-dashboard/showcase`.

1. Edit the section title, description and library button text/destination.
2. Edit each card's image, title, location, scale, link text and destination.
3. Use **Chọn ảnh từ máy**, **Chọn từ thư viện**, or a permanent image URL.
4. Use the arrow buttons to reorder cards, add a card or remove a card from the draft. At least one card is required; the limit is 12.
5. Use **Xem trước** to inspect the current draft with the same public card component. Preview does not navigate away or publish changes.
6. Select **Lưu lên máy chủ** to apply the whole section. Errors retain the draft. **Tải lại bản đã lưu** reloads the current server version after confirmation when there are unsaved edits.

Cards and image uploads remain drafts until the section save succeeds. Uploading a file alone does not change the home page. Removing a card does not delete its image file.

## Persistence and access

- `GET /api/showcase` is public and returns the saved configuration/version, or the original four-card defaults before the first save.
- `PUT /api/showcase` requires a valid session, allowed IP and explicit CMS write permission.
- The complete section is persisted as JSON in `home_showcases` with a numeric version.
- Saves use an SQL version guard in a transaction. A stale/concurrent editor receives HTTP 409 and cannot overwrite the latest version silently.
- Frontend save acknowledgements must return the next version; there is no browser-local publication fallback.
- The public section uses the API configuration independently of article content-source mode. While an API is unavailable before first load, the original visual defaults remain visible. A cached successful configuration remains available during a later request error.

## Image storage

- Uploads accept JPEG, PNG, GIF and WebP up to 5 MB; unsupported file signatures and oversized files are rejected server-side.
- Development may explicitly use `UPLOAD_STORAGE=local`, storing files under `%LOCALAPPDATA%/HEPCO/uploads` and serving permanent relative `/api/media/images/*` URLs through the backend.
- Local media paths resolve against `VITE_API_BASE_URL`, not the frontend host.
- Local filesystem storage is disabled on Vercel and production. Configure Cloudinary for deployed uploads; missing production storage fails clearly instead of returning temporary URLs.
- Existing Cloudinary banner routes retain their configuration initialization. The existing upload-stack dependency advisories remain a separate production gate.

## Migration and deployment

The new model and additive SQL are in `prisma/migrations/20261107010000_home_showcase/migration.sql`. It has been applied and exercised only on the isolated local `hepco_integration` database. Reconcile the actual backend database/migration baseline before deploying this schema change. Regenerate Prisma Client after updating the backend schema.

Deploy the paired backend/frontend and configure the actual API origin to expose this page on the live website. No production deployment was performed in this delivery.

## Validation

- Frontend service/contract tests: 15 passed.
- Existing backend HTTP/authentication tests: 18 passed.
- Real MySQL integration tests: 16 passed, including uploaded-file persistence, independent-connection reads, card order/text/image round-trips, permissions, invalid URLs, stale versions, simultaneous writes, file-size/type checks and production-local-storage denial.
- During testing, a concurrency defect in a simple Prisma update was identified and replaced with a guarded SQL update inside a transaction. The simultaneous-writer regression test now passes.
- Test configuration and uploaded fixture files are restored/removed after the integration suite.
- Frontend lint and production build are checked for this delivery. No browser-based visual acceptance is claimed.
