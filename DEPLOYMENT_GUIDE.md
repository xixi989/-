# Deployment Guide — AUREL STUDIO

**Status: `READY TO DEPLOY` — not `DEPLOYED`.**

There is no live URL, and this document will not pretend otherwise. Everything below was
verified locally; the only missing pieces are platform credentials, which must be supplied
by the account owner.

## Why it is not deployed

| Requirement | State on this machine |
|---|---|
| `vercel` CLI installed | **No** — `command -v vercel` finds nothing |
| `.vercel/` project link | **No** |
| Vercel token (`VERCEL_TOKEN`) | **Not present** |
| `gh` CLI (to create a GitHub repo) | **No** |
| Git remote | **None** — repository is local only, 3 commits |
| Network access to Vercel | Not exercised — no credentials to use it with |

Nothing here is a technical blocker. The build is green, the app runs in production mode, and
`vercel deploy` would work immediately after `vercel login` (or a token) from an authorised
account.

> Do not paste tokens into this chat. Run the login flow locally; it stores credentials in
> the CLI's own config.

## What is ready

- Production build: `npm run build` → passes, 43 routes (25 products, 7 collections, 6
  transactional, 9 content pages, sitemap, robots).
- Environment contract: `.env.example` documents both variables; the app builds and runs
  **without** them (it simply emits no canonical/OG URLs and closes indexing).
- `.gitignore`: ignores `node_modules`, `.next`, `.env*` (with `!.env.example`), Playwright
  reports and the Lighthouse artifact folder.
- Preview-safety defaults: `SEO_INDEXING` defaults to closed.
- `README.md` documents local setup, scripts and known limitations.

## Environment variables

| Variable | Local | Preview | Production |
|---|---|---|---|
| `SITE_URL` | `http://localhost:3000` | the `*.vercel.app` preview origin | the real origin, e.g. `https://aurel-studio.example` |
| `SEO_INDEXING` | `true` (to inspect tags) | `false` — previews must stay out of the index | `false` for a portfolio demo; `true` only if this ever becomes a real store |

`SITE_URL` must have **no trailing slash**. With it unset, `canonical`, `og:url` and
`sitemap.xml` are omitted entirely rather than falling back to localhost.

## Step 1 — push to GitHub (private by default)

```bash
cd E:\电商网站
git log --oneline          # baseline + QA fix + phase 5, real history
gh repo create aurel-studio --private --source=. --remote=origin --push
# no gh CLI? create the repo in the UI, then:
git remote add origin git@github.com:<your-account>/aurel-studio.git
git push -u origin main
```

Keep it **private** unless you deliberately want the source public. Nothing in the repo is
sensitive, but the decision is yours, not the tooling's.

## Step 2 — import into Vercel

1. `vercel login` (or `export VERCEL_TOKEN=…` from an authorised account).
2. `vercel link` → create a new project from the repo.
3. Framework preset: **Next.js** (auto-detected). Build command `next build`, output
   `.next` — the defaults are correct, do not override them.
4. Add environment variables per the table above. Set `SEO_INDEXING=false` on **all**
   environments for a portfolio demo.

## Step 3 — deploy a preview first

```bash
vercel deploy            # preview URL
vercel deploy --prod     # only after the preview passes the checklist below
```

## Step 4 — post-deploy checklist (run against the real HTTPS URL)

```bash
BASE=https://<deployment-host>

curl -s -o /dev/null -w "home %{http_code}\n"        $BASE/
curl -s -o /dev/null -w "collection %{http_code}\n"  $BASE/collections/women
curl -s -o /dev/null -w "product %{http_code}\n"     $BASE/products/wool-overcoat
curl -s -o /dev/null -w "cart %{http_code}\n"        $BASE/cart
curl -s -o /dev/null -w "wishlist %{http_code}\n"    $BASE/wishlist
curl -s -o /dev/null -w "search %{http_code}\n"      "$BASE/search?q=wool"
curl -s -o /dev/null -w "404 %{http_code}\n"         $BASE/not-a-page
curl -s $BASE/ | grep -o '<link rel="canonical"[^>]*>'
curl -s $BASE/sitemap.xml | grep -c "<loc>"
curl -s $BASE/robots.txt
```

Then in a browser at the real URL:

- [ ] Images load (no broken frames); hero and product photos decode.
- [ ] Region selector → United Kingdom → prices become `£`; Germany → `€`.
- [ ] Language → Deutsch → navigation and cart become German; bag survives the switch.
- [ ] Add to bag → drawer opens → `/cart` totals match the drawer.
- [ ] Wishlist save → reload → still saved.
- [ ] Search `wool` → results → product page.
- [ ] View source on a product page: canonical is the deployment host, JSON-LD
      `priceCurrency` is `USD`, `og:image` is the product's own photo.
- [ ] Console has no errors (favicon included).
- [ ] 375 px: no horizontal scroll; drawer fits the viewport.

Record the result here when it exists:

```
Preview URL:  (not deployed)
Production:   (not deployed)
Verified on:  —
```

## Preview indexing

Two independent controls, because either one alone is insufficient:

1. `SEO_INDEXING=false` → every page carries `robots: noindex` and `robots.txt` disallows all.
2. For a URL that must never be public, use **Vercel Deployment Protection** (Vercel
   Authentication / password protection) rather than relying on robots meta. `Disallow`
   stops crawling, not access.

## Rollback

```bash
vercel ls                    # list deployments
vercel promote <deployment>  # move traffic back to a known-good build
```

Locally, the repository history is the rollback: `git revert <sha>` or
`git checkout <sha> -- .` for a single file.

## Cost note

Vercel's Hobby tier is free and sufficient for this project (static + PPR routes, no database,
no functions beyond route handlers for sitemap/robots). No paid resource is required, and no
domain has been purchased. `*.vercel.app` is adequate for an interview demo.
