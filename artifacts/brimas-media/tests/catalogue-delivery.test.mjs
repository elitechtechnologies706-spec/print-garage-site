import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { catalogueDelivery } from '../src/lib/catalogue-delivery.ts';
import active from '../src/lib/image-library/active-images.json' with { type: 'json' };
import catalog from '../src/lib/image-library/catalog.json' with { type: 'json' };

test('explicit opt-out retains the real local URLs', () => {
  const image = catalogueDelivery('/products/promotional-pens.webp', '', false);
  assert.equal(image.src, '/products/promotional-pens.webp');
  assert.equal(image.alt, undefined);
  assert.match(image.srcSet, /\/products\/responsive\/promotional-pens-480.webp 480w/);
});

test('only verified bindings switch to optimized, versioned Cloudinary delivery', () => {
  for (const [fallback, asset] of Object.entries(active)) {
    const image = catalogueDelivery(fallback, '', true);
    assert.equal(image.src, asset.url);
    assert.equal(image.alt, asset.alt);
    assert(image.width > 0 && image.height > 0);
    assert.equal(image.cloudinaryId, asset.id);
    assert.match(image.src, /^https:\/\/res\.cloudinary\.com\/zjzxwgcq\/image\/upload\/c_limit,w_\d+\/f_auto\/q_auto\/v\d+\//);
    const entry = catalog.assets.find((entry) => entry.id === asset.id);
    assert.equal(entry.status, 'mapped');
    assert.notEqual(entry.provenance, 'unknown');
    assert(entry.localBindings.includes(fallback));
    const widths = image.srcSet.split(', ').map((source) => Number(source.match(/ (\d+)w$/)[1]));
    assert.deepEqual(widths, [...new Set(widths)].sort((a, b) => a - b));
    for (const variant of asset.variants) {
      assert(entry.variants.some((checked) => checked.url === variant.url && checked.width === variant.width));
    }
  }
});

test('failed Cloudinary delivery restores local src, dimensions, alt and responsive files', async () => {
  for (const fallback of Object.keys(active)) {
    const image = catalogueDelivery(fallback, 'https://cdn.example.com/library', true, true);
    assert.equal(image.src, fallback);
    assert.equal(image.cloudinaryId, undefined);
    assert.equal(image.alt, undefined);
    assert(image.width > 0 && image.height > 0);
    for (const candidate of image.srcSet?.split(', ') ?? [image.src]) {
      const path = candidate.split(' ')[0];
      assert(path.startsWith('/products/'));
      await access(fileURLToPath(new URL(`../public${path}`, import.meta.url)));
    }
  }
});

test('unmapped images, workshop and branding never switch to Cloudinary', () => {
  for (const src of ['/behind-the-scenes/cutting-fabric.webp', '/print-garage-favicon.svg']) {
    assert.equal(catalogueDelivery(src, '', true).src, src);
  }
});

test('explicit external images do not require a local registry entry', () => {
  const image = catalogueDelivery('https://example.com/image.jpg', '', false);
  assert.equal(image.src, 'https://example.com/image.jpg');
  assert.equal(image.width, undefined);
  assert.equal(image.srcSet, undefined);
});

test('catalog inventory has stable unique IDs and truthful review exclusions', () => {
  assert.equal(new Set(catalog.assets.map((asset) => asset.id)).size, catalog.assets.length);
  assert.equal(new Set(catalog.assets.map((asset) => asset.publicId)).size, catalog.assets.length);
  for (const asset of catalog.assets.filter((asset) => asset.status === 'needs-review')) {
    assert.deepEqual(asset.localBindings, []);
    assert(asset.reviewReason);
  }
});