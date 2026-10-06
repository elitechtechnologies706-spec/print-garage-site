import activeImages from './image-library/active-images.json' with { type: 'json' };
import { isNeutralProductImage } from './brand-neutral-images';

// Small, explicit selection from existing reviewed bindings. Never include the review pool.
export const galleryCategories = [
  'Branded Clothing',
  'PPE & Safety',
  'Promotional Products',
  'Corporate Gifts',
  'Large Format & Signage',
] as const;

type GalleryCategory = typeof galleryCategories[number];
type GallerySelection = { src: keyof typeof activeImages; title: string; category: GalleryCategory };

const selection: GallerySelection[] = [
  { src: '/products/printed-white-tshirt.webp', title: 'Printed T-shirt concept', category: 'Branded Clothing' },
  { src: '/products/ppe-footwear.jpg', title: 'Protective work boots', category: 'PPE & Safety' },
  { src: '/products/promotional-pens.webp', title: 'Promotional pens', category: 'Promotional Products' },
  { src: '/products/executive-gift-set.webp', title: 'Presentation gift set', category: 'Corporate Gifts' },
  { src: '/products/pharmacy-signage.webp', title: 'Shopfront signage concept', category: 'Large Format & Signage' },
  { src: '/products/branded-mugs.jpg', title: 'Printed ceramic mugs', category: 'Promotional Products' },
  { src: '/products/navy-polo.webp', title: 'Polo shirt design', category: 'Branded Clothing' },
  { src: '/products/feather-flags.webp', title: 'Feather flag concepts', category: 'Large Format & Signage' },
  { src: '/products/notebook-pouch-set.webp', title: 'Notebook and pouch set', category: 'Corporate Gifts' },
  { src: '/products/branded-drinkware.webp', title: 'Reusable travel mugs', category: 'Promotional Products' },
];

export const galleryItems = selection.filter((item) => isNeutralProductImage(item.src))
  .map((item) => ({ ...item, ...activeImages[item.src] }));
