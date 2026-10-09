import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/lib/print-garage-catalogue.json', import.meta.url), 'utf8'));
const sourcePages = {
  'MIN catalogue Garage.pdf': 8,
  'DRINK WARE.pdf': 29,
  'Eco-friendly collection.pdf': 17,
  'Bag collection(1).PDF': 19,
  'KCB ITEMSs.pdf': 4,
};

test('homepage has precisely twelve source-backed teasers, two per requested group', () => {
  const teasers = data.products.filter((p) => p.teaser);
  assert.equal(teasers.length, 12);
  for (const category of ['drinkware', 'bags', 'eco', 'corporate-gifts', 'promotional-products', 'portfolio']) {
    assert.equal(teasers.filter((p) => p.category === category).length, 2, category);
  }
});

test('six source-backed services link to product category pages', () => {
  assert.deepEqual(data.services.map((s) => s.name), [
    'Large Format', 'Commercial Printing', 'Corporate Branding',
    'Promotional Gifts', 'Textile/Garment', 'Eco Printing',
  ]);
  for (const service of data.services) {
    assert.equal(service.href, `/products/${service.id}`);
    assert.ok(data.products.some((p) => p.image === service.image));
  }
});

test('all catalogue entries have unique IDs, real source pages and image dimensions', () => {
  assert.equal(new Set(data.products.map((p) => p.id)).size, data.products.length);
  assert.deepEqual(new Set(data.products.map((p) => p.sourcePdf)), new Set(Object.keys(sourcePages)));
  for (const p of data.products) {
    assert.ok(p.page >= 1 && p.page <= sourcePages[p.sourcePdf], p.id);
    assert.ok(p.width > 0 && p.height > 0, p.id);
    assert.match(p.image, /^\/api\/catalogue-assets\/(min|drinkware|eco|bags|portfolio)-p\d{2}-\d{2}\.webp$/);
  }
});

test('all six PPE groups are populated from the MIN catalogue', () => {
  for (const group of ['head', 'ear', 'eye', 'body', 'hand', 'foot']) {
    assert.ok(data.products.some((p) => p.category === 'ppe' && p.subcategory === group), group);
  }
});

test('homepage keeps requested section order and does not include a full product gallery', () => {
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const ids = ['top', 'proof', 'services', 'mvp', 'showcase', 'partners'];
  let position = -1;
  for (const id of ids) {
    const next = source.indexOf(`id="${id}"`);
    assert.ok(next > position, `Missing or out-of-order ${id}`);
    position = next;
  }
  assert.ok(source.indexOf('<footer') > position);
  assert.ok(source.includes('const teasers = homeTeasers(catalogue.products)'));
  assert.ok(source.includes('href="/products"'));
});

test('mobile navigation trigger has explicit accessible state and a controlled panel', () => {
  const source = readFileSync(new URL('../src/components/SiteMenu.tsx', import.meta.url), 'utf8');
  assert.ok(source.includes('summary role="button" tabIndex={0} aria-label={mobileMenuOpen'));
  assert.ok(source.includes('aria-expanded={mobileMenuOpen} aria-controls={menuPanelId}'));
  assert.ok(source.includes('onToggle={(event) => setMobileMenuOpen(event.currentTarget.open)}'));
  assert.ok(source.includes('nav id={menuPanelId}'));
});
