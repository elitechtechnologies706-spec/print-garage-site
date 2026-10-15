import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../src/lib/print-garage-catalogue.json', import.meta.url), 'utf8'));
const partners = JSON.parse(readFileSync(new URL('../src/lib/print-garage-partners.json', import.meta.url), 'utf8'));

test('partners default to twelve logos with an accessible show-all toggle and three columns', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.ok(app.includes('useState(false)'));
  assert.ok(app.includes('partnersExpanded ? catalogue.partners : catalogue.partners.slice(0, 12)'));
  assert.ok(app.includes("partnersExpanded ? 'Show Less' : 'View All Partners'"));
  assert.ok(app.includes('aria-expanded={partnersExpanded}'));
  assert.ok(app.includes('aria-controls="partner-logo-grid"'));
  assert.ok(css.includes('.pg-logos { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr))'));
  assert.doesNotMatch(css, /\.pg-logos\s*\{[^}]*repeat\(6/);
  assert.ok(css.includes('.pg-partners-toggle { background: var(--brand-orange)'));
});

test('mobile navigation starts with Home and products use only the eight requested filters', () => {
  const menu = readFileSync(new URL('../src/components/SiteMenu.tsx', import.meta.url), 'utf8');
  const products = readFileSync(new URL('../src/pages/ProductsPage.tsx', import.meta.url), 'utf8');
  const catalogue = readFileSync(new URL('../src/lib/pg-catalogue.ts', import.meta.url), 'utf8');
  const sectionLabels = [...menu.matchAll(/\{ id: '[^']+', label: '([^']+)' \}/g)].map((match) => match[1]);
  assert.deepEqual(sectionLabels, ['Home', 'Our Products', 'Services', 'Gallery', 'About Us', 'Contact Us']);
  assert.ok(menu.includes("id === 'top' ? '/'"));
  assert.ok(menu.indexOf('{sections.map((section) => navigationItem(section, true))}') < menu.indexOf('>Full price list</a>'));
  assert.ok(products.includes('{productFilters.map((filter) =>'));
  assert.ok(!products.includes('.pp-subs'));
  const filterIds = [...catalogue.matchAll(/\{ id: '([^']+)', label:/g)].map((match) => match[1]);
  assert.deepEqual(filterIds, ['all', 'corporate-gifts', 'commercial-printing', 'large-format', 'promotional', 'ppe', 'textiles', 'digital-media']);
  assert.ok(catalogue.includes("digital-media', label: 'Digital & Media Services'"));
  assert.ok(products.includes('<ServiceOffers showHeading={false} />'));
  assert.ok(catalogue.includes("'promotional-products', 'drinkware', 'bags', 'eco', 'portfolio'"));
});

test('homepage and mobile service navigation show only the seven product categories', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  const menu = readFileSync(new URL('../src/components/SiteMenu.tsx', import.meta.url), 'utf8');
  const expected = ['corporate-gifts', 'commercial-printing', 'large-format', 'promotional', 'ppe', 'textiles', 'digital-media'];
  const filters = readFileSync(new URL('../src/lib/pg-catalogue.ts', import.meta.url), 'utf8');
  const filterIds = [...filters.matchAll(/\{ id: '([^']+)', label:/g)].map((match) => match[1]).filter((id) => id !== 'all');
  assert.deepEqual(filterIds, expected);
  assert.ok(app.includes("productFilters.filter((filter) => filter.id !== 'all')"));
  assert.ok(app.includes('<div className="pg-service-grid">'));
  assert.ok(app.includes('href={`/products/${id}`}'));
  assert.ok(!app.includes('SERVICE_NAMES'));
  assert.ok(!app.includes('<ServiceOffers'));
  assert.ok(menu.includes('productFilters.filter((category) => category.id !== \'all\')'));
  assert.ok(menu.includes('href={`/products/${category.id}`}'));
  assert.ok(!menu.includes('servicePages'));
  assert.ok(!menu.includes('More service details'));
  assert.ok(!menu.includes("['Printing',"));
  assert.ok(!menu.includes("['Packaging',"));
});

test('software offer shows the updated website price and excludes domain, hosting and SEO', () => {
  const offers = readFileSync(new URL('../src/lib/live-offers.ts', import.meta.url), 'utf8');
  const component = readFileSync(new URL('../src/components/LiveOffers.tsx', import.meta.url), 'utf8');
  assert.ok(offers.includes('Websites from as low as $100'));
  assert.ok(offers.includes('exclusiveNote: "Exclusive of Domain, Hosting & SEO"'));
  assert.ok(offers.includes('SaaS apps and custom software systems'));
  assert.ok(component.includes('{service.exclusiveNote && <p className="live-offer-note">({service.exclusiveNote})</p>}'));
});

test('the six supplied social profiles are linked from the site footers', () => {
  const config = readFileSync(new URL('../src/lib/site-config.ts', import.meta.url), 'utf8');
  const socialLinks = readFileSync(new URL('../src/components/SocialLinks.tsx', import.meta.url), 'utf8');
  for (const profile of [
    'https://x.com/print__garage',
    'https://www.instagram.com/print__garage',
    'https://www.linkedin.com/in/print-garage-6aa11b2a3/',
    'https://www.tiktok.com/@print.garage',
    'https://www.youtube.com/channel/UCvRVPJYwF1-_iohaurbYMOQ',
    'https://www.facebook.com/profile.php?id=61594641246359',
  ]) assert.ok(config.includes(profile), `Missing user-supplied social profile: ${profile}`);
  assert.ok(socialLinks.includes('aria-label={`Print Garage on ${label} (opens in a new tab)`}'));
  assert.ok(socialLinks.includes('target="_blank"'));
  assert.ok(socialLinks.includes('rel="noopener noreferrer"'));
  for (const page of ['../src/App.tsx', '../src/pages/ProductsPage.tsx', '../src/pages/PriceList.tsx', '../src/pages/GalleryPage.tsx', '../src/seo/LandingPage.tsx', '../src/pages/RequestQuote.tsx']) {
    assert.ok(readFileSync(new URL(page, import.meta.url), 'utf8').includes('<SocialLinks'), `Social links missing from ${page}`);
  }
});

test('paragraphs use natural word spacing rather than stretched justification', () => {
  const css = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8');
  assert.ok(css.includes('main p { text-align: start; text-align-last: auto; text-justify: none; word-spacing: normal; }'));
  assert.doesNotMatch(css, /text-align:\s*justify/);
});

test('every product type has a compact sales caption instead of a visible PDF source label', () => {
  const descriptions = JSON.parse(readFileSync(new URL('../src/lib/product-descriptions.json', import.meta.url), 'utf8'));
  for (const product of data.products) {
    const text = descriptions[product.subcategory];
    assert.equal(typeof text, 'string', `Missing caption for ${product.subcategory}`);
    assert.ok(text.length > 15 && text.length <= 110, `Caption must stay compact: ${product.subcategory}`);
    assert.ok(product.sourcePdf && product.page, 'Source provenance remains in the catalogue');
  }
  const page = readFileSync(new URL('../src/pages/ProductsPage.tsx', import.meta.url), 'utf8');
  assert.ok(page.includes('productDescription(p)'));
  assert.ok(!page.includes('Source:') && !page.includes('p.sourcePdf') && !page.includes('pp-src'));
});

test('homepage copy stays consistent and preserves the independent Print Garage hero', () => {
  const copy = JSON.parse(readFileSync(new URL('../src/lib/print-garage-copy.json', import.meta.url), 'utf8'));
  assert.match(copy.hero, /Print Garage/);
  for (const key of ['about', 'mission', 'vision', 'purpose']) {
    assert.equal(data[key], copy[key], `Generated ${key} must match authored brand copy`);
  }
  const combined = JSON.stringify(copy) + JSON.stringify(data);
  for (const inherited of [
    'A local branding, marketing and production partner',
    'there is no broker in the middle',
    'establish sustainable relationships with our clients',
    'Over the years, we have formed alliances',
  ]) assert.ok(!combined.includes(inherited), `Inherited wording remains: ${inherited}`);
  const generator = readFileSync(new URL('../../../scripts/build_print_garage_catalogue.py', import.meta.url), 'utf8');
  assert.ok(generator.includes('print-garage-copy.json'), 'Regeneration must retain the independent copy');
});

test('the approved catalogue screenshot supplies the company overview, vision and mission', () => {
  const copy = JSON.parse(readFileSync(new URL('../src/lib/print-garage-copy.json', import.meta.url), 'utf8'));
  assert.equal(copy.vision, 'To be a one stop center providing exceptional services.');
  assert.equal(copy.mission, 'To provide unique, timely and professional branding services for better customer experience.');
  assert.equal(copy.about.split(/\n\s*\n/).length, 2);
  for (const detail of ['commercial printing', 'PPE supplies', 'office supplies', 'promotional items', 'discounts', 'enrolled clients', 'service packages', 'brand visibility']) {
    assert.ok(copy.about.includes(detail), `Screenshot detail missing: ${detail}`);
  }
  assert.equal(copy.purpose, 'Help organisations look consistent wherever people meet them: at their premises, on their team and in the items they share.');
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
