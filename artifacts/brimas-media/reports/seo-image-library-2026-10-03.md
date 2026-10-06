# Brimas Media — technical SEO and image-library report

**Date:** 3 October 2026  
**Preferred canonical origin:** https://www.brimasmedia.co  
**Status:** Targeted changes built in the workspace. No Git push, publication, domain migration, storage signup or credential change was performed.

## Audit and current architecture

The existing React/Vite application already prerenders all 15 important public routes to useful HTML and then hydrates them in the browser. It is not dependent on a crawler executing an empty SPA shell. Existing routing, metadata, JSON-LD, sitemap, robots, quote functionality, Netlify configuration and image handling were inspected; the previous SEO foundations were retained instead of duplicated.

Most supplied brief requirements were already satisfied. This pass focused on image-library scalability, contextual links and the owner's explicitly supplied **2nd Floor** address detail.

## Changes and findings

| Area | Result |
| --- | --- |
| Routes | No public route added, renamed, removed or redirected differently in this pass. All 15 important routes remain. |
| SEO content | Existing useful service descriptions, ordering guidance, FAQs, titles, descriptions, H1s and commercial CTAs retained. No padded or keyword-variation pages. |
| Canonicals | Built and current live audits pass with HTTPS `www.brimasmedia.co` URLs. No development/preview or `.net` origin used in production metadata. |
| Sitemap | Valid XML: 15 unique canonical public URLs, matching source/build inventories. No admin, error, redirect aliases or invented pages. Current live sitemap passes. |
| Robots | Existing public crawling and asset access retained; sitemap declaration is `https://www.brimasmedia.co/sitemap.xml`. Existing `/admin/` and `/api/` restrictions preserved. |
| Structured data | Existing Organization/LocalBusiness, WebSite, WebPage, Service, FAQPage and BreadcrumbList retained and validated. Postal address now includes the supplied floor detail, matching visible complete addresses. No invented ratings, reviews or facts. |
| Local relevance | Address panels, footers and directions-enquiry wording consistently include 2nd Floor. Plot 56 and other existing details preserved. Map searches still identify the building, not an invented branch. |
| Internal linking | Added relevant inline links within the existing service explanations using printing, branding/gifts and PPE/construction groups. Built inventory now checks **678 internal links**, versus 640 previously. No new footer keyword blocks. |
| Social metadata | Existing page-specific Open Graph and Twitter/X cards, production URLs and genuine existing imagery retained. |
| Images | Stable original URLs and actual images retained. Shared `CatalogueImage` component applies intrinsic dimensions, real responsive variants, existing alt text and existing loading priorities. Existing product/crop directories reused. |
| Image scalability | Public runtime CDN-prefix configuration is prepared but **disabled by default**. It supports mirrored product/crop paths, responsive variants and the catalogue's decorative background without changing the application bundle. No provider or paid service added. |
| Performance | Eight real derivatives of the four largest catalogue WebPs added. Their 480px versions are approximately **64–90% smaller** than their originals. Existing lazy loading, high-priority service heroes, font discovery and fingerprinted-asset caching retained. |
| Hydration reliability | Browser testing exposed an existing homepage mismatch when cached exchange-rate state differed from prerendered HTML. Initial state is now deterministic; the existing cache restores after hydration. Fresh and returning-visitor checks both pass, preserving live rates, transparent fallback and USD estimates. |
| Quote/contact | Existing form, service preselection, quantity/specification/deadline/contact fields and WhatsApp/call links preserved. No unsupported upload feature or fabricated submission endpoint added. |
| Security/configuration | Limited credential-pattern check found no matches in 129 tracked app/config files. No secrets or environment values were changed/exposed. CDN configuration rejects insecure/credential-bearing prefixes. This is not a complete security audit. |
| New pages | **None.** Vehicle/signage examples alone are insufficient justification for more landing pages; existing print, workwear, gifts and promotional pages already cover substantial related intent. Distinct services need owner confirmation and genuinely useful original content before expansion. |

### Image delivery limits and human work

See the separate **image-library-guide.md** for the actual paths, variant sizes and future batch-manifest workflow.

- There is no reason to move or rename this small existing library simply for SEO.
- For a large future library, archive full-resolution originals outside Git and use batch-uploadable, CDN-backed storage with stable public URLs and responsive transformations. Compare costs before selecting a provider.
- Owners must supply approved, real product/portfolio photos and confirm provenance and photo/mockup status. Existing examples and third-party logos are not proof of customer relationships.
- Initial prerendered HTML continues to reference the retained local files. A future client-side CDN switch does **not** permit deleting those files. CDN-first/no-JavaScript delivery or eventual removal of local originals requires matching host-level media rules or regenerated HTML URLs.
- Actual originals, bulk storage/import tooling and future service-specific photography were not invented or automatically uploaded.

## Files changed in this pass

All paths below are relative to `artifacts/brimas-media/`:

- `index.html`: public runtime media configuration script and supplied floor in fallback business schema.
- `src/App.tsx`: shared catalogue image rendering, matching decorative media source and supplied floor in address copy.
- `src/hooks/use-exchange-rate.ts`: restore cached rates after hydration, not during the first render; avoid a build-time date becoming stale in static HTML.
- `src/components/CatalogueImage.tsx` **new**: dimensions, responsive images and hydration-safe runtime media setting.
- `src/lib/image-source.ts` **new**: public HTTPS source/CDN-prefix resolution and validation.
- `src/lib/image-dimensions.ts`: actual responsive variant registry; existing measured dimensions preserved.
- `public/media-config.js` **new**: optional public CDN setting; currently empty/local.
- `public/products/responsive/` **new**: 480px/800px WebPs for tassel-keyrings, laptop-sleeve, travel-gift-set and promotional-pens — eight resized versions of existing images.
- `src/seo/service-data.ts`: related-service groups using real existing routes.
- `src/seo/LandingPage.tsx`: contextual inline links, shared catalogue image and consistent floor copy.
- `src/seo/Location.tsx`: complete address/footer and directions-enquiry floor detail.
- `src/seo/seo-head.ts`: supplied floor in business address schema.
- `src/pages/PriceList.tsx`: supplied floor in the existing footer; card layout and prices unchanged.
- `scripts/check-seo-enhancements.mjs`: validate floor consistency, contextual links, responsive candidates and media-config presence.
- `tests/image-source.test.mjs` **new**, `package.json`: four image-source tests; no dependency changes.
- `reports/image-library-guide.md` **new** and this report.

Project memory records provenance of the user-supplied floor and the restriction on old-domain migration; it contains no credentials.

## Verification completed

- TypeScript check and production build pass; all 15 public pages prerender successfully.
- Built SEO checks pass: **15 pages, 678 internal links, 78 image references**, unique metadata, headings, canonical URLs, schema, sitemap, robots and noindex error/admin pages.
- Enhanced checks pass: verification tag, fonts, service areas, breadcrumbs, **74 dimensioned image references** outside the unchanged workshop player, responsive candidate files, contextual links, floor address and canonical HTML alias inventory.
- XML parser confirms all 15 unique canonical sitemap URLs.
- Four image-source tests and all 13 offline live-checker regression tests pass.
- Fresh read-only **current live-site audit passes 1,114 checks** across all 15 public pages and 38 distinct images, with zero SEO/transport failures or skipped checks. Contact destinations and real 404 responses pass.
- Mobile browser pass at 390 × 844 checks all 15 routes using actual built HTML and hashed JS/CSS: unique metadata/canonicals, one H1/main, loaded relevant images, floor consistency, contextual links and no page-wide overflow.
- All four optimized catalogue images select and load their local 480w variants at that viewport.
- An isolated simulated CDN serves the actual local image bytes: source URLs, responsive candidates, selected image sources and portrait background use the configured prefix; 32 mocked image requests resolve, with no missing mappings or hydration errors. The real configuration remains disabled.
- Business-card service CTA preselects the correct quote service. Completed form produces the expected WhatsApp destination and quantity/specification/deadline/name fields; navigation was intercepted and aborted, and **no message was sent**. All 62 existing price-list card enquiry links were inspected.
- Initial homepage test revealed React hydration error #418 with cached rate state. After the targeted fix, the latest built homepage passes both cold-cache and explicitly seeded warm-cache tests with zero recoverable/page/console errors. Cached UGX 4,000/USD restores after hydration without an exchange API request; a UGX 295,000 estimate displays $73.75 when switched to USD.
- Mobile corporate-gifts screenshot confirms retained layout, visible floor detail and working rendering.
- Existing nonfatal UI sourcemap-location build warnings remain. No package upgrade or broad UI refactor was made merely to remove them.

The live audit validates the **currently published site**, not publication of this workspace's new image/floor/link/hydration changes. The final bundle is approximately 154.69 kB gzip JavaScript and 25.02 kB gzip CSS. No Google indexing, ranking or field Core Web Vitals result was established; aggressive CSS/feature removal or route restructuring was not justified without performance evidence.

## Actions outside the workspace

### Netlify

1. Publish the complete updated build on the Netlify site serving the canonical `www` domain; retain Replit setup. Do not publish only the new media-config file.
2. Re-run `pnpm --filter @workspace/brimas-media run check:seo:live` after publication.
3. Verify the floor copy, new inline links, `/media-config.js`, all eight responsive image URLs, direct service access, 404 behavior and HTTPS/www handling.
4. Confirm the previously prepared public `.html` alias redirects retain query parameters and fingerprinted `/assets/*` receive the configured immutable cache header. This pass did not change those rules.
5. Leave `brimasmedia.net` hosting/DNS/redirects alone unless ownership is confirmed and a migration is intentionally requested.

### Google Search Console

- Confirm ownership verification, submit/check the canonical sitemap, inspect homepage and important service URLs, and review indexing/exclusion reports.
- Review field Core Web Vitals and use measured mobile PageSpeed results to decide whether further bundle/media changes are warranted.
- This audit has no authenticated Search Console access and makes no indexing/ranking claim.

### Google Business Profile

- With owner access, compare the genuine listing's website, address including floor, existing phone numbers and hours with the website.
- Add genuine owner-approved business/workshop images; verify service categories. Do not create duplicate locations, fake reviews or unsupported service claims.

## Intentionally unchanged

Brand, cyan/white/black visual identity, components/layout, workshop player, navigation, form behavior, all existing routes, approved VAT-inclusive prices, quote-only services, business contacts and existing operational wording remain. No fabricated imagery/reviews/claims, automatic new landing pages, extra dependencies, paid image platform, domain migration, secret changes or Google account operations.

**Recommended order:** publish on the correct host, verify the live changes, complete owner-access Google checks, then expand the real image library only when approved photos and a storage choice are available.