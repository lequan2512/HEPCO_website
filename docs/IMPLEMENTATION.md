# HEPCO implementation roadmap

## Baseline — 2026-11-06

- Canonical source: `D:\Laptrinh\Website`.
- GitHub: `lequan2512/HEPCO_website`.
- Baseline commit: `a0c9fd8a148f191007bc6cae981d845677f82339` (local main matched remote HEAD).
- Existing Vercel project: `hepco`, owned by `lequan2512`.
- Vercel CLI confirmed that this GitHub repository is already connected.
- Framework: React 19, Vite 8, Tailwind 4; no backend implementation in this checkout.
- Environment files remain local and are excluded from Git and CLI uploads.

## First delivery

- Reduced the home page to identification/hero, quick utilities, news/notices, services, company/shareholder information and contact details.
- Removed unverified statistics, testimonials and automatic carousels from the home page composition; original components remain available.
- Added a contact route with direct telephone/email channels. The previous unconfirmed Google Forms submission flow is no longer presented on the home page.
- Made Facebook destinations explicit and removed unsupported payment and 24/7 wording from visible quick utilities/header.
- Centralized company contact details for the home page, hero, header and footer.
- Added news loading, empty, error and retry states; reduced service-card decoration and deferred service image loading.
- Retained existing CMS settings for hero content and existing news/service data sources.

## Remaining deliveries

1. Review and standardize shareholder document list, filters and attachment behavior on desktop/mobile.
2. Inspect the actual backend deployment and API configuration. Fix authentication and publication semantics; local browser drafts must never be reported as server publication.
3. Implement a contact endpoint with verifiable acceptance, then reintroduce a validated submission form.
4. Standardize remaining content pages, headers, footers and page-level metadata.
5. Split admin/PDF/spreadsheet modules, optimize the 1.6 MB logo and measure real performance.
6. Complete responsive, keyboard, document and production smoke checks before final release.

## Release practice

Work on a `codex/` branch; build and lint before pushing. Deploy a Vercel preview for review. Preserve the baseline commit above as the rollback reference. Production promotion follows completion of the relevant acceptance checks.

## Verification notes

- Initial delivery: `npm run build` and `npm run lint` passed.
- Build still reports a large JavaScript chunk (approximately 3.83 MB, 958 KB gzip); optimization remains open.
- In-app browser could not reach Windows loopback, so local visual QA was unavailable through that route.
- Company details were consolidated from existing source, not independently approved by HEPCO.
