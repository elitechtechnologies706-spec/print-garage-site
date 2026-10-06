import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const checker = fileURLToPath(new URL('./check-seo.mjs', import.meta.url));
const decode = (text) => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const attr = (tag, name) => decode(tag.match(new RegExp(`\\b${name}=["']([^"']*)["']`, 'i'))?.[1] ?? '');
const meta = (html, key) => attr([...html.matchAll(/<meta\b[^>]*>/gi)]
  .map(([tag]) => tag).find((tag) => attr(tag, 'name') === key || attr(tag, 'property') === key) ?? '', 'content');
const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => decode(url));
const redirects = new Set([301, 308]);

// Read-only GETs only. Inject fetch/logger for deterministic, offline regression tests.
export async function runLive({ fetchImpl = fetch, timeoutMs = 15000, log = console.log, sitemap: sourceSitemap } = {}) {
  const source = sourceSitemap ?? await readFile(resolve(root, 'dist/public/sitemap.xml'), 'utf8');
  const urls = locs(source);
  assert(urls.length && urls.length === new Set(urls).size, 'Invalid source sitemap inventory');
  const origin = new URL(urls[0]).origin;
  const paths = new Set(urls.map((url) => {
    assert.equal(new URL(url).origin, origin, 'Source sitemap has inconsistent hosts');
    assert(!new URL(url).search && !new URL(url).hash, 'Source sitemap must contain clean URLs');
    return new URL(url).pathname;
  }));
  const apex = origin.replace('://www.', '://');
  const issues = [];
  const cache = new Map();
  let skipped = 0;
  let checks = 0;
  const issue = (kind, label, message) => {
    issues.push({ kind, label, message });
    log(`[${kind}] ${label}: ${message}`);
  };
  const check = (label, fn) => {
    checks++;
    try { fn(); } catch (error) { issue('SEO', label, error.message); }
  };
  const get = (url) => {
    if (!cache.has(url)) cache.set(url, (async () => {
      // Timeout includes reading the body, not just receiving headers.
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(url, {
          method: 'GET', redirect: 'manual', signal: controller.signal,
          headers: { 'User-Agent': 'Print-Garage-ReadOnly-SEO-Check/1.0', Accept: '*/*' },
        });
        const body = Buffer.from(await response.arrayBuffer());
        return { status: response.status, headers: response.headers, body, text: body.toString('utf8') };
      } catch (error) {
        issue('TRANSPORT', url, `${error.name}: ${error.message}${error.cause?.code ? ` (${error.cause.code})` : ''}`);
        return null;
      } finally { clearTimeout(timer); }
    })());
    return cache.get(url);
  };
  const expectResponse = (label, response, status, type) => {
    if (!response) { skipped++; return false; }
    check(label, () => {
      assert.equal(response.status, status, `Expected HTTP ${status}, got ${response.status}`);
      assert(type.test(response.headers.get('content-type') ?? ''), `Unexpected Content-Type: ${response.headers.get('content-type')}`);
      assert(response.body.length, 'Empty response body');
    });
    return response.status === status && type.test(response.headers.get('content-type') ?? '') && response.body.length > 0;
  };
  // A small worker pool avoids hammering the live host.
  const each = async (items, fn) => {
    const queue = [...items];
    await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
      while (queue.length) await fn(queue.shift());
    }));
  };
  const documents = new Map();
  log(`Read-only live SEO check: ${origin} (${paths.size} source-sitemap pages). No publishing or form submissions.`);
  await each(paths, async (path) => {
    const response = await get(`${origin}${path}`);
    if (expectResponse(`Public HTML ${path}`, response, 200, /^text\/html\b/i)) {
      documents.set(path, response.text);
      check(`Indexability headers ${path}`, () => {
        assert(!/\b(noindex|none)\b/i.test(response.headers.get('x-robots-tag') ?? ''), 'Public page has a noindex X-Robots-Tag');
      });
    }
  });
  const sitemap = await get(`${origin}/sitemap.xml`);
  if (expectResponse('Sitemap response', sitemap, 200, /^(application|text)\/xml\b/i)) {
    check('Sitemap inventory', () => assert.equal(sitemap.text.trim(), source.trim(), 'Live sitemap differs from source inventory'));
  }
  const robots = await get(`${origin}/robots.txt`);
  if (expectResponse('Robots response', robots, 200, /^text\/plain\b/i)) {
    check('Robots directives', () => {
      for (const directive of ['User-agent: *', 'Allow: /', 'Disallow: /admin/', 'Disallow: /api/', `Sitemap: ${origin}/sitemap.xml`]) {
        assert(robots.text.includes(directive), `Missing ${directive}`);
      }
      assert(!/^Disallow:\s*\/\s*$/mi.test(robots.text), 'Robots blocks the entire site');
    });
  }
  const privateHtml = new Map();
  for (const [path, file] of [['/admin/views', 'admin/views.html'], ['/404.html', '404.html']]) {
    const response = await get(`${origin}${path}`);
    // Explicit error documents currently return 200; accepting 404 also supports the separate hosting fix.
    const expected = path === '/404.html' && response?.status === 404 ? 404 : 200;
    if (expectResponse(`Private/error HTML ${path}`, response, expected, /^text\/html\b/i)) {
      privateHtml.set(file, response.text);
      check(`Noindex ${path}`, () => {
        assert.equal(meta(response.text, 'robots'), 'noindex, nofollow');
        assert.equal((response.text.match(/<h1\b/gi) ?? []).length, 1);
      });
    }
  }
  const imageUrls = new Set();
  const scriptUrls = new Set();
  let quoteLinks = 0;
  let whatsappLinks = 0;
  let callLinks = 0;
  for (const [path, html] of documents) {
    for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
      check(`Image URL ${path}`, () => imageUrls.add(new URL(attr(tag, 'src'), `${origin}${path}`).href));
    }
    for (const key of ['og:image', 'twitter:image']) {
      check(`${key} URL ${path}`, () => imageUrls.add(new URL(meta(html, key)).href));
    }
    let quotes = 0;
    let whatsapp = 0;
    let calls = 0;
    for (const [tag] of html.matchAll(/<a\b[^>]*>/gi)) {
      const href = attr(tag, 'href');
      check(`Contact/quote destination ${path}: ${href}`, () => {
        if (href.startsWith('tel:')) {
          calls++; callLinks++;
          assert.equal(href, 'tel:+256780347272', 'Wrong telephone destination');
          return;
        }
        if (href.startsWith('mailto:')) {
          assert.equal(href.split('?')[0], 'mailto:printgarage101@gmail.com', 'Wrong email destination');
          return;
        }
        if (!href) return;
        const target = new URL(href, `${origin}${path}`);
        if (/^(www\.)?(wa\.me|api\.whatsapp\.com|whatsapp\.com)$/i.test(target.hostname)) {
          whatsapp++; whatsappLinks++;
          assert.equal(target.origin, 'https://wa.me', 'Unexpected WhatsApp host/scheme');
          assert.equal(target.pathname, '/256780347272', 'Wrong WhatsApp recipient');
          // Plain chat links are intentional; validate a message when supplied.
          if (target.searchParams.has('text')) assert(target.searchParams.get('text').trim(), 'Empty WhatsApp message');
          assert(!/%(?![a-f\d]{2})/i.test(target.search), 'Invalid WhatsApp query encoding');
        }
        if (target.pathname === '/request-a-quote') {
          quotes++; quoteLinks++;
          assert.equal(target.origin, origin, 'Quote link leaves canonical host');
          const service = target.searchParams.get('service');
          if (service !== null) assert(paths.has(`/${service}`) && !['', 'request-a-quote', 'price-list'].includes(service), 'Unknown quote service');
        }
      });
    }
    if (path !== '/request-a-quote') check(`Contact/quote anchors ${path}`, () => {
      assert(quotes > 0 && whatsapp > 0 && calls > 0, 'Missing quote, WhatsApp or call anchors');
    });
    check(`Honest schema ${path}`, () => {
      const json = html.match(/<script id="print-garage-structured-data" type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
      const schema = JSON.parse(json ?? 'null');
      const visible = decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
      const walk = (value) => {
        if (!value || typeof value !== 'object') return;
        assert(!('aggregateRating' in value) && !('review' in value), 'Unverified ratings/reviews in schema');
        if ([].concat(value['@type'] ?? []).includes('Offer')) {
          assert.equal(value.priceCurrency, 'UGX', 'Offer is not in UGX');
          assert(value.price !== undefined && visible.includes(Number(value.price).toLocaleString('en-US')), 'Offer price not visible');
          assert(/guide/i.test(visible), 'Offer missing guide-price context');
        }
        for (const child of Object.values(value)) walk(child);
      };
      walk(schema);
    });
  }
  const quoteHtml = documents.get('/request-a-quote');
  if (quoteHtml) {
    check('Quote form HTML', () => {
      assert(/<form\b/i.test(quoteHtml), 'Missing quote form');
      for (const id of ['request-service', 'request-quantity', 'request-details', 'request-deadline', 'request-name']) {
        assert(quoteHtml.includes(`id="${id}"`), `Missing quote field ${id}`);
      }
      assert(/<button\b[^>]*type="submit"[^>]*>[\s\S]*?Continue to WhatsApp[\s\S]*?<\/button>/.test(quoteHtml), 'Missing WhatsApp submit control');
      const options = [...quoteHtml.matchAll(/<option\b[^>]*>/gi)].map(([tag]) => attr(tag, 'value'));
      for (const path of paths) if (!['/', '/price-list', '/request-a-quote'].includes(path)) {
        assert(options.includes(path.slice(1)), `Quote selector missing ${path}`);
      }
    });
    for (const [tag] of quoteHtml.matchAll(/<script\b[^>]*>/gi)) {
      if (attr(tag, 'src')) check('Quote script URL', () => {
        const url = new URL(attr(tag, 'src'), origin);
        assert.equal(url.origin, origin, 'Quote script is not on the canonical host');
        scriptUrls.add(url.href);
      });
    }
    check('Quote JavaScript entry', () => assert(scriptUrls.size, 'No shipped quote script'));
  } else skipped++;
  const scriptTexts = [];
  await each(scriptUrls, async (url) => {
    const response = await get(url);
    if (expectResponse(`Quote script ${url}`, response, 200, /^(text|application)\/(javascript|x-javascript)\b/i)) scriptTexts.push(response.text);
  });
  if (scriptTexts.length === scriptUrls.size && scriptUrls.size) check('Shipped quote-to-WhatsApp wiring', () => {
    const javascript = scriptTexts.join('\n');
    for (const text of ['https://wa.me/256780347272', 'Hello Print Garage, I would like a quote for one job.', 'Please confirm the price and next steps for this specific request.']) {
      assert(javascript.includes(text), `Shipped quote script missing ${text}`);
    }
  });
  const images = new Map();
  await each(imageUrls, async (url) => {
    const response = await get(url);
    if (expectResponse(`Image ${url}`, response, 200, /^image\//i)) images.set(url, response.body);
  });
  for (const entry of [origin.replace('https:', 'http:'), apex.replace('https:', 'http:'), apex]) {
    for (const path of ['/', '/banner-printing-kampala?seo_verify=1']) {
      let current = `${entry}${path}`;
      const finalUrl = `${origin}${path}`;
      const visited = new Set();
      for (let hop = 0; hop <= 5; hop++) {
        if (visited.has(current)) { check(`Redirect ${entry}${path}`, () => assert.fail('Redirect loop')); break; }
        visited.add(current);
        const response = await get(current);
        if (!response) { skipped++; break; }
        if (current === finalUrl) {
          expectResponse(`Redirect final ${current}`, response, 200, /^text\/html\b/i);
          break;
        }
        let next;
        check(`Redirect ${current}`, () => {
          assert(redirects.has(response.status), `Expected permanent 301/308 redirect, got ${response.status}`);
          assert(response.headers.get('location'), 'Missing Location');
          next = new URL(response.headers.get('location'), current);
          assert([origin, apex].includes(next.origin), 'Redirect does not upgrade to an expected HTTPS host');
          assert.equal(`${next.pathname}${next.search}`, path, 'Redirect loses path/query');
          assert(!next.hash, 'Unexpected redirect fragment');
          assert(hop < 5, 'Too many redirect hops');
        });
        if (!next || ![origin, apex].includes(next.origin) || !redirects.has(response.status) || hop === 5) break;
        current = next.href;
      }
    }
  }
  const nonce = randomUUID();
  for (const path of [`/seo-check-nonexistent-${nonce}`, `/printing-services-kampala/seo-check-nonexistent-${nonce}`]) {
    const response = await get(`${origin}${path}`);
    if (expectResponse(`Unknown path ${path}`, response, 404, /^text\/html\b/i)) check(`Custom missing-page HTML ${path}`, () => {
      assert.equal(meta(response.text, 'robots'), 'noindex, nofollow');
      assert.equal((response.text.match(/<h1\b/gi) ?? []).length, 1);
      assert(/Page not found/i.test(response.text), 'Missing custom error content');
      assert.notEqual(response.text, documents.get('/'), 'Missing route serves homepage HTML');
    });
  }
  // Mirror only verified GET responses in a disposable directory and run the
  // unchanged local inventory checker. Never write into the build or source tree.
  const mirror = await mkdtemp(resolve(tmpdir(), 'print-garage-live-seo-'));
  try {
    const put = async (file, body) => {
      const destination = resolve(mirror, file);
      assert(destination.startsWith(`${mirror}/`), 'Unsafe mirror path');
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, body);
    };
    await put('public/sitemap.xml', source);
    // Sitemap drift is already checked independently; retain the source inventory
    // here so a broken live sitemap cannot hide page-level metadata regressions.
    await put('dist/public/sitemap.xml', source);
    for (const [path, html] of documents) await put(`dist/public/${path === '/' ? 'index.html' : `${path.slice(1)}.html`}`, html);
    for (const [file, html] of privateHtml) await put(`dist/public/${file}`, html);
    for (const [url, body] of images) if (new URL(url).origin === origin) await put(`dist/public${new URL(url).pathname}`, body);
    if (robots?.status === 200) await put('dist/public/robots.txt', robots.text);
    const complete = documents.size === paths.size && privateHtml.size === 2 && images.size === imageUrls.size && robots?.status === 200;
    if (complete) {
      const result = spawnSync(process.execPath, [checker], { cwd: mirror, encoding: 'utf8' });
      if (result.error || result.signal) throw result.error ?? new Error(`Local checker terminated by ${result.signal}`);
      checks++;
      if (result.status !== 0) issue('SEO', 'Downloaded HTML inventory', result.stderr.trim() || `Checker exited ${result.status}`);
      else log(result.stdout.trim());
    } else {
      skipped++;
      log('[SKIPPED] Shared HTML inventory: incomplete responses; see SEO/TRANSPORT failures above. This is not a pass.');
    }
  } finally { await rm(mirror, { recursive: true, force: true }); }
  const seoFailures = issues.filter((item) => item.kind === 'SEO').length;
  const transportFailures = issues.filter((item) => item.kind === 'TRANSPORT').length;
  const exitCode = (seoFailures ? 1 : 0) | (transportFailures ? 2 : 0);
  log(`Live SEO ${exitCode ? 'FAILED' : 'PASSED'}: ${checks} checks, ${documents.size}/${paths.size} public HTML pages, ${images.size}/${imageUrls.size} images; ${quoteLinks} quote, ${whatsappLinks} WhatsApp, ${callLinks} call links.`);
  log(`SEO assertion failures: ${seoFailures}; transport failures: ${transportFailures}; skipped checks: ${skipped}. Exit code: ${exitCode} (0 pass, 1 SEO, 2 transport, 3 both; 4 setup/tool failure).`);
  return { exitCode, seoFailures, transportFailures, skipped, issues };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--help') {
    console.log('Usage: pnpm --filter @workspace/brimas-media run check:seo:live [--timeout-ms 15000]\nRead-only production GET checks using the generated dist/public/sitemap.xml. Build with VITE_SITE_URL first. No publishing, login or form submission.\nExit codes: 0 pass, 1 SEO assertions, 2 transport failures, 3 both, 4 setup/tool failure.');
  } else {
    try {
      assert(args.length === 0 || (args.length === 2 && args[0] === '--timeout-ms'), 'Unknown arguments; use --help');
      const timeoutMs = args.length ? Number(args[1]) : 15000;
      assert(Number.isInteger(timeoutMs) && timeoutMs > 0 && timeoutMs <= 120000, 'Timeout must be 1–120000 ms');
      process.exitCode = (await runLive({ timeoutMs })).exitCode;
    } catch (error) {
      console.error(`[SETUP] ${error.message}`);
      process.exitCode = 4;
    }
  }
}