# Existing Cloudinary batch workflow

This is a metadata importer for already-uploaded assets, not an uploader. It uses public Cloudinary delivery only, needs no API secret or environment variables, and cannot change the storage account, domain or Netlify hosting.

## Where the data lives

- `src/lib/image-library/catalog.json`: full exportable catalog with stable Cloudinary asset IDs, public IDs, original public URLs, dimensions, verified delivery variants, categories, photo/mockup/unknown provenance, candidate page associations, role, descriptive alt text and review reasons.
- `src/lib/image-library/active-images.json`: small generated browser configuration containing only verified replacements. The full inventory is **not** included in the application bundle.
- `scripts/image-library/reviewed-assets.json`: visual review decisions, keyed by public ID. Local bindings identify existing image slots, not new pages.
- `scripts/image-library/cloudinary-assets.csv`: complete 254-asset import source, reconstructed from the authorized `brimas-media` inventory because the original attachment contains only 50 rows. Unrelated account samples are excluded. Folder metadata does not change the public IDs.
- `src/lib/catalogue-delivery.ts`: central presentation selection; `CatalogueImage.tsx` consumes it.
- `.media-import/`: ignored dry-run candidates/reports and optional review previews. Full-resolution originals remain in Cloudinary. Do not copy originals into `public/` or Git.

## Import one export

The CLI uses Python 3 and Pillow (already available in this workspace); this is an offline maintenance tool, not a website/build dependency. No frontend, API or Cloudinary SDK dependency was added.

From the workspace root:

```sh
python artifacts/brimas-media/scripts/image-library/import_catalog.py /path/to/export.csv \
  --report-dir artifacts/brimas-media/.media-import/my-batch
```

The default is **dry-run**. It checks every asset's public delivery and original dimensions, requests real responsive variants with `c_limit,w_WIDTH/f_auto/q_auto`, decodes the returned images to verify sizes, and checks stable-ID/public-ID/URL duplicates, exact rendered-pixel duplicates, declared page paths and local fallback files. URLs containing credentials, queries/fragments or the wrong cloud are rejected. Unknown or unsupported assets remain `needs-review`.

The tool uses four concurrent requests by default (`--workers 1` through `8`). Delivery/transformation requests may use the existing Cloudinary account's usage allowance; it does not activate a service or upload any files.

To inspect another mixed batch without renaming or sorting it:

```sh
python artifacts/brimas-media/scripts/image-library/make_review_sheets.py \
  artifacts/brimas-media/.media-import/my-batch/candidate-catalog.json \
  --output artifacts/brimas-media/.media-import/my-batch/previews
```

An agent can inspect these numbered sheets and update visual review records. Filenames/tags are supporting evidence, not proof of image contents. Never infer PPE compliance, client endorsements, specific branding methods or photo/mockup provenance from a date-stamped filename. Visually ambiguous assets must remain excluded. If review records change, run a new dry-run so the candidate reflects those changes.

After reading the report and confirming no errors:

```sh
python artifacts/brimas-media/scripts/image-library/import_catalog.py --apply-validated \
  --report-dir artifacts/brimas-media/.media-import/my-batch
```

This applies an unchanged, verified candidate within 24 hours without repeating the network probes. `--apply` with a CSV is also available for a single verify-and-apply run. An error prevents either operation from replacing the active catalog.

Imports merge by stable asset ID, keep earlier batches, and refuse conflicting public IDs or local bindings. New verified candidates do not automatically add hundreds of images to the website: only explicit reviewed `localBindings` activate existing slots.

## Delivery and safe opt-out

`public/media-config.js` enables Cloudinary for individually verified bindings with:

```js
window.BRIMAS_CLOUDINARY_ENABLED = true;
```

Setting this to `false` restores the existing local catalogue once the public configuration is read by the browser. Prerendered images remain Cloudinary-first; this flag is not a server-side opt-out. Do not replace the deployed site with only a configuration file.

- Prerendered HTML and the initial hydration snapshot use verified Cloudinary bindings with accurate alt text, actual dimensions and responsive source sets. The shared component also detects remote failures that happened before React attached its error handler.
- On Cloudinary image failure, the component clears the external source set and restores the existing local source, original alt text, dimensions and local variants. It does not loop between external providers.
- Existing local assets and responsive files are retained. Unmapped imagery, brand logo, Open Graph image, workshop player and its captions are untouched.
- Current lazy/eager loading and explicit `sizes` remain intact. Small source images are not upscaled; display variants are capped at intrinsic width or 1200px. Unknown assets never receive a live binding.
- Cloudinary-first prerendering avoids the previous unconditional local-to-remote hero switch. Below-fold examples retain lazy loading. Local fallbacks require JavaScript to recover from remote failure; without JavaScript, normal public Cloudinary delivery still works but automatic failure recovery is unavailable. No measured LCP/CLS or Core Web Vitals improvement is claimed.

## Checks

```sh
pnpm --filter @workspace/brimas-media run test:images
pnpm --filter @workspace/brimas-media run test:image-import
pnpm --filter @workspace/brimas-media run typecheck
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/brimas-media run build
pnpm --filter @workspace/brimas-media run check:seo
```

Exact-pixel duplicate detection is deliberately conservative; visually similar images with different crops, resolutions or compression can remain distinct. Do not claim a complete account inventory from a CSV subset or a comprehensive near-duplicate audit.