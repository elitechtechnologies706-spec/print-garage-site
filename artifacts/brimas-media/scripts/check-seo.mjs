import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

// Check the actual pre-rendered output, without a browser or new dependencies.
const out = resolve('dist/public');
const read = (path) => readFile(resolve(out, path), 'utf8');
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '');
const meta = (html, key) => attr(
  [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => tag)
    .find((tag) => attr(tag, 'name') === key || attr(tag, 'property') === key) ?? '', 'content',
);
const sitemap = await read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
if (!urls.length) {
  // An unset public origin is a working, non-indexable preview, not a fake domain.
  const aliases = (await read('_redirects')).trim().split('\n').map((line) => line.split(' ')[1]);
  for (const path of [...aliases, '/404', '/admin/views']) {
    const html = await read(path === '/' ? 'index.html' : `${path.slice(1)}.html`);
    assert.equal(meta(html, 'robots'), 'noindex, nofollow', `Preview robots: ${path}`);
    assert(!html.includes('rel="canonical"'), `Unconfigured canonical: ${path}`);
    assert(!html.includes('property="og:url"'), `Unconfigured social URL: ${path}`);
    assert(!/Brimas Media|brimasmedia\\.|256700584499|256414581806/i.test(html), `Inherited branding: ${path}`);
    assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `H1 count: ${path}`);
    assert.deepEqual(JSON.parse(html.match(/<script id="print-garage-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? 'null'), []);
  }
  assert((await read('robots.txt')).includes('Disallow: /'));
  console.log(`SEO preview checks passed: ${aliases.length} public pages, no fake canonical origin, noindex previews and clean branding.`);
  process.exit(0);
}
const origin = new URL(urls[0]).origin;
assert.equal(urls.length, new Set(urls).size, 'Duplicate sitemap URLs');
const paths = new Set(urls.map((url) => {
  assert.equal(new URL(url).origin, origin, `Wrong sitemap host: ${url}`);
  return new URL(url).pathname;
}));
assert(![...paths].some((path) => path.startsWith('/admin') || path === '/404'));
const documents = new Map(await Promise.all([...paths].map(async (path) => [
  path, await read(path === '/' ? 'index.html' : `${path.slice(1)}.html`),
])));
const titles = new Set();
const descriptions = new Set();
let links = 0;
let images = 0;
for (const [path, html] of documents) {
  const title = decode(html.match(/<title>([^<]+)<\/title>/)?.[1] ?? '');
  const description = meta(html, 'description');
  assert(title && !titles.has(title), `Missing/duplicate title: ${path}`);
  assert(description && !descriptions.has(description), `Missing/duplicate description: ${path}`);
  titles.add(title);
  descriptions.add(description);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `H1 count: ${path}`);
  assert(html.includes('<main'), `Missing semantic main content: ${path}`);
  let hasH2 = false;
  for (const [, level] of html.matchAll(/<h([23])\b/g)) {
    if (level === '2') hasH2 = true;
    if (level === '3') assert(hasH2, `H3 without preceding H2: ${path}`);
  }
  const canonical = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => tag).find((tag) => attr(tag, 'rel') === 'canonical');
  assert.equal(attr(canonical ?? '', 'href'), `${origin}${path}`, `Canonical: ${path}`);
  assert.equal(meta(html, 'robots'), 'index, follow');
  for (const key of ['og:title', 'twitter:title']) assert.equal(meta(html, key), title);
  for (const key of ['og:description', 'twitter:description']) assert.equal(meta(html, key), description);
  assert.equal(meta(html, 'og:url'), `${origin}${path}`);
  assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
  for (const key of ['og:image', 'twitter:image']) {
    const image = new URL(meta(html, key));
    assert.equal(image.origin, origin);
    await access(resolve(out, image.pathname.slice(1)));
  }
  const schema = JSON.parse(html.match(/<script id="print-garage-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? 'null');
  assert(Array.isArray(schema), `Invalid JSON-LD: ${path}`);
  const types = schema.flatMap((item) => item['@type']);
  for (const type of ['Organization', 'LocalBusiness', 'WebSite', 'WebPage']) {
    assert(types.includes(type), `Missing ${type}: ${path}`);
  }
  const business = schema.find((item) => [].concat(item['@type']).includes('LocalBusiness'));
  assert.equal(business.email, 'printgarage101@gmail.com');
  assert.deepEqual(business.contactPoint.map((item) => item.telephone), ['+256780347272']);
  assert.equal(business.address.addressLocality, 'Kampala');
  assert.equal(business.address.addressCountry, 'UG');
  assert(business.address.streetAddress.includes('Peacock Building'));
  if (!['/', '/price-list', '/request-a-quote', '/gallery'].includes(path)) {
    for (const type of ['BreadcrumbList', 'FAQPage']) assert(types.includes(type), `${type}: ${path}`);
    assert(types.includes('Service') || types.includes('Product'), `Missing genuine offering schema: ${path}`);
    const crumbs = schema.find((item) => item['@type'] === 'BreadcrumbList').itemListElement;
    assert.equal(crumbs.at(-1).item, `${origin}${path}`);
    assert.deepEqual(crumbs.map((item) => item.position), crumbs.map((_, index) => index + 1));
    const text = decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    const faq = schema.find((item) => item['@type'] === 'FAQPage');
    for (const item of faq.mainEntity) {
      assert(text.includes(item.name), `Schema FAQ question not visible: ${path}`);
      assert(text.includes(item.acceptedAnswer.text), `Schema FAQ answer not visible: ${path}`);
    }
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const [tag] = match;
    assert(/\balt="/.test(tag), `Missing image alt: ${path}`);
    // Empty alt is correct for redundant thumbnails inside labelled buttons.
    const buttonStart = html.lastIndexOf('<button', match.index);
    const buttonEnd = html.indexOf('</button>', match.index);
    const inButton = buttonStart > html.lastIndexOf('</button>', match.index) && buttonEnd !== -1;
    const buttonText = inButton ? html.slice(buttonStart, buttonEnd).replace(/<[^>]*>/g, '').trim() : '';
    assert(attr(tag, 'alt').trim() || buttonText, `Empty important image alt: ${path}`);
    const source = new URL(attr(tag, 'src'), `${origin}${path}`);
    if (source.origin === origin) await access(resolve(out, source.pathname.slice(1)));
    images++;
  }
  for (const [tag] of html.matchAll(/<a\b[^>]*>/g)) {
    const href = attr(tag, 'href');
    if (!href || /^(mailto:|tel:)/.test(href)) continue;
    const target = new URL(href, `${origin}${path}`);
    if (target.origin !== origin) continue;
    assert(paths.has(target.pathname), `Broken internal link ${href} on ${path}`);
    if (target.hash) {
      assert(documents.get(target.pathname).includes(`id="${decodeURIComponent(target.hash.slice(1))}"`),
        `Missing anchor ${href} on ${path}`);
    }
    links++;
  }
}
for (const file of ['404.html', 'admin/views.html']) {
  const html = await read(file);
  assert.equal(meta(html, 'robots'), 'noindex, nofollow', `${file} is indexable`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
}
const robots = await read('robots.txt');
assert(robots.includes('Allow: /') && robots.includes('Disallow: /admin/') && robots.includes('Disallow: /api/'));
assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
console.log(`SEO checks passed: ${paths.size} crawlable pages, unique metadata, H1s, schema, ${links} internal links, ${images} image references, sitemap, robots and noindex 404/admin.`);