# HEPCO Corporate Website

Corporate information and public-service website for **Hue Urban Environment and Public Works Joint Stock Company (HEPCO)**.

This README is the delivery plan and contributor entry point for upgrading the existing website. Implemented work, planned work and acceptance requirements are recorded separately.

## Contents

- [Project overview](#project-overview)
- [Delivery status](#delivery-status)
- [Technology and architecture](#technology-and-architecture)
- [Local development](#local-development)
- [Environment configuration](#environment-configuration)
- [Website structure](#website-structure)
- [Phased delivery roadmap](#phased-delivery-roadmap)
- [Engineering standards](#engineering-standards)
- [Quality and acceptance](#quality-and-acceptance)
- [Git and Vercel workflow](#git-and-vercel-workflow)
- [Release and rollback](#release-and-rollback)
- [Operations and handover](#operations-and-handover)
- [Known limitations](#known-limitations)

## Project overview

| Item | Reference |
| --- | --- |
| Canonical working checkout | `D:\Laptrinh\Website` |
| GitHub | [lequan2512/HEPCO_website](https://github.com/lequan2512/HEPCO_website) |
| Vercel project | [lequan2512/hepco](https://vercel.com/lequan2512/hepco/) |
| Existing website / legacy assets | [hepco.com.vn](https://www.hepco.com.vn/) |
| Baseline commit | `a0c9fd8a148f191007bc6cae981d845677f82339` |
| Initial upgrade branch | `codex/hepco-phase-one` |
| Initial implementation commit | `9457499` |

### Product goals

- Help residents and customers find collection schedules, invoices, contact channels and services in one or two interactions from the home page.
- Make corporate information and shareholder documents easy to search and read.
- Present a restrained, accessible corporate identity with real HEPCO imagery.
- Make submission, save and publication statuses truthful and verifiable.
- Support maintainable content management, repeatable deployments and recoverable releases.

### Scope and dependencies

Upgrade the existing public website, frontend CMS behavior, backend integrations, responsive layouts, accessibility, performance, SEO and release operations. Preserve useful content, attachments and working routes.

The backend, database and file-storage implementation are not included in this checkout. Confirm their deployment, ownership and contracts before accepting backend-dependent phases. New backend infrastructure or substantial data migration requires a separately defined scope and estimate.

## Delivery status

Snapshot: **2026-11-06**. Historical results below are not live deployment indicators.

- [x] Local source matched GitHub HEAD at baseline intake.
- [x] Git remote points to the intended repository.
- [x] Vercel CLI confirmed the repository is already connected to project `hepco`.
- [x] Initial home-page simplification and direct contact route implemented.
- [x] Facebook actions clarified and selected shared contact details centralized.
- [x] Initial implementation passed `npm run build` and `npm run lint`.
- [x] Implementation committed and pushed as `9457499`.
- [ ] Initial Preview completion and visual review confirmed.
- [ ] Backend authentication, persistence and publication verified.
- [ ] All phases accepted and released to production.

The first [Preview deployment](https://hepco-13hjisfe0-lequan2512.vercel.app) was last observed in **Building** state. Its final status and visual behavior remain unverified in this delivery record. The initial upgrade has not been promoted to production.

See [implementation notes](docs/IMPLEMENTATION.md) for the original baseline and first-delivery details. This README is the phase plan; update both records when their status changes.

## Technology and architecture

| Concern | Current technology |
| --- | --- |
| UI / routing | React 19 / React Router 7 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 / Sass |
| Server state / HTTP | TanStack Query / Axios |
| Client state | Zustand |
| Forms | Formik / Yup |
| Icons | Lucide React |
| Content / documents | React Quill, PDF.js, ExcelJS and SheetJS |
| Hosting | Vercel with GitHub integration |

Exact dependency versions are recorded in `package-lock.json`.

```text
src/
  apis/                  Query/mutation hooks and existing API modules
  assets/                Bundled images and assets
  components/            Shared public and administrative components
  constants/             Routes, company details and domain constants
  data/                  Migrated content snapshot
  pages/
    user/                Public pages, including Home/components
    admin/               CMS and operational administration screens
  services/              Backend communication and content services
  store/                 Zustand stores
  utils/                 Shared helpers and existing Axios instance
  App.jsx                Router and application providers
  index.css              Global styles and Tailwind theme
public/                  Static files
.agents/AGENTS.md        Repository engineering instructions
.vercelignore            CLI upload exclusions
vercel.json              Legacy-upload rewrite and SPA fallback
vite.config.js           Plugins and local legacy-upload proxy
docs/IMPLEMENTATION.md   Baseline and initial delivery record
```

Content currently combines backend responses, migrated data and browser-local overrides. A page rendering successfully does not prove server publication. Phase 3 must make these distinctions explicit.

## Local development

### Prerequisites

- Git and npm.
- Node.js compatible with the installed toolchain: **20.19+ in the 20.x line, 22.13+ in the 22.x line, or 24+**.
- Backend access for flows that require it; migrated content may allow partial public-page use without it.

These runtime constraints come from installed Vite, React plugin and ESLint package metadata. Vercel was observed configured for Node.js 26.x during intake. Align local and hosting runtimes before release.

### Setup

```powershell
git clone https://github.com/lequan2512/HEPCO_website.git
Set-Location HEPCO_website
npm ci
```

Skip cloning when using the existing canonical checkout. To inspect the initial upgrade after cloning, check out `codex/hepco-phase-one`.

If `.env.local` does not exist, create it from the template; preserve existing settings:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Open the local URL printed by Vite. Port 5173 is the usual default; another port may be selected when occupied.

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the lockfile dependency tree |
| `npm run dev` | Start local development with hot reload |
| `npm run lint` | Run configured ESLint checks |
| `npm run build` | Generate production assets in `dist/` |
| `npm run preview` | Serve an existing production build locally |

There is no automated test script in `package.json`. Lint and build do not replace functional or browser testing.

## Environment configuration

| Variable | Purpose | Current fallback |
| --- | --- | --- |
| `VITE_API_BASE_URL` | External backend base URL | `http://localhost:3000` |

Example local configuration:

```dotenv
VITE_API_BASE_URL=http://localhost:3000
```

- Configure the intended HTTPS API URL separately for Preview and Production; deployed builds must not unintentionally use localhost.
- Vite embeds `VITE_*` values into client code at build time. Never use them for passwords, signing keys, database credentials or service tokens.
- Apply environment changes through a new build/deployment.
- Keep real environment files out of Git and CLI uploads. `.env.example` contains placeholders only.
- Validate CORS, authentication, storage permissions and backend access in each environment.

Vercel forwards `/Public/Upload/*` to `www.hepco.com.vn`; local development uses the corresponding Vite proxy. A standalone `npm run preview` server does not reproduce that Vercel rewrite. Check legacy files on Vercel or an equivalent routing environment.

## Website structure

Target navigation: **Home · About · Services · News and Notices · Shareholder Relations · Contact**. Keep electronic invoices clearly visible as a utility and administration in a separate flow.

| Section | Existing route | Target experience |
| --- | --- | --- |
| Home | `/` | Identity, utilities, timely information, services and contact |
| About | `/gioi-thieu` | Legal identity, history, organization and capabilities |
| Services | `/dich-vu` | Service groups, real imagery and contact instructions |
| News / notices | `/tin-tuc` | Searchable information with categories and dates |
| Shareholders | `/co-dong` | Documents searchable by year and type |
| Article | `/bai-viet/:id` | Readable content, attachments and related navigation |
| Contact | `/lien-he` | Verified channels; confirmed submission flow when available |

Home-page sequence: identity/hero → quick utilities → news/notices → services → company/shareholder information → contact → footer. Keep long history, galleries and detailed content on their appropriate pages.

## Phased delivery roadmap

Completing an initial component does not complete the entire phase. Each phase requires its acceptance evidence.

| Phase | Deliverable | Status |
| --- | --- | --- |
| 1 | Source, infrastructure and content baseline | Partially complete |
| 2 | Information architecture and UI standard | Initial home-page work implemented; review pending |
| 3 | Reliable essential functions and CMS | Pending backend assessment |
| 4 | Complete public-page experience | Pending |
| 5 | Performance, SEO and accessibility | Pending |
| 6 | Integrated QA and acceptance | Pending |
| 7 | Production release and handover | Pending |

### Phase 1 — Discovery and baseline

**Work**

- Inventory routes, content, media, documents, forms, APIs and administrative modules.
- Identify the source of truth for each collection: backend, migrated snapshot or local draft.
- Confirm backend ownership, database, file storage, backups and environment configuration.
- Record production branch, domains, deploy settings and recovery references.
- Prioritize issues: P0 = release blocker; P1 = core task failure; P2 = functional/quality gap; P3 = minor improvement.

**Acceptance:** reviewed inventory, prioritized issue list, environment map and recoverable baseline. Missing access and backend assumptions are documented.

### Phase 2 — Information architecture and UI standard

**Work**

- Finalize sitemap, navigation, home-page hierarchy and legacy URL handling.
- Define desktop/mobile templates for home, services, articles, documents and contact.
- Standardize colors, typography, spacing, controls, forms and state messages.
- Use restrained green/white/gray, limited orange accents, moderate radii and real operational imagery.
- Obtain content-owner approval of legal identity, contact details, statistics and service claims.

**Acceptance:** representative layouts reviewed; essential tasks reachable in one or two interactions; action labels match actual behavior.

**Existing contribution:** `9457499` simplifies the home-page composition, adds direct contact information and clarifies Facebook actions. Visual review remains required.

### Phase 3 — Essential functions, authentication and CMS

**Work**

- Verify collection-schedule and invoice destinations and their real capabilities.
- Implement validated contact submission with verifiable server acceptance.
- Verify server-side authentication/authorization and remove frontend fallback accounts from production flows.
- Separate local drafts, server saves and publication; never silently replace server publication with a browser-local save.
- Handle expired sessions, failed requests, unsaved changes and retry behavior.
- Verify uploads, storage permissions and published attachment access.
- Provide useful 404 and data-error experiences.

**Acceptance:** server enforces permissions; published content appears on another device/browser; failed submissions retain input and do not report success; invalid routes provide recovery.

**Dependency:** inspect the real backend. Backend security rules in `.agents/AGENTS.md` are requirements to verify, not proof that the deployed service already meets them.

### Phase 4 — Public pages and responsive behavior

**Work**

- Apply reviewed header/footer and templates across public pages.
- Complete About, Services, News, Article, Shareholder and Contact layouts.
- Make service links open/select the intended service.
- Show document title, reference number when available, publication date, type and view/download actions.
- Finish search, year/type filters, pagination and empty/error states.
- Verify long titles, tables, attachments and images on small screens.

**Acceptance:** consistent layouts; working filters/pagination; files open/download; no unintended horizontal overflow; usable mobile menu and controls.

### Phase 5 — Performance, SEO and accessibility

**Work**

- Split admin, PDF, editor and spreadsheet code from initial public-page loading.
- Optimize logo/images; declare dimensions and defer offscreen media.
- Review unused dependencies, caching, timeouts and legacy asset dependencies.
- Add per-page title, description, canonical and sharing metadata suited to the SPA architecture.
- Prepare sitemap, robots directives and redirects where routes change.
- Verify headings, labels, alt text, keyboard access, focus, contrast and reduced-motion behavior.

**Acceptance:** comparable before/after measurements; metadata verified on actual article URLs and for intended sharing crawlers; recorded keyboard/mobile checks.

**Targets:** LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 in representative field measurements. These are goals, not verified current results. Report lab data separately when field data is unavailable.

### Phase 6 — Integrated QA and acceptance

**Work**

- Test desktop, tablet and mobile layouts.
- Exercise schedules, invoices, search, document filtering/downloads and contact channels.
- Test login, editing, drafts, publication, expiry and failures against the intended backend.
- Check direct URL navigation/refresh, invalid routes, missing images and unavailable APIs.
- Review identity, contact information, dates and public claims.
- Record commit, deployment, environment, browser/viewport, result and evidence.

**Acceptance:** no unresolved P0/P1 defects. Lower-priority exceptions have an owner and resolution plan. Content and technical owners accept the same release candidate.

### Phase 7 — Release and operational handover

**Work**

- Record release notes, accepted commit and previous known-good deployment.
- Merge through the configured production workflow and follow Vercel to successful completion.
- Smoke-test domains, nested routes, media, documents, contact and publishing after deployment.
- Deliver editing/publication, backup/restore, troubleshooting and escalation instructions.

**Acceptance:** production runs the accepted commit; smoke checks pass; rollback is documented; operational ownership is assigned.

### Planning estimates

| Work package | Estimated effort |
| --- | --- |
| Baseline and initial Preview review | 1–2 working days |
| Essential functions and CMS integration | 3–6 working days |
| UI standard and public-page completion | 4–6 working days |
| Optimization and acceptance testing | 2–4 working days |
| Release and handover | 1 working day |
| Total | 11–19 working days |

These are planning estimates, not elapsed-time commitments. Re-estimate after Phase 1. New backend infrastructure, major migration and content-approval delays are additional dependencies.

## Engineering standards

Follow [.agents/AGENTS.md](.agents/AGENTS.md).

- Keep page-specific components beside pages and shared components in `src/components`.
- Put backend communication in services and consume it through query/mutation hooks. Review existing API modules incrementally.
- Centralize domain constants; reuse `src/constants/company.js` for company information.
- Use Formik/Yup and the shared pagination component.
- Preserve list headers/search/filters while loading content inside the list area.
- Use mobile-first styling and semantic accessible controls.
- Write comments and technical documentation in English; public UI content remains Vietnamese.
- Keep changes focused and record phase progress with evidence.

## Quality and acceptance

Before code is ready:

- [ ] Requirements and affected routes documented.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes; new warnings assessed.
- [ ] Relevant normal/failure scenarios checked.
- [ ] Affected desktop/mobile layouts reviewed.
- [ ] No secrets or real environment files included.
- [ ] Content and action labels verified.
- [ ] Tested commit, Preview result and limitations recorded.

Add automated tests where they protect meaningful business behavior, authorization or data integrity. Documentation-only changes require link/path and diff checks; rerun application checks when executable inputs change.

Acceptance evidence template:

| Check | Commit / deployment | Environment / viewport | Result | Evidence / owner |
| --- | --- | --- | --- | --- |
| Shareholder PDF download | Candidate SHA and URL | Preview / mobile | Pending | Evidence link and reviewer |

## Git and Vercel workflow

```text
Local change → commit → GitHub branch → Vercel Preview
             → technical/content acceptance → merge → Production
```

1. Begin from the appropriate reviewed branch and inspect working-tree changes.
2. Create a focused `codex/` branch, for example `codex/phase-03-cms-publishing`.
3. Implement and run applicable checks.
4. Commit source/documentation together with a clear message, such as `fix(cms): distinguish local drafts from published content`.
5. Push and open a pull request against the production branch, currently expected to be `main`; confirm it in Vercel before the first production merge.
6. Review the branch-triggered Preview and environment configuration. A push or Building status alone is not deployment success.
7. Record acceptance and merge when release criteria are satisfied.

PRs should explain the problem, resulting behavior, validation, Preview link and limitations. Keep credentials out of commits, PR text and logs.

### Hosting configuration

- Project `hepco` is connected to `lequan2512/HEPCO_website`.
- Framework: Vite; build: `npm run build`; expected output: `dist/`.
- Verify actual dashboard settings and environment scopes before release.
- Keep the legacy-upload rewrite before the SPA fallback in `vercel.json`.
- `.vercel/` holds local project linkage and remains untracked.
- `.vercelignore` excludes local environments and non-deployment files from CLI uploads.
- Routine feature work preserves the existing hosting project and production domains.

## Release and rollback

### Release checklist

- [ ] Candidate commit and Preview identified.
- [ ] Phase acceptance and required checks complete.
- [ ] Production API, storage and environment configuration verified.
- [ ] Current production deployment and data/content backups recorded.
- [ ] Release notes and limitations prepared.
- [ ] Vercel deployment reaches successful terminal status.
- [ ] Post-deployment smoke checks pass.

### Rollback procedure

1. Identify the last known-good production deployment and commit.
2. Restore/promote that deployment through the configured Vercel workflow for urgent application recovery.
3. Revert offending Git commits on a corrective branch and merge through review so source and production converge.
4. Repeat critical smoke checks and record the incident and follow-up.

Frontend rollback does not restore backend data, uploads or database migrations. Plan their recovery separately before data-changing releases. The baseline SHA is a historical source reference, not automatically a tested production recovery target.

## Operations and handover

Assign named owners before production acceptance:

| Responsibility | Handover requirements |
| --- | --- |
| Content owner | Approved company details, editorial rules, document categories and publication process |
| Technical maintainer | Repository access, environment/deploy instructions, dependency review and troubleshooting |
| Backend/data owner | API contracts, authorization, storage, backups and tested restore procedure |
| Release approver | Acceptance evidence, deployment record and rollback decision path |

Maintain a defect backlog, check critical external links/documents, review submission/publication failures and update dependencies through tested changes. Agree backup frequency and retention with the data owner. Frontend deployment history is not an application-data backup.

## Known limitations

- Initial local visual QA failed through the in-app loopback route; remote Preview visual review remains pending in the recorded delivery.
- Initial build reported an approximately 3.83 MB JavaScript chunk (958 KB gzip); the bundled logo is approximately 1.6 MB. These are baseline observations, not performance acceptance.
- Live backend authentication, storage and publication have not been audited in this delivery.
- Migrated content/local overrides may hide backend unavailability; verify data provenance.
- Legacy uploaded files depend on the existing HEPCO host until a verified migration is complete.
- Consolidated company details still require content-owner approval.
- Reconfirm production branch and deployment settings before promotion.

## Ownership and licensing

This repository contains HEPCO-specific content and assets. This README asserts no open-source license. Confirm reuse rights with the project owner before redistributing content or media.
