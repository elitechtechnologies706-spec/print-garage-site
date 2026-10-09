import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveImageSource } from '../src/lib/image-source.ts';

test('local media retains existing URLs without a CDN', () => {
  assert.equal(resolveImageSource('/products/tassel-keyrings.webp'), '/products/tassel-keyrings.webp');
});
test('stored catalogue cuts stay on the API even when a legacy CDN is configured', () => {
  assert.equal(resolveImageSource('/api/catalogue-assets/eco-p03-01.webp', 'https://media.example.com'),
    '/api/catalogue-assets/eco-p03-01.webp');
});
test('a public CDN can preserve paths under an optional prefix', () => {
  assert.equal(resolveImageSource('/products/photo.webp', 'https://media.example.com/library/'),
    'https://media.example.com/library/products/photo.webp');
});
test('an explicitly supplied HTTPS library URL is preserved', () => {
  assert.equal(resolveImageSource('https://media.example.com/images/printing/cards.webp'),
    'https://media.example.com/images/printing/cards.webp');
});
test('insecure/credential-bearing configuration fails explicitly', () => {
  for (const base of ['http://media.example.com', 'https://user:pass@example.com', 'https://example.com/?token=private', 'https://example.com/#fragment', 'not-a-url']) {
    assert.throws(() => resolveImageSource('/products/photo.webp', base));
  }
  for (const source of ['//example.com/image.webp', 'javascript:alert(1)', 'http://example.com/image.webp', 'https://user:pass@example.com/image.webp']) {
    assert.throws(() => resolveImageSource(source));
  }
});