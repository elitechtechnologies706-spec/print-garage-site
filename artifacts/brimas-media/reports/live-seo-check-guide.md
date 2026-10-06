# Repeatable, read-only production SEO check

After a future publish, run from the workspace root:

```sh
pnpm --filter @workspace/brimas-media run check:seo:live
```

This command **does not build, publish, change hosting, authenticate, submit a
quote, send a WhatsApp message, or call a telephone number**. It only makes GET
requests. The expected URLs come from `public/sitemap.xml`, with
`https://www.brimasmedia.co` as the canonical origin. It checks production, not
the development preview or local build.

## What it checks

- All source-sitemap pages return 200 and HTML before JavaScript execution.
- Live sitemap matches the source; robots allows public pages, blocks admin/API,
  and references the canonical sitemap.
- The **unchanged** `scripts/check-seo.mjs` runs against a temporary mirror of
  downloaded responses: unique metadata, canonicals, OG/Twitter, headings,
  business/service/FAQ/breadcrumb schema, visible FAQ content, internal links
  and fragments, image alt text, and noindex admin/error documents.
- Additional schema checks reject unverified ratings/reviews and require offer
  prices to appear as visible UGX guide prices.
- Every referenced image, including social images, returns 200 with an image
  content type and a nonempty body. Repeated resources are fetched once.
- Public contact anchors retain the published phone numbers, WhatsApp recipient,
  primary Gmail and existing secondary `info@brimasmedia.net` address. Plain
  WhatsApp chat links are valid; supplied message queries must be nonempty and
  percent-encoded correctly. Quote links retain valid inventory service slugs.
- Quote HTML contains the expected fields, service choices, and submit control.
  Shipped entry scripts return JavaScript and contain the quote-specific message
  and recipient. This is a static wiring check, **not execution of a form**.
- HTTP www, HTTP apex, and HTTPS apex permanently redirect to HTTPS www,
  preserving `/` and a service-page path plus query. Two-hop HTTP apex redirects
  are accepted; loops and unexpected hosts are rejected.
- Two randomized unknown URLs (root and nested) return genuine HTTP 404 with
  custom “Page not found” HTML, one H1, and `noindex, nofollow`.
- `/admin/views` remains 200 HTML and noindex without accessing private data.
  `/404.html` may return 200 or 404; direct error-document status is a separate
  hosting task, not a failure of genuine missing-path behavior.

## Reading failures

The final summary separates **SEO assertions** (a server responded but returned
the wrong status, content type, content or destination) from **transport
failures** (DNS, TLS, timeout, connection or interrupted-body errors). A 404/503
response is an assertion failure, not a network failure.

| Exit code | Meaning |
| --- | --- |
| 0 | All checks passed |
| 1 | SEO assertion failure(s) |
| 2 | Transport failure(s) |
| 3 | Both kinds of failure |
| 4 | Setup/tool failure, such as invalid arguments or unreadable source inventory |

Unavailable responses are never replaced with local build content. The shared
HTML audit is explicitly marked **SKIPPED, not passed**, if its required mirror
is incomplete; other live checks still run. Fix connectivity and rerun when
transport failures prevented a complete audit. The temporary mirror is deleted
even on failure; neither `dist` nor source files are overwritten.

The default request/body timeout is 15 seconds; a pool of four workers limits
concurrent page and asset requests. To change the timeout:

```sh
pnpm --filter @workspace/brimas-media run check:seo:live --timeout-ms 30000
```

For a raw command exit code without pnpm's wrapper:

```sh
node artifacts/brimas-media/scripts/check-live-seo.mjs
```

## Existing local checks and offline tests

Local-output checking is unchanged and performs no production requests:

```sh
pnpm --filter @workspace/brimas-media run check:seo
```

It expects an existing production build in `dist/public`. If building manually
for this root-mounted artifact, supply its workflow environment:

```sh
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/brimas-media run build
```

Offline regression tests need no build or internet connection:

```sh
pnpm --filter @workspace/brimas-media run test:seo:live
```

See `live-seo-verification-2026-10-02.md` for the original live baseline. These
checks do not guarantee Google indexing, rich-result eligibility, executable
quote behavior, email delivery, WhatsApp delivery or actual call completion.