import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const rootPackage = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
const apiPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const netlifyConfig = readFileSync(new URL('../../../netlify.toml', import.meta.url), 'utf8');

test('Netlify external logger modules are installed from the repository root', () => {
  for (const dependency of ['pino', 'pino-http']) {
    assert.ok(rootPackage.dependencies[dependency], `${dependency} must be a root dependency for Netlify`);
    assert.ok(apiPackage.dependencies[dependency], `${dependency} must remain an API server dependency`);
    assert.ok(netlifyConfig.includes(`"${dependency}"`), `${dependency} must remain external in Netlify config`);
  }
});

test('Netlify prerenders crawlable pages on the canonical host and validates SEO output', () => {
  assert.ok(netlifyConfig.includes('VITE_SITE_URL=https://www.printgarage.online'));
  assert.ok(netlifyConfig.includes('run check:seo'));
});

test('Netlify proxies catalogue images to the Replit deployment before the generic API function', () => {
  const imageProxy = netlifyConfig.indexOf('from = "/api/catalogue-assets/*"');
  const genericApi = netlifyConfig.indexOf('from = "/api/*"');
  assert.ok(imageProxy >= 0 && imageProxy < genericApi, 'The specific image proxy must precede the generic API rule');
  assert.ok(netlifyConfig.includes('to = "https://print-garage-site.replit.app/api/catalogue-assets/:splat"'));
});
