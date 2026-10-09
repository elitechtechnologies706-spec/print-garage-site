import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/lib/print-garage-catalogue.json', import.meta.url), 'utf8'));
const partners = JSON.parse(readFileSync(new URL('../src/lib/print-garage-partners.json', import.meta.url), 'utf8'));

test('independent Print Garage copy replaces the inherited homepage paragraphs', () => {
  const copy = JSON.parse(readFileSync(new URL('../src/lib/print-garage-copy.json', import.meta.url), 'utf8'));
  assert.match(copy.hero, /Print Garage/);
  for (const key of ['about', 'mission', 'vision', 'purpose']) {
    assert.equal(data[key], copy[key], `Generated ${key} must match authored brand copy`);
  }
  const combined = JSON.stringify(copy) + JSON.stringify(data);
  for (const inherited of [
    'A local branding, marketing and production partner',
    'there is no broker in the middle',
    'one stop center providing exceptional services',
    'unique, timely and professional branding services',
    'establish sustainable relationships with our clients',
    'Over the years, we have formed alliances',
  ]) assert.ok(!combined.includes(inherited), `Inherited wording remains: ${inherited}`);
  const generator = readFileSync(new URL('../../../scripts/build_print_garage_catalogue.py', import.meta.url), 'utf8');
  assert.ok(generator.includes('print-garage-copy.json'), 'Regeneration must retain the independent copy');
});

test('all service pages retain distinct descriptions and unchanged factual guide rates', () => {
  const source = readFileSync(new URL('../src/seo/service-data.ts', import.meta.url), 'utf8');
  const intros = [...source.matchAll(/intro: '([^']+)'/g)].map((match) => match[1]);
  const details = [...source.matchAll(/detail: '([^']+)'/g)].map((match) => match[1]);
  assert.equal(intros.length, 12);
  assert.equal(new Set(intros).size, 12);
  assert.equal(details.length, 12);
  assert.equal(new Set(details).size, 12);
  const rates = new Set([...source.matchAll(/UGX (\d{1,3}(?:,\d{3})*)/g)].map((match) => match[1]));
  assert.deepEqual(rates, new Set(['17,700', '29,500', '53,100', '8,850', '70,800', '88,500']));
});

test('site accents match the supplied orange and gray logo instead of the brighter master palette', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.ok(css.includes('--brand-orange: #F47226;'));
  assert.ok(css.includes('--brand-gray: #717274;'));
  assert.ok(!css.includes('#FF6B00'));
  const productsCss = readFileSync(new URL('../src/pages/products.css', import.meta.url), 'utf8');
  assert.ok(!productsCss.includes('#FF6B00'));
  const config = readFileSync(new URL('../src/lib/site-config.ts', import.meta.url), 'utf8');
  assert.ok(config.includes("primary: '#F47226'"));
  assert.ok(config.includes("secondary: '#717274'"));
});

test('service-delivery hero has explicit intrinsic dimensions and a durable image URL', () => {
  const hero = JSON.parse(readFileSync(new URL('../src/lib/print-garage-hero.json', import.meta.url), 'utf8'));
  assert.match(hero.image, /^\/api\/catalogue-assets\/hero-p\d{2}-\d{2}\.webp$/);
  assert.ok(hero.width > hero.height && hero.height > 0);
  assert.match(hero.alt, /Illustrative printing and branding workshop/);
  const source = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.ok(source.includes('src={hero.image} alt={hero.alt} width={hero.width} height={hero.height}'));
});

test('partner grid uses unique full-color source-profile cuts, excluding the site’s own logo', () => {
  assert.equal(partners.length, 93);
  assert.equal(new Set(partners.map((p) => p.name)).size, 93);
  assert.equal(new Set(partners.map((p) => p.logo)).size, 93);
  assert.equal(partners.filter((p) => p.name === 'Aga Khan Foundation').length, 1);
  assert.ok(!partners.some((p) => p.name === 'Print Garage'));
  assert.ok(partners.some((p) => p.name === 'KCB'));
  assert.ok(partners.some((p) => p.name === 'MTN'));
  for (const partner of partners) {
    assert.equal(partner.page, 4);
    assert.match(partner.sourcePdf, /^BRIMAS_PROFILE_PRINT_/);
    assert.match(partner.logo, /^\/api\/catalogue-assets\/partner-p04-\d{2}\.webp$/);
    assert.ok(partner.width > 0 && partner.height > 0);
  }
  const source = readFileSync(new URL('../src/lib/pg-catalogue.ts', import.meta.url), 'utf8');
  assert.ok(source.includes("import partners from './print-garage-partners.json'"));
});
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

test('desktop navigation uses direct links while mobile retains category dropdowns', () => {
  const source = readFileSync(new URL('../src/components/SiteMenu.tsx', import.meta.url), 'utf8');
  assert.ok(source.includes('navigationItem(section, false)'));
  assert.ok(source.includes('navigationItem(section, true)'));
  assert.ok(source.includes("if (!mobile || (id !== 'showcase' && id !== 'services'))"));
  const css = readFileSync(new URL('../src/components/SiteMenu.css', import.meta.url), 'utf8');
  const desktopMinimum = Number(css.match(/@media \(min-width: (\d+)px\)/)?.[1]);
  assert.ok(desktopMinimum > 390, 'Normal phone view must retain the mobile menu');
  assert.ok(desktopMinimum <= 980, 'Chrome phone desktop-site width must show direct links');
  assert.ok(css.includes('.site-menu { display: none; }'));
});
