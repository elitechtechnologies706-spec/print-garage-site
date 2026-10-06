import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

// Extra checks of built HTML; no browser, network, or additional packages.
const out = resolve('dist/public');
const activeImages = JSON.parse(await readFile(resolve('src/lib/image-library/active-images.json'), 'utf8'));
const verifiedRemoteUrls = new Set(Object.values(activeImages)
  .flatMap((asset) => [asset.url, ...asset.variants.map((variant) => variant.url)]));
const catalogue = JSON.parse(await readFile(resolve('src/lib/image-library/catalog.json'), 'utf8'));
const galleryRemoteUrls = new Set(catalogue.assets
  .flatMap((asset) => [asset.delivery.url, ...asset.variants.map((variant) => variant.url)]));
const read = (file) => readFile(resolve(out, file), 'utf8');
const decode = (text) => text.replaceAll('&amp;', '&').replaceAll('&#x27;', "'")
  .replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const text = (html) => decode(html.replace(/<[^>]*>/g, '')).trim();
const attr = (tag, key) => tag.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1] ?? '';
const paths = [...(await read('sitemap.xml')).matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map(([, url]) => new URL(url).pathname);
if (!paths.length) {
  console.log('Public SEO enhancements are checked after VITE_SITE_URL is configured; preview SEO is checked separately.');
  process.exit(0);
}
const redirects = (await read('_redirects')).trim().split('\n');
assert.equal(redirects.length, paths.length, 'Canonical alias redirect inventory');
let dimensions = 0;
for (const path of paths) {
  const html = await read(path === '/' ? 'index.html' : `${path.slice(1)}.html`);
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? '';
  const verification = [...head.matchAll(/<meta\b[^>]*>/g)]
    .map(([tag]) => tag).filter((tag) => attr(tag, 'name') === 'google-site-verification');
  assert.equal(verification.length, 0, `Inherited Google ownership verification: ${path}`);
  assert([...head.matchAll(/<link\b[^>]*>/g)].some(([tag]) =>
    attr(tag, 'rel') === 'stylesheet' && attr(tag, 'href').startsWith('https://fonts.googleapis.com/')
      && decode(attr(tag, 'href')).includes('display=swap')), `Early swap-font stylesheet: ${path}`);
  const schema = JSON.parse(html.match(/<script id="print-garage-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  for (const item of schema.filter((item) =>
    [].concat(item['@type']).includes('LocalBusiness') || item['@type'] === 'Service')) {
    assert.deepEqual(item.areaServed, [
      { '@type': 'City', name: 'Kampala' }, { '@type': 'Country', name: 'Uganda' },
    ], `Business-confirmed service area: ${path}`);
    if ([].concat(item['@type']).includes('LocalBusiness')) {
      assert(item.address.streetAddress.includes('2nd Floor'), `Supplied floor missing from schema: ${path}`);
      assert(html.includes('2nd Floor'), `Supplied floor missing from visible content: ${path}`);
    }
  }
  const crumbs = schema.find((item) => item['@type'] === 'BreadcrumbList');
  if (crumbs) {
    const nav = html.match(/<nav\b[^>]*aria-label="Breadcrumb"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert(nav, `Visible breadcrumb missing: ${path}`);
    const names = [...nav.matchAll(/<(a|span)\b[^>]*>([\s\S]*?)<\/\1>/g)]
      .map(([, , label]) => text(label)).filter((label) => label !== '/');
    assert.deepEqual(names, crumbs.itemListElement.map((item) => item.name), `Visible/schema breadcrumb mismatch: ${path}`);
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    // Preserve the approved workshop player; its fixed-aspect frames already reserve space.
    if (attr(tag, 'src').startsWith('/behind-the-scenes/')) continue;
    assert(Number(attr(tag, 'width')) > 0 && Number(attr(tag, 'height')) > 0, `Image dimensions: ${path} ${attr(tag, 'src')}`);
    const primary = attr(tag, 'src');
    const allowedRemoteUrls = path === '/gallery' ? galleryRemoteUrls : verifiedRemoteUrls;
    if (primary.startsWith('https://')) {
      assert(allowedRemoteUrls.has(primary), `Unverified remote primary image: ${path}`);
    }
    for (const candidate of attr(tag, 'srcSet').split(/,\s+/).filter(Boolean)) {
      const [source, descriptor] = candidate.trim().split(/\s+/);
      assert(/^\d+w$/.test(descriptor), `Responsive image width descriptor: ${path}`);
      if (source.startsWith('https://')) {
        assert(allowedRemoteUrls.has(source), `Unverified responsive remote image: ${path}`);
      } else {
        await access(resolve(out, source.slice(1)));
      }
    }
    dimensions++;
  }
  assert(!html.includes('cost in Kampala in 2026?'), `Outdated generated FAQ date: ${path}`);
  assert(redirects.includes(`${path === '/' ? '/index' : path}.html ${path} 301!`), `Public HTML alias: ${path}`);
  if (crumbs) {
    const detail = html.match(/<p\b[^>]*data-testid="text-seo-detail"[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? '';
    const links = [...detail.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(([, href]) => href);
    assert(links.length >= 2 && links.every((href) => paths.includes(href) && href !== path),
      `Useful related-service links missing from content: ${path}`);
  }
}
await access(resolve(out, 'media-config.js'));
assert(!redirects.some((line) => /^\/(?:404|admin)(?:[./ ]|$)/.test(line)), 'Redirects must not override private/error statuses');
console.log(`SEO enhancements passed: ${paths.length} pages, verification, font discovery, service areas, matching breadcrumbs, ${dimensions} dimensioned images and canonical HTML aliases.`);