import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { runLive } from './check-live-seo.mjs';

const origin = 'https://www.print-garage.test'; // Offline fixture, never a published domain.
const serviceSource = await readFile(new URL('../src/seo/service-data.ts', import.meta.url), 'utf8');
const paths = ['/', '/price-list', '/request-a-quote', '/gallery',
  ...[...serviceSource.matchAll(/path: '(\/[^']+)'/g)].map(([, path]) => path)];
const source = `<urlset>${paths.map((path) => `<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>`;
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const errorHtml = '<meta name="robots" content="noindex, nofollow"><h1>Page not found</h1>';

// Self-contained fixtures derived from the real inventory; no build or network required.
function page(path) {
  const title = `Print Garage ${path}`;
  const description = `Description for ${path}`;
  const schema = [
    { '@type': 'Organization' },
    { '@type': 'LocalBusiness', email: 'printgarage101@gmail.com',
      contactPoint: [{ telephone: '+256780347272' }],
      address: { addressLocality: 'Kampala', addressCountry: 'UG', streetAddress: 'Peacock Building, 2nd Floor' } },
    { '@type': 'WebSite' }, { '@type': 'WebPage' },
  ];
  if (!['/', '/price-list', '/request-a-quote'].includes(path)) schema.push(
    { '@type': 'Service' },
    { '@type': 'BreadcrumbList', itemListElement: [{ position: 1, item: `${origin}${path}` }] },
    { '@type': 'FAQPage', mainEntity: [{ name: 'Question?', acceptedAnswer: { text: 'Answer.' } }] },
  );
  const metadata = {
    description, robots: 'index, follow',
    'og:title': title, 'twitter:title': title, 'og:description': description, 'twitter:description': description,
    'og:url': `${origin}${path}`, 'twitter:card': 'summary_large_image',
    'og:image': `${origin}/image.svg`, 'twitter:image': `${origin}/image.svg`,
  };
  const form = path === '/request-a-quote' ? `<form>
    <select id="request-service">${paths.filter((path) => !['/', '/price-list', '/request-a-quote'].includes(path))
      .map((path) => `<option value="${path.slice(1)}">Service</option>`).join('')}</select>
    <input id="request-quantity"><textarea id="request-details"></textarea>
    <input id="request-deadline"><input id="request-name">
    <button type="submit">Continue to WhatsApp</button></form><script src="/assets/quote.js"></script>` : '';
  return `<title>${escape(title)}</title>${Object.entries(metadata).map(([key, value]) =>
    `<meta name="${key}" content="${escape(value)}">`).join('')}
    <link rel="canonical" href="${origin}${path}">
    <script id="print-garage-structured-data" type="application/ld+json">${JSON.stringify(schema)}</script>
    <main><h1>Print Garage</h1><h2>Question?</h2><p>Answer.</p><p id="contact">Contact</p>
    <img src="/image.svg" alt="Print Garage">
    <a href="/request-a-quote?service=printing-services-kampala">Quote</a>
    <a href="https://wa.me/256780347272">Chat</a>
    <a href="https://wa.me/256780347272?text=Hello%20Print%20Garage">Message</a>
    <a href="tel:+256780347272">Call</a><a href="mailto:printgarage101@gmail.com">Email</a>
    <a href="/#contact">Contact section</a>${form}</main>`;
}

function fixture(mutate = () => {}) {
  const resources = new Map(paths.map((path) => [path, { body: page(path), type: 'text/html', status: 200 }]));
  resources.set('/sitemap.xml', { body: source, type: 'application/xml', status: 200 });
  resources.set('/robots.txt', { body: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml`, type: 'text/plain', status: 200 });
  resources.set('/admin/views', { body: '<meta name="robots" content="noindex, nofollow"><h1>Admin</h1>', type: 'text/html', status: 200 });
  resources.set('/404.html', { body: errorHtml, type: 'text/html', status: 200 });
  resources.set('/image.svg', { body: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', type: 'image/svg+xml', status: 200 });
  resources.set('/assets/quote.js', { body: 'https://wa.me/256780347272 Hello Print Garage, I would like a quote for one job. Please confirm the price and next steps for this specific request.', type: 'text/javascript', status: 200 });
  const options = { redirectStatus: 301, loseQuery: false, unknownStatus: 404 };
  mutate(resources, options);
  const requested = [];
  const fetchImpl = async (url, init) => {
    requested.push(url);
    assert.equal(init.method, 'GET');
    assert.equal(init.redirect, 'manual');
    assert(init.signal);
    const target = new URL(url);
    if (target.origin !== origin) {
      const location = options.loseQuery ? `${origin}${target.pathname}` : `${origin}${target.pathname}${target.search}`;
      return new Response('', { status: options.redirectStatus, headers: { location } });
    }
    const item = resources.get(target.pathname) ?? { body: errorHtml, type: 'text/html', status: options.unknownStatus };
    if (item.error) throw new TypeError(item.error);
    if (item.timeout) return new Promise((_, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Timed out', 'AbortError')), { once: true }));
    if (item.bodyError) return { status: 200, headers: new Headers({ 'content-type': item.type }), arrayBuffer: async () => { throw new Error('Body interrupted'); } };
    return new Response(item.body, { status: item.status, headers: { 'content-type': item.type, ...item.headers } });
  };
  return { fetchImpl, requested };
}

async function run(mutate, timeoutMs = 500) {
  const { fetchImpl, requested } = fixture(mutate);
  const lines = [];
  const result = await runLive({ fetchImpl, timeoutMs, sitemap: source, log: (line) => lines.push(line) });
  return { ...result, lines, requested };
}

test('baseline passes shared HTML inventory, images, contact links, redirects and genuine 404s using GET only', async () => {
  const result = await run();
  assert.equal(result.exitCode, 0);
  assert.equal(result.skipped, 0);
  assert(result.lines.some((line) => line.startsWith('SEO checks passed:')));
  assert.equal(new Set(result.requested).size, result.requested.length, 'Requests must be deduplicated');
  assert.equal(result.requested.filter((url) => url.includes('seo-check-nonexistent')).length, 2);
});

test('metadata regression is an SEO assertion, not a transport failure', async () => {
  const result = await run((resources) => {
    resources.get('/').body = resources.get('/').body.replace(`href="${origin}/"`, `href="${origin}/wrong"`);
  });
  assert.equal(result.exitCode, 1);
  assert.equal(result.transportFailures, 0);
  assert(result.issues.some((item) => item.message.includes('Canonical')));
});

test('network failure is transport-only, with incomplete HTML audit explicitly skipped', async () => {
  const result = await run((resources) => { resources.get('/').error = 'DNS lookup failed'; });
  assert.equal(result.exitCode, 2);
  assert.equal(result.seoFailures, 0);
  assert.equal(result.transportFailures, 1);
  assert(result.lines.some((line) => line.startsWith('[SKIPPED]')));
});

test('mixed failures have a distinct exit code', async () => {
  const result = await run((resources, options) => {
    resources.get('/').error = 'TLS failed';
    options.unknownStatus = 200;
  });
  assert.equal(result.exitCode, 3);
  assert(result.seoFailures && result.transportFailures);
});

test('timeout and interrupted body are classified as transport failures', async () => {
  for (const flag of ['timeout', 'bodyError']) {
    const result = await run((resources) => { resources.get('/image.svg')[flag] = true; }, 10);
    assert.equal(result.exitCode, 2);
    assert.equal(result.transportFailures, 1, 'Shared image failure should be reported only once');
  }
});

test('HTTP errors and image HTML fallbacks are SEO failures, not transport errors', async () => {
  for (const change of [{ status: 503 }, { type: 'text/html' }, { body: '' }]) {
    const result = await run((resources) => Object.assign(resources.get('/image.svg'), change));
    assert.equal(result.exitCode, 1);
    assert.equal(result.transportFailures, 0);
    assert(result.issues.some((item) => item.label.startsWith('Image ')));
  }
});

test('sitemap drift cannot hide downloaded page metadata regressions', async () => {
  const result = await run((resources) => {
    resources.get('/sitemap.xml').body = source.replace('/price-list', '/invented');
    resources.get('/').body = resources.get('/').body.replace('content="index, follow"', 'content="noindex, follow"');
  });
  assert.equal(result.exitCode, 1);
  assert(result.issues.some((item) => item.label === 'Sitemap inventory'));
  assert(result.issues.some((item) => item.label === 'Downloaded HTML inventory'));
});

test('robots blocking the site and indexable admin are detected', async () => {
  const result = await run((resources) => {
    resources.get('/robots.txt').body += '\nDisallow: /';
    resources.get('/admin/views').body = '<meta name="robots" content="index, follow"><h1>Admin</h1>';
  });
  assert.equal(result.exitCode, 1);
  assert(result.issues.some((item) => item.label === 'Robots directives'));
  assert(result.issues.some((item) => item.label === 'Noindex /admin/views'));
});

test('temporary redirects and dropped query parameters are detected', async () => {
  for (const change of [{ redirectStatus: 302 }, { loseQuery: true }]) {
    const result = await run((_, options) => Object.assign(options, change));
    assert.equal(result.exitCode, 1);
    assert(result.issues.some((item) => item.label.startsWith('Redirect ')));
  }
});

test('wrong WhatsApp recipient, unknown quote service and missing form wiring are detected', async () => {
  const result = await run((resources) => {
    resources.get('/').body = resources.get('/').body.replaceAll('256780347272', '256000000000').replace('service=printing-services-kampala', 'service=nonexistent');
    resources.get('/request-a-quote').body = resources.get('/request-a-quote').body.replace('id="request-quantity"', 'id="missing"');
    resources.get('/assets/quote.js').body = 'wrong quote code';
  });
  assert.equal(result.exitCode, 1);
  for (const message of ['Wrong WhatsApp recipient', 'Unknown quote service', 'Missing quote field', 'Shipped quote script missing']) {
    assert(result.issues.some((item) => item.message.includes(message)), message);
  }
});

test('schema facts and missing internal fragment targets are still checked by the shared inventory', async () => {
  for (const [before, after, expected] of [
    ['"addressCountry":"UG"', '"addressCountry":"US"', "'US'"],
    ['id="contact"', 'id="gone"', 'Missing anchor'],
  ]) {
    const result = await run((resources) => { resources.get('/').body = resources.get('/').body.replace(before, after); });
    assert.equal(result.exitCode, 1);
    assert(result.issues.some((item) => item.message.includes(expected)));
  }
});

test('unknown-page 404 HTML and X-Robots-Tag failures are detected; explicit error document may return 404', async () => {
  const result = await run((resources) => {
    resources.get('/404.html').status = 404;
    resources.get('/').headers = { 'x-robots-tag': 'noindex' };
  });
  assert.equal(result.exitCode, 1);
  assert(result.issues.some((item) => item.label === 'Indexability headers /'));
  assert(!result.issues.some((item) => item.label === 'Private/error HTML /404.html'));
});

test('bad CLI arguments are setup failures', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(new URL('./check-live-seo.mjs', import.meta.url)), '--timeout-ms', '0'], { encoding: 'utf8' });
  assert.equal(result.status, 4);
  assert(result.stderr.includes('[SETUP]'));
});