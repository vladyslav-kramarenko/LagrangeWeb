# LagrangeWeb production deployment

This branch deploys the static application to an **independent** Cloudflare Worker:
- Worker name: `lagrangeweb`
- Connected Git branch: `production`
- Build command: empty (no build step)
- Deploy command: `npx wrangler deploy`
- Root path: `/`
- Custom domain: **not connected during testing**
- Temporary test hostname: `lagrangeweb.kramarenko-vladyslav-92.workers.dev` (created by Cloudflare)

The `dev` Worker must continue tracking the `dev` branch. The `master` branch contains the legacy application and is not modified during this initial production deployment.

## Pre-cutover smoke test

On the new Worker URL:

- Home `/`: HTTP 200; English page title and links work.
- `/guide/`: HTTP 200, styling and five languages work.
- `/result/?p=%5B%5B1%2C2%5D%2C%5B2%2C5%5D%2C%5B3%2C10%5D%5D`: the formula is `x² + 1`, graph renders, PNG downloads.
- Calculator: positive, negative, decimal, duplicate-X errors, add/remove rows.
- System/Light/Dark theme and language picker on mobile and desktop.
- Print / Save as PDF: includes input table, formula, graph and explanation.
- Verify `X-Robots-Tag: noindex` on `lagrangeweb.*.workers.dev` before publishing the test link widely.
- Check `/robots.txt`, `/sitemap.xml`, JS/CSS assets and browser console errors.
- Verify canonical links on both pages point to `https://lagrange.kramarenko.info/` and `https://lagrange.kramarenko.info/guide/`.
- Verify that `/result/` has `noindex`.

## Cutover (only after approval)

1. Record the existing DNS/hosting configuration of `lagrange.kramarenko.info` and keep it available for rollback.
2. Associate `lagrange.kramarenko.info` with **lagrangeweb** in Cloudflare → Workers & Pages → Domains & Routes. This is the point where live traffic can change.
3. Check HTTPS, main page, guide, scripts, report, canonical, and `X-Robots-Tag` on the actual production hostname; production must **not** carry a `noindex` header.
4. Verify GA4 page views and events on the canonical host only.
5. Watch Google Search Console for crawl/indexing errors and compare search performance over subsequent days. Do not change canonical URLs.
6. After cutover, decide whether to disable the `workers.dev` route with `workers_dev: false`. Do not disable it before testing.

## Git safety

The `production` and `dev` branches deliberately have different `wrangler.jsonc` Worker names. Before merging future changes from `dev` to `production`, preserve `lagrangeweb` in the production config and review the diff. The production check workflow prevents an accidental wrong Worker name from passing validation.
