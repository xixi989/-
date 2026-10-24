# Phase 5 — Final Report

Date: 2026-10-24 · Project: AUREL STUDIO (`E:\电商网站`)

## 1. Verdict first

| Question | Answer |
|---|---|
| Production build succeeds? | Yes — 43 routes |
| TypeScript / ESLint clean? | Yes / Yes (`--max-warnings=0`) |
| Unit tests? | 116 / 116 |
| E2E tests? | 34 / 34 (desktop 30, mobile 4) |
| P0 / P1 issues? | None known |
| P2 from the previous audit? | 6 fixed, 2 documented (P2-06 routes, P2-08 soft 404) |
| Performance target met (lab)? | LCP 3.1–3.2 s on collection/home — **misses the 2.5 s target** under Lighthouse mobile throttling; CLS 0; TBT 20–70 ms |
| Deployed? | **No — `READY TO DEPLOY`**, no platform credentials on this machine |

## 2. Entry state (checked before touching anything)

The previous audit's 8 P2 items were re-verified against the code, not assumed:

| ID | Re-checked state at entry | Action this phase |
|---|---|---|
| P2-01 product photos | 4 mappings corrected, 5 in `PHOTO_PENDING` | left as-is; audit doc stands |
| P2-02 currency copy | fixed (announcement/nav/PDP/details all follow currency) | verified by E2E |
| P2-03 search prices | fixed | verified by E2E |
| P2-04 wishlist React error | fixed (stable snapshot) | verified: 0 console errors |
| P2-05 German coverage | fixed incl. `de-DE` numbers | verified by E2E |
| P2-06 no `/de` routes | documented as UI preview only | unchanged (deliberate) |
| P2-07 dead links | 9 content pages exist | verified 200 |
| P2-08 soft 404 | robots conflict fixed, status still 200 on first hit | unchanged (documented) |

No P2 had silently regressed.

## 3. What was delivered

### Performance (`PERFORMANCE_REPORT.md`)
- Baseline + after Lighthouse runs (mobile emulation, local prod server) for home, collection, PDP.
- 5 evidence-based changes: AVIF/WebP formats, hero quality 72, card preload 4→2, favicon 404
  fix (`src/app/icon.svg`), visually-hidden `h2` for heading order.
- Measured effect: images **−36% / −37% / −34%**; collection perf 92→94 and a11y 98→100;
  home/PDP movement is inside noise (re-runs: 93/97).
- Explicitly NOT TESTED: field INP, real-device LCP, bundle analyser numbers.

### E2E (`e2e/`, `playwright.config.ts`)
- 34 tests: home (incl. every header/footer link resolving), collection (filters write URL,
  sort order, empty state), PDP (gallery/colour, sold-out size, exact variant added), cart
  (add, merge, split by size, quantity, removal, persistence, disabled checkout), wishlist
  (save/list/remove/persist), search (live results, no-results, submitted page survives reload),
  currency (USD/GBP/EUR, bag survives switch), i18n (German UI + `de-DE` amounts), SEO
  (title/canonical/OG, JSON-LD USD offers, sitemap, robots/noindex, 404 + single robots tag),
  mobile (menu, overflow across 6 pages, drawer width, quick add).
- Runs against the production build via `webServer`; reuses system Edge (`channel: "msedge"`)
  so no 100 MB browser download is required.
- Test isolation: `localStorage` cleared once per test (guarded by a `sessionStorage` flag, so
  navigation does not wipe the bag mid-test).

### Portfolio package
- `PORTFOLIO_CASE_STUDY.md` (architecture diagram, features, honest boundaries)
- `INTERVIEW_GUIDE.md` (30 s / 1 min / 3 min scripts, two résumé versions, 8 Q&As)
- `docs/portfolio/screenshots/` — 10 real screenshots from the production build
  (`node scripts/screenshots.mjs`)
- `DEPLOYMENT_GUIDE.md` (status, env matrix, exact steps, post-deploy checklist)
- `README.md` updated with screenshots, scripts, deployment status and QA table

## 4. Commands actually run

| Command | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx eslint src --max-warnings=0` | clean |
| `npx vitest run` | 116 passed |
| `npm run build` | success, 43 routes |
| `npx playwright test` | 34 passed (30.5 s) |
| `npx lighthouse` ×3 pages ×2 phases + 2 home re-runs | see `PERFORMANCE_REPORT.md` |

## 5. Remaining issues (open, not hidden)

| # | Issue | Severity | Why it is still open |
|---|---|---|---|
| 1 | First request to an unknown `/products/*` or `/collections/*` slug returns HTTP 200 (body is the 404 page) | P2 (SEO) | `dynamic`/`dynamicParams` rejected by `cacheComponents`; `instant = false` had no effect. Fixing it means disabling PPR globally or adding a middleware allow-list — both bigger than the defect |
| 2 | No `/de` URLs; German is localStorage-only | P2 (i18n) | Needs `app/[locale]` + server dictionaries; documented in the region dialog and README, no fake `hreflang` |
| 3 | 5 products show category-adjacent photography (bag, linen trouser, pleated trouser, beanie, scarf) | P2 (trust) | The stock library has no such photos; `PRODUCT_IMAGE_AUDIT.md` lists the exact shots needed; a test fails if a *non-pending* product uses mismatched imagery |
| 4 | LCP 3.1–3.2 s vs the 2.5 s target | P2 (perf) | Lab-only measurement on a local server with simulated slow 4G. Next lever is pre-generating AVIF + self-hosting fonts; not done this phase |
| 5 | P3 items from the audit (sort control duplicate `div`/chevron, search empty-state copy reuses the collection wording) | P3 | Out of this phase's scope; cheapest next wins |
| 6 | No checkout | By design | Portfolio demo; the disabled button explains it |

## 6. Deployment status

`READY TO DEPLOY`, not deployed.

- No `vercel` CLI, no `.vercel` link, no `VERCEL_TOKEN`, no `gh` CLI, no git remote.
- Build is deployable as-is; `.env.example` documents both variables; `.gitignore` excludes
  `node_modules`, `.next`, `.env*` (except `.env.example`), Playwright output and `.lighthouse`.
- The three commits (`baseline` → `fix(qa)` → `feat(phase5)`) are real history from this work,
  not back-filled.

**No URL exists to send to an interviewer until someone with account access runs the four
commands in `DEPLOYMENT_GUIDE.md`.**

## 7. Is it ready to show?

- **Independent-site operations role:** yes for a front-end/merchandising discussion — the
  variant model, filter taxonomy, cross-border price presentation and SEO layer are real and
  testable. The gap is that nothing is live, so no analytics or order data exists (by design).
- **Independent-site build role:** yes — it demonstrates App Router, typed state, an adapter
  seam, i18n architecture, technical SEO, tests and a measured performance pass.
- **Send a demo URL today?** No. There is no URL. Run the deployment guide first (~10 minutes
  once `vercel login` succeeds), then run the post-deploy checklist against the real host.
