import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Keep development-only instrumentation out of crawlable HTML.
process.env.NODE_ENV = 'production';

const out = resolve('dist/public');
const shell = await readFile(resolve(out, 'index.html'), 'utf8');
const server = await createServer({
  configFile: resolve('vite.config.ts'),
  server: { middlewareMode: true },
  appType: 'custom',
  mode: 'production',
});

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

function replaceContent(html, selector, value) {
  const safe = escapeHtml(value);
  const pattern = new RegExp(`(<meta (?:name|property)="${selector}" content=")[^"]*(")`);
  return html.replace(pattern, (_, before, after) => `${before}${safe}${after}`);
}

try {
  const { Root } = await server.ssrLoadModule('/src/routes.tsx');
  const { GalleryPage } = await server.ssrLoadModule('/src/pages/GalleryPage.tsx');
  const { servicePages, SITE_URL } = await server.ssrLoadModule('/src/seo/service-data.ts');
  const {
    structuredData, OG_IMAGE, HOME_TITLE, HOME_META,
    PRICE_LIST_TITLE, PRICE_LIST_META, QUOTE_TITLE, QUOTE_META,
    GALLERY_TITLE, GALLERY_META,
  } = await server.ssrLoadModule('/src/seo/seo-head.ts');
  const pages = [
    { path: '/', title: HOME_TITLE, meta: HOME_META },
    { path: '/price-list', title: PRICE_LIST_TITLE, meta: PRICE_LIST_META },
    { path: '/request-a-quote', title: QUOTE_TITLE, meta: QUOTE_META },
    { path: '/gallery', title: GALLERY_TITLE, meta: GALLERY_META },
    ...servicePages.map((service) => ({ ...service, service })),
    { path: '/admin/views', title: 'Visit history | Print Garage Admin', meta: 'Private Print Garage administration.', indexable: false },
    { path: '/404', title: 'Page not found | Print Garage', meta: 'This page could not be found. Explore Print Garage printing and branding services in Kampala.', indexable: false },
  ];
  for (const page of pages) {
    const markup = renderToString(createElement(Root, { ssrPath: page.path, ssrGalleryPage: GalleryPage }));
    const url = `${SITE_URL}${page.path}`;
    let html = shell
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
      .replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
    html = replaceContent(html, 'robots', !SITE_URL || page.indexable === false ? 'noindex, nofollow' : 'index, follow');
    html = replaceContent(html, 'description', page.meta);
    html = replaceContent(html, 'og:title', page.title);
    html = replaceContent(html, 'og:description', page.meta);
    if (SITE_URL) html = html.replace('</head>', `    <meta property="og:url" content="${escapeHtml(url)}" />\n    <link rel="canonical" href="${escapeHtml(url)}" />\n  </head>`);
    html = replaceContent(html, 'og:image', OG_IMAGE);
    html = replaceContent(html, 'twitter:title', page.title);
    html = replaceContent(html, 'twitter:description', page.meta);
    html = replaceContent(html, 'twitter:image', OG_IMAGE);
    html = html
      .replace(
        /<script id="print-garage-structured-data" type="application\/ld\+json">[\s\S]*?<\/script>/,
        `<script id="print-garage-structured-data" type="application/ld+json">${JSON.stringify(structuredData(page.service, page)).replaceAll('<', '\\u003c')}</script>`,
      );
    if (page.path === '/') {
      await writeFile(resolve(out, 'index.html'), html);
      continue;
    }
    const slug = page.path.slice(1);
    const directory = resolve(out, slug);
    await mkdir(directory, { recursive: true });
    await writeFile(resolve(directory, 'index.html'), html);
    await writeFile(resolve(out, `${slug}.html`), html);
  }
  const publicPages = pages.filter((page) => page.indexable !== false);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${(SITE_URL ? publicPages : []).map((page) => `  <url><loc>${escapeHtml(`${SITE_URL}${page.path}`)}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(resolve(out, 'sitemap.xml'), sitemap);
  await writeFile(resolve(out, 'robots.txt'), SITE_URL ? `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${SITE_URL}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n');
  // Redirect only known public HTML aliases; never redirect 404/admin documents.
  // Netlify handles trailing slashes already. Preserve the public canonical paths.
  const aliases = publicPages.map(({ path }) =>
    `${path === '/' ? '/index' : path}.html ${path} 301!`,
  ).join('\n');
  await writeFile(resolve(out, '_redirects'), `${aliases}\n`);
  console.log(`Prerendered ${publicPages.length} public pages, private admin and 404. ${SITE_URL ? 'Public SEO origin configured.' : 'Preview is noindex; set VITE_SITE_URL to the generated deployment URL when publishing.'}`);
} finally {
  await server.close();
}