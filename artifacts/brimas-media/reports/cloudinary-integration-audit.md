# Cloudinary integration audit and plan

## Authorized scope

The owner supplied cloud name `zjzxwgcq` and identified approximately 500 already-uploaded images in asset folder `brimas-media`. Use this existing library; do not reupload, provision Replit App Storage, add an upload UI/admin dashboard, move domains, or change Netlify hosting. Preserve the existing site design and workshop player.

## Existing implementation

- React/Vite, Wouter routing, build-time React prerendering for public pages.
- Public routes: `/`, `/price-list`, `/request-a-quote`, and the 12 service routes below. `/admin/views` is private/noindex; unknown paths use the noindex not-found view.
- Local catalogue assets are under `public/products`, derivatives under `public/products/responsive`, service crops under `public/service-crops`. Workshop frames remain under `public/behind-the-scenes`.
- `src/components/CatalogueImage.tsx` uses `src/lib/image-dimensions.ts` for intrinsic sizes and existing responsive variants. `src/lib/image-source.ts` supports credential-free external HTTPS URLs and an optional path-preserving CDN prefix.
- `public/media-config.js` currently keeps local delivery enabled. Its prefix mechanism alone is not a Cloudinary public-ID mapping.
- Homepage service cards and product examples use the shared image component. The homepage hero is a geometric brand graphic, not a product photo. Portrait product cards also use decorative image backgrounds.
- `src/lib/product-examples.ts` and `src/lib/gift-examples.ts` supply existing catalogue descriptions and photo/mockup context. `src/seo/service-data.ts` supplies service content and optional hero image records.
- Nine service pages currently have image records. General printing, business cards and flyers/brochures pages without an existing appropriate image slot must be assessed individually rather than populated indiscriminately.
- Quote and price-list pages use the brand logo, not product galleries. Do not add images merely to use up the library.
- `src/seo/seo-head.ts` centralizes metadata, canonical URLs, Open Graph and structured data. `scripts/prerender.mjs` emits crawlable HTML, sitemap, robots, aliases and noindex error/admin documents. Retain the canonical origin `https://www.brimasmedia.co`.
- Netlify configuration and API/quote functionality require no hosting changes for public Cloudinary delivery.

### Service route inventory

1. `/printing-services-kampala`
2. `/business-cards-printing-kampala`
3. `/flyers-brochures-printing-kampala`
4. `/banner-printing-kampala`
5. `/large-format-printing-industrial-area`
6. `/t-shirt-printing-embroidery-kampala`
7. `/uniform-embroidery-kampala`
8. `/promotional-items-mugs-pens-kampala`
9. `/ppe-supplier-kampala-uganda`
10. `/safety-helmets-overalls-kampala`
11. `/corporate-gifts-branding-kampala`
12. `/construction-company-branding-bundle`

## Focused implementation plan

1. Read existing Cloudinary asset metadata through an authorized connection or a credential-free asset export. Paginate the actual folder inventory; distinguish asset-folder metadata from public-ID prefixes.
2. Normalize an exportable catalog with stable asset IDs, public IDs/version, dimensions, provenance, candidate categories, existing page associations, role, alt text and review status. Reject duplicates, missing identifiers and unsafe URLs. Never infer photo/mockup provenance from a random filename.
3. Inspect available visual content and trustworthy metadata against the existing page topics. Mark uncertain/unseen assets `needs-review`; do not publish guessed subject descriptions or assume example logos imply client work.
4. Generate public Cloudinary delivery URLs centrally with `f_auto,q_auto`, context-appropriate responsive widths and immutable version information where available. Verify delivery and dimensions before registering variants.
5. Produce a dry-run report before applying confident mappings. Feed verified mappings through the shared image component and existing content records; preserve local fallback files, current local URLs, SSR/hydration behavior and the workshop player.
6. Verify the changed component and catalog with unit checks; build and run existing SEO/image checks across all public routes. Check desktop/mobile screenshots and broken-image fallback behavior proportionately. Do not claim measured LCP/CLS improvements without measurements.

## Discovery result / blocker

On 2026-10-03, the public tag-list URL
`https://res.cloudinary.com/zjzxwgcq/image/list/brimas-media.json`
returned HTTP 401 with `Resources of type list are restricted in this account`.
This endpoint is tag-based, not a folder inventory, even when enabled. Do not ask the owner to relax account security or claim the folder is empty.

Cloudinary integration discovery found an available, not-yet-connected Cloudinary integration. An authorized metadata connection or public-ID export is required to discover actual assets. No image has been visually inspected, mapped, downloaded as an original, uploaded, or replaced during this audit. No production application code, hosting settings, secrets or storage settings were changed.

The owner subsequently connected Cloudinary. Connection status reports `added`, but this session has no callable Cloudinary MCP tools or populated usage notes. This is a tool-availability blocker, not evidence of expired credentials or missing assets. Do not bypass the connection with an HTTP SDK or request secrets. Continue when tools are available, or import a credential-free asset metadata export (public IDs, asset IDs, dimensions, versions, folders, filenames/tags/context where available). An export does not require the owner to rename or categorize the images.

## Resolved by owner-supplied export

The owner supplied a CSV containing 50 existing public assets. Public IDs are used verbatim; the export does not imply a `brimas-media/` delivery prefix or prove that all approximately 500 account assets are included. The first approved batch has now been visually inspected, validated and imported using public delivery, without using the unavailable MCP tools or reuploading any images. See `cloudinary-import-summary.md` and `cloudinary-dry-run.json` for the completed batch, checks and exclusions.