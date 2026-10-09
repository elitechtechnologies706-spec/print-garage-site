// Public media delivery configuration only; never put credentials in image URLs.
export function resolveImageSource(source: string, base = ''): string {
  // Catalogue files are served by this app's API, not the legacy static CDN.
  if (source.startsWith('/api/catalogue-assets/')) return source;
  if (!source.startsWith('/') || source.startsWith('//')) {
    const url = new URL(source);
    if (url.protocol !== 'https:' || url.username || url.password) {
      throw new Error('External catalogue images must use credential-free HTTPS URLs.');
    }
    return url.href;
  }
  if (!base) return source;
  const url = new URL(base);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('Image CDN base must be a credential-free HTTPS URL without query or fragment.');
  }
  return `${url.href.replace(/\/$/, '')}${source}`;
}