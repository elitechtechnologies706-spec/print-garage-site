import catalogue from './image-library/catalog.json' with { type: 'json' };
import { isNeutralDescription } from './brand-neutral-images';

const categoryLabels: Record<string, string> = {
  'garment-branding': 'Branded Clothing',
  'promotional-products': 'Promotional Products',
  'corporate-gifts': 'Corporate Gifts',
  'bags-accessories': 'Bags & Accessories',
  workwear: 'PPE & Safety',
  ppe: 'PPE & Safety',
  signage: 'Large Format & Signage',
  'event-branding': 'Large Format & Signage',
  'vehicle-branding': 'Large Format & Signage',
};

// Existing metadata only: tentative categories/subjects are not treated as verified.
export const fullGalleryItems = catalogue.assets
  .filter((asset) => asset.status === 'mapped' && isNeutralDescription(asset.alt))
  .map((asset, index) => {
  const verified = asset.status === 'mapped' && Boolean(asset.alt);
  const label = `Catalogue image ${String(index + 1).padStart(3, '0')}`;
  return {
    id: asset.id,
    title: verified ? asset.subject || label : label,
    alt: verified ? asset.alt! : `${label} — description not verified`,
    category: verified ? categoryLabels[asset.category] ?? 'Uncategorized' : 'Uncategorized',
    provenance: verified ? asset.provenance : 'unknown',
    src: asset.delivery.url,
    width: asset.delivery.width,
    height: asset.delivery.height,
    srcSet: [...asset.variants.map((variant) => `${variant.url} ${variant.width}w`),
      `${asset.delivery.url} ${asset.delivery.width}w`].join(', '),
  };
});

export const fullGalleryCategories = [...new Set(fullGalleryItems.map((item) => item.category))];
