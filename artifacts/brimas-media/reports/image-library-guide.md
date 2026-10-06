# Brimas Media image library

## Current organization — keep existing paths

The library already uses small WebP assets and stable public URLs:

- `public/products/`: product, workwear, gifts, signage and vehicle-branding examples.
- `public/products/responsive/`: a bounded set of smaller derivatives of existing photos.
- `public/service-crops/`: existing service-card images.
- `public/behind-the-scenes/`: the approved workshop player. Leave its source, captions and behavior unchanged.
- `src/lib/image-dimensions.ts`: intrinsic dimensions and only those responsive variants that actually exist.
- `src/components/CatalogueImage.tsx`: shared dimensions, responsive source selection and optional media-host delivery.

Do not duplicate this into a parallel `/images` library or move existing URLs merely to rename folders.

## Adding verified images efficiently

1. Obtain genuine, approved files and record permission/provenance. Mark photos versus mockups accurately; example logos are not client endorsements.
2. Keep full-resolution originals in an asset archive or, for a large library, CDN-backed object storage rather than committing hundreds of originals to Git.
3. Upload in one batch using a folder manifest or the chosen storage provider's bulk tooling, not repeated AI prompts.
4. Under a future externally hosted library, use logical categories such as `images/printing`, `images/workwear`, `images/ppe`, `images/corporate-gifts`, `images/promotional-products`, `images/signage`, `images/vehicle-branding` and `images/portfolio`. Create only categories with real approved content.
5. Each manifest entry should have a stable ID, public URL, intrinsic width/height, category, truthful photo/mockup classification, useful description and real responsive-variant URLs. Never register missing derivatives or private/signed credential URLs.
6. Reference approved entries from the existing service/catalogue data; supply context-specific alt text and captions. Do not render hundreds of images automatically.
7. Register local dimensions and any real variants in the existing registry. For an external URL, the image component also accepts explicit width/height; use HTTPS.

## Optional CDN delivery without changing the application bundle

The owner selected the existing Cloudinary library. Individually verified bindings are preferred in prerendered HTML and after hydration; unmapped assets remain local. Failed remote images restore their retained local fallback, including failures before hydration. See `cloudinary-batch-workflow.md` for batch import, review, fallback and opt-out details. The separate prefix mechanism below remains available but is not enabled.

`public/media-config.js` exposes a public, credential-free `BRIMAS_IMAGE_CDN_BASE` prefix. If a CDN is selected later, mirror the existing product/crop paths under that prefix and update the configuration file in the complete existing deploy output. Do not deploy a directory containing only this file, since a replacement deployment must retain the rest of the site:

```js
window.BRIMAS_IMAGE_CDN_BASE = 'https://media.example.com/brimas';
window.dispatchEvent(new Event('brimas:media-config'));
```

This makes `/products/photo.webp` resolve to `https://media.example.com/brimas/products/photo.webp`, including registered responsive variants and the catalogue's decorative background. The React server snapshot initially retains local URLs for safe hydration, then applies the public runtime setting. No application-code rewrite or recompilation is needed to change that prefix.

Important limits:

- Initial prerendered HTML still references the retained local assets. Do not delete them just because client-side CDN switching works. For CDN-first/no-JavaScript delivery or eventual removal of local originals, coordinate matching host-level media rewrites or regenerate the HTML URLs.
- This prefix setting does not add an upload interface, activate a storage account, migrate files or create missing portfolio photos. The Cloudinary workflow also imports metadata only, without reuploading originals.
- Keep logos, social previews and the workshop player on their existing paths unless separately approved.
- Never put tokens, passwords, signed private URLs or other credentials in this public file.
- Use only public HTTPS URLs. Test all mirrored variants, caching, cold requests and hydration before enabling the setting on the live site.

## Responsive optimization performed

The four largest catalogue WebPs received 480px and 800px derivatives, with existing originals retained:

| Asset | Original bytes | 480px bytes | 800px bytes |
| --- | ---: | ---: | ---: |
| Tassel keyrings | 266,294 | 64,290 | 160,878 |
| Laptop sleeve | 123,430 | 12,798 | 52,062 |
| Travel gift set | 113,156 | 41,322 | 91,438 |
| Promotional pens | 107,756 | 30,700 | 66,452 |

These are resized versions of the actual supplied images, not generated or replacement imagery. Browser selection depends on viewport size and device pixel ratio; these file-size reductions are not a measured Core Web Vitals result.

For a much larger future library, prefer a provider supporting batch uploads, cached responsive transformations, stable public URLs and exportable metadata. Compare storage, transformation and delivery costs before committing to a service. No paid service or extra runtime image package was introduced.