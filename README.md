# kristofferrisa.no

Kristoffer Risa's personal site and CV. Plain HTML, CSS and a few lines of JavaScript in `site/`, served by
Cloudflare Workers static assets. No framework, no build step, no cookies.

```
site/index.html      Norwegian (default)
site/en/index.html   English
site/assets/         site.css, site.js, self-hosted fonts (Instrument Serif, Inter)
site/_headers        security headers (CSP) and caching
site/_redirects      old links
wrangler.jsonc       the infrastructure: Worker, assets and custom domains per environment
```

The CV is the page itself: "Last ned CV (PDF)" prints it, and the print stylesheet lays it out as A4.

## Branches and environments

| Branch | Environment | URL | Deploys on |
|---|---|---|---|
| `test` (default) | `test` | https://test.kristofferrisa.no (noindex) | every merge that touches `site/` or `wrangler.jsonc` |
| `prod` | `prod` | https://kristofferrisa.no | **Promote test → prod** workflow, after approval |

Feature branch → PR into `test` (squash) → deploys to test → run **Promote test → prod** from `test` → approve → live,
and `prod` is fast-forwarded to the promoted commit. Rulesets are in `.github/rulesets/`.

Actions minutes: one job per deploy, no install step (wrangler runs through `npx` at the version pinned in the
workflows), docs-only changes do not deploy, and there is no CI on pull requests. The repo is public, so
GitHub-hosted runners do not draw from the minutes budget anyway.

## Local development

```bash
npx wrangler@4.158.0 dev --port 8788
```

Or open `site/index.html` directly. Manual deploy (needs `wrangler login`):

```bash
npx wrangler@4.158.0 deploy --env test
```

## Telemetry (vakt)

- **Page views:** counted server-side by vakt-edge, a Worker route `kristofferrisa.no/*` that runs in front of this
  Worker's custom domain. Nothing in the browser, no consent banner needed.
- **Errors and events:** `site/assets/site.js` loads vakt's browser script (`rum.kristoffer.dev/v.js` in prod,
  `rum-test.` in test, nothing locally) without `data-pageview`. Clicks on `data-vakt-event` elements are `web.event`s.
  The hostnames must be in vakt-edge's `BROWSER_SITES`.

## GitHub settings this repo expects

- Repository variable `CLOUDFLARE_ACCOUNT_ID`.
- Secret `CLOUDFLARE_API_TOKEN`: account *Workers Scripts: Edit*, zone `kristofferrisa.no` *Workers Routes: Edit*
  and *DNS: Edit* (custom domains create their DNS record).
- Environments `test` and `prod`; `prod` has a required reviewer.
