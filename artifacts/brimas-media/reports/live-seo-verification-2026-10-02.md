# Brimas live Netlify SEO verification

Verified on 2026-10-02 at approximately 09:28 UTC against **https://www.brimasmedia.co**.

## Result

The updated SEO build is live on Netlify. All 15 sitemap-listed public pages passed the existing SEO check inventory against HTML downloaded from production, not against a local build. No site code, design, hosting settings, Git remotes, or publishing configuration was changed; no deployment was initiated.

## Method

- Downloaded the live sitemap and all listed routes with HTTP GET, recording status, content type, and response HTML before JavaScript execution.
- Downloaded the images referenced by those documents.
- Executed `artifacts/brimas-media/scripts/check-seo.mjs` against a temporary mirror of these live responses. Only its output-directory and source-sitemap paths were adjusted in memory; the repository checker was unchanged.
- Compared the live sitemap to `artifacts/brimas-media/public/sitemap.xml`.
- Checked redirects without automatic redirect following, then followed each recorded Location manually.
- Checked contact and quote anchors, the live quote form HTML, and the shipped JavaScript's quote-to-WhatsApp message and recipient.
- Visually inspected a screenshot of the live homepage; it rendered successfully.

## Public routes

Each route returned **HTTP 200**, `text/html; charset=UTF-8`, server `Netlify`, crawlable body content, and `index, follow`.

| Route | SEO inventory |
| --- | --- |
| `/` | Pass |
| `/price-list` | Pass |
| `/request-a-quote` | Pass |
| `/printing-services-kampala` | Pass |
| `/business-cards-printing-kampala` | Pass |
| `/flyers-brochures-printing-kampala` | Pass |
| `/banner-printing-kampala` | Pass |
| `/large-format-printing-industrial-area` | Pass |
| `/t-shirt-printing-embroidery-kampala` | Pass |
| `/uniform-embroidery-kampala` | Pass |
| `/promotional-items-mugs-pens-kampala` | Pass |
| `/ppe-supplier-kampala-uganda` | Pass |
| `/safety-helmets-overalls-kampala` | Pass |
| `/corporate-gifts-branding-kampala` | Pass |
| `/construction-company-branding-bundle` | Pass |

### Checks passed across the inventory

- Unique, nonempty titles and descriptions across all 15 pages.
- Exactly one H1 per document, semantic main content, and no H3 before an H2.
- Exact route-specific `https://www.brimasmedia.co` canonicals and OG URLs.
- OG/Twitter titles and descriptions match each page's own metadata; Twitter uses `summary_large_image`.
- OG/Twitter images are on the canonical host and accessible.
- Parseable JSON-LD containing Organization/LocalBusiness, WebSite, and WebPage.
- Business JSON-LD has the expected Kampala address, public email, and both public telephone numbers.
- All 12 service pages have BreadcrumbList, FAQPage, and a genuine Service or Product object.
- Breadcrumb positions and final URLs match their pages; FAQ questions and answers occur in the rendered HTML.
- Product offer prices occur in visible page content, use UGX, and represent guide prices. No fabricated aggregate-rating or review objects were found.
- **640** internal links resolve to inventory routes, with valid fragment targets.
- **78** image references passed the checker's accessibility/alt-text inventory; all **38** unique referenced image URLs returned HTTP 200 with image content types.

Checker output:

> SEO checks passed: 15 crawlable pages, unique metadata, H1s, schema, 640 internal links, 78 image references, sitemap, robots and noindex 404/admin.

This verifies the implemented schema against published content and the project's inventory. It does not guarantee Google indexing or eligibility for every rich-result type.

## Sitemap and robots

- `/sitemap.xml`: HTTP 200, `application/xml`, exactly 15 unique canonical-host URLs, identical to the source sitemap.
- Admin and 404 routes are excluded from the sitemap.
- `/robots.txt`: HTTP 200, `text/plain; charset=UTF-8`; allows `/`, disallows `/admin/` and `/api/`, and references `https://www.brimasmedia.co/sitemap.xml`.
- `/admin/views`: HTTP 200 with private-admin HTML and `noindex, nofollow`; one H1. Authentication and private data access were not exercised.

## Quote, WhatsApp, and call links

- The 14 non-form public pages contain quote, WhatsApp, and call anchors.
- **54** quote links target `/request-a-quote`; supplied service parameters match actual service routes.
- **80** unique WhatsApp URLs use `https://wa.me/256700584499`, including correctly escaped message queries.
- Call anchors target `tel:+256700584499` or `tel:+256414581806`.
- `/request-a-quote` returns its service selector, quantity/specification fields, and “Continue to WhatsApp” submit control in crawlable HTML.
- The shipped `/assets/index-Dr4EBh71.js` returned HTTP 200 and contains the intended quote-specific message and WhatsApp recipient. The source submission handler assembles the brief and navigates to WhatsApp.
- No quote was submitted, no WhatsApp message was sent, and no telephone call was initiated. External WhatsApp delivery and actual call completion are outside this verification.

## Redirects and missing pages

Verified both `/` and `/banner-printing-kampala?seo_verify=1`; service path and query parameters survived every redirect.

| Entry host/scheme | Observed chain |
| --- | --- |
| HTTP apex | 301 to HTTPS apex → 301 to HTTPS www → 200 |
| HTTP www | 301 to HTTPS www → 200 |
| HTTPS apex | 301 to HTTPS www → 200 |

Genuinely nonexistent routes:

- `/seo-verification-nonexistent-20261002-8f2d94`: **HTTP 404**.
- `/printing-services-kampala/seo-verification-nonexistent-8f2d94`: **HTTP 404**.

Both returned the custom “Page not found” HTML, one H1, and `noindex, nofollow`, not homepage HTML. The Netlify fallback is functioning as intended.

## Remaining hosting observations

No blocking SEO hosting failure was found.

1. Direct requests to `/404` and `/404.html` return **HTTP 200**, not 404, because these are deployed static documents. Both are `noindex, nofollow` and excluded from the sitemap. Unknown URLs correctly return 404, so this is limited to the explicit error-document URLs. Optional follow-up: make direct error-document requests return 404 without breaking the fallback.
2. HTTP apex requests take two permanent redirects rather than one. HTTPS www remains the consistent final host; paths and query parameters are preserved. This is a minor efficiency observation, not a redirect failure.

No hosting corrections were applied as part of this verification-only task.