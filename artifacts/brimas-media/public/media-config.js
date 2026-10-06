// Optional public HTTPS CDN prefix. Keep empty to use the existing local assets.
// Preserve /products/ and /service-crops/ paths on the CDN. Never add credentials.
window.PRINT_GARAGE_IMAGE_CDN_BASE = '';
// Only individually verified catalog bindings use Cloudinary after hydration.
// False restores the retained local catalogue without an application rebuild.
window.PRINT_GARAGE_CLOUDINARY_ENABLED = true;
window.dispatchEvent(new Event('print-garage:media-config'));