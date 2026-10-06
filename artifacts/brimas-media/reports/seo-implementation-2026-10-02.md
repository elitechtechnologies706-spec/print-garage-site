# Brimas Media — SEO implementation report

Date: 2 October 2026  
Canonical website: https://www.brimasmedia.co  
Status: Changes built and verified in the workspace. This agent did not publish or push changes.

## A. Files changed

Paths below are relative to `artifacts/brimas-media/`, except the root hosting configuration.

- `index.html`: discover the existing Google Fonts stylesheet directly from the HTML head; preserve Google verification and existing metadata.
- `src/App.tsx`: natural homepage headings and service-area copy; explicit logo/catalogue image dimensions.
- `src/lib/image-dimensions.ts`: measured intrinsic dimensions of existing local catalogue assets.
- `src/index.css`: remove the serial Google Fonts CSS import; retain the existing fonts and design.
- `src/pages/PriceList.tsx`: explicit logo dimensions; preserve the existing item-card layout.
- `src/seo/LandingPage.tsx`: align visible breadcrumbs with JSON-LD; image dimensions and high-priority service hero loading.
- `src/seo/service-data.ts`: remove the hard-coded year from generated cost FAQs.
- `src/seo/seo-head.ts`: express the supplied Kampala/Uganda service area consistently for business and services.
- `scripts/prerender.mjs`: generate Netlify redirects for known public `.html` aliases.
- `scripts/check-seo-enhancements.mjs`: regression checks for verification, fonts, service areas, breadcrumbs, dimensions and aliases.
- `package.json`: include those checks in `check:seo`; no dependency changes.
- Root `netlify.toml`: immutable caching only for Vite's fingerprinted assets.
- This report. Project memory also records the client's restrictions on page expansion and unsupported claims.

## B. Routes changed

No canonical public route was renamed, removed or added. The next Netlify build redirects `/index.html` to `/` and each known public `/service.html` alias to its existing extensionless canonical URL. The generated rules exclude admin and error documents. API and 404 rules remain intact. Live trailing-slash redirects already work and were not changed.

## C. SEO changes implemented

- Replaced awkward homepage keyword constructions with natural printing, branding, workwear and corporate-gift headings.
- Kept existing page titles, unique descriptions, Open Graph/Twitter metadata and current approved price wording.
- Made generated cost FAQs evergreen without changing their answers or quoting policy.
- Retained the Google site-verification tag exactly as supplied.
- Added public alias consolidation without creating new landing pages or rewriting important URLs.

## D. Structured data

Existing Organization/LocalBusiness, WebSite, WebPage, BreadcrumbList, FAQPage and Service markup was retained and checked. Business and service `areaServed` now includes both Kampala and Uganda, as supplied in the brief. The visible service breadcrumb is now Home → current service, matching its JSON-LD. No reviews, ratings, awards, prices, additional locations or unsupported business facts were invented. No additional Product markup was introduced.

## E. Sitemap

Valid XML containing exactly 15 unique, canonical HTTPS `www` URLs: homepage, price list, quote page and 12 existing services. No admin, error, redirect aliases or new keyword pages were added. Source and generated sitemap inventories match.

## F. Robots.txt

Existing directives remain: allow public crawling, exclude `/admin/` and `/api/`, and declare `https://www.brimasmedia.co/sitemap.xml`. Public CSS, JavaScript and images are not blocked.

## G. Internal linking

Preserved the existing homepage, menu, related-service and quote links. The built audit checked 640 internal links, including fragment targets. Breadcrumb labels now match their structured hierarchy; no fictitious `/services` parent URL was created.

## H. Performance improvements

- Explicit dimensions on 74 public-page image references outside the approved workshop player; catalogue values were measured from the actual files.
- Preserve lazy loading below the fold; give existing service hero images high fetch priority.
- Discover fonts from the HTML head rather than waiting for the main CSS to discover an external `@import`; retain preconnect and `display=swap`.
- Configure one-year immutable caching for versioned `/assets/*` on Netlify only. HTML and unversioned images are not given immutable caching.
- Preserve the workshop player, maps, fonts, imagery, colours, layout and working features. No packages were installed, removed or upgraded.

These are targeted loading improvements, not a measured Core Web Vitals score or a guaranteed speed improvement. Current build output reports approximately 153.80 kB gzip JavaScript and 25.02 kB gzip CSS. Route splitting was not introduced because it would broaden this change and affect rendering behavior.

## I. New pages

None. Existing service content already covers distinct commercial intents. No additional service page was created without confirmed service coverage and a distinct purpose.

## J. Remaining issues and limits

- Live `.html` aliases currently return HTTP 200 with canonical tags. New redirect rules and asset-cache headers require the next Netlify publication, followed by live verification.
- Google Search Console indexing, sitemap acceptance, ownership verification and field Core Web Vitals were not accessible from this code audit.
- Google Business Profile/business-listing consistency requires the actual listing and owner access.
- Existing operational claims, machine inventory, turnaround/delivery terms, contact details, opening hours and price-sheet freshness were preserved, not independently certified by this audit.
- The build passes but emits existing sourcemap-location warnings in UI components. No runtime failure was observed.
- Browser automation initially expected a price-list table incorrectly. The existing product-card layout is legitimate and was preserved, as required; it contains 62 enquiry links.

## K. Items outside the workspace

1. Publish the updated build on the Netlify site serving the canonical public domain. Publishing only on Replit does not necessarily update that website.
2. Re-run `pnpm --filter @workspace/brimas-media run check:seo:live` after publication. Also verify `/index.html` and representative service `.html` aliases redirect, with query parameters retained, and fingerprinted assets receive the configured cache header.
3. Complete Google Search Console verification and sitemap submission; inspect important URLs for indexing.
4. Compare the website's existing address, phone and hours against the genuine Google Business Profile and other listings.
5. Measure mobile performance using PageSpeed Insights/Search Console before deciding whether more invasive bundle or media work is justified.

No claim is made that these changes guarantee rankings.

## L. Verification performed

### Current live site, before workspace changes were published

- Read-only live audit passed 1,114 checks with zero SEO, transport or skipped-check failures.
- All 15 public pages returned crawlable HTML; 38 distinct image resources were fetched.
- Checked metadata, canonical URLs, headings, indexability, schema, links, robots, sitemap, contact destinations and genuine 404 responses.
- Explicitly checked `/404` and `/404.html`: HTTP 404. Sample trailing-slash URLs: HTTP 301 to extensionless canonical paths.
- Confirmed live `.html` aliases are still HTTP 200; this is the next-publication fix, not an already-live change.

### Updated workspace build

- Production build and TypeScript check passed.
- Existing built-page SEO audit passed: 15 pages, 640 internal links, 78 image references.
- New enhancement audit passed: 15 pages, Google verification, font discovery, service areas, matching breadcrumbs, 74 dimensioned image references and alias redirect inventory.
- XML parser confirmed sitemap validity and the 15 unique public canonical URLs.
- All 13 offline live-checker regression tests passed.
- Desktop homepage and mobile homepage/banner screenshots checked: branding/layout retained and no manifest rendering failure.
- One mobile browser pass at 390 × 844 checked all 15 routes: one visible H1/main, unique nonempty metadata, correct canonical, no page-wide horizontal overflow and no page JavaScript exceptions.
- Service → quote preselection and completed mobile form submission generated the exact expected WhatsApp destination and message. External navigation was intercepted; no message, email or call was sent.
- Existing price-list cards and all 62 WhatsApp enquiry hrefs were inspected without activating them.

### Public route coverage

All of these passed the live HTML audit and updated mobile DOM checks:

| Route |
| --- |
| `/` |
| `/price-list` |
| `/request-a-quote` |
| `/printing-services-kampala` |
| `/business-cards-printing-kampala` |
| `/flyers-brochures-printing-kampala` |
| `/banner-printing-kampala` |
| `/large-format-printing-industrial-area` |
| `/t-shirt-printing-embroidery-kampala` |
| `/uniform-embroidery-kampala` |
| `/promotional-items-mugs-pens-kampala` |
| `/ppe-supplier-kampala-uganda` |
| `/safety-helmets-overalls-kampala` |
| `/corporate-gifts-branding-kampala` |
| `/construction-company-branding-bundle` |