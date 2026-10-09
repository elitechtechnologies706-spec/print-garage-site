export type CatalogueProduct = {
  id: string; name: string; category: string; subcategory?: string; image: string;
  width?: number; height?: number; sourcePdf?: string; page?: number; eco?: boolean; teaser?: boolean;
};
export type CatalogueService = { id: string; name: string; image: string; href?: string };
export type Catalogue = {
  about: string; vision: string; mission: string; purpose: string;
  products: CatalogueProduct[]; services: CatalogueService[]; partners: { name: string; logo: string; href?: string }[];
};

import data from './print-garage-catalogue.json';

export const catalogue: Catalogue = {
  about: data.about,
  vision: data.vision,
  mission: data.mission,
  purpose: data.purpose || 'To help businesses and organisations promote themselves through quality printing, branding and promotional products.',
  products: data.products as CatalogueProduct[],
  services: data.services as CatalogueService[],
  partners: (data as { partners?: Catalogue['partners'] }).partners ?? [],
};

export const slugify = (value: string) => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const labelise = (value: string) => value.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const HOME_TEASER_CATEGORIES = ['drinkware', 'bags', 'eco', 'corporate-gifts', 'promotional-products', 'portfolio'];

export function homeTeasers(products: CatalogueProduct[]) {
  const out: CatalogueProduct[] = [];
  HOME_TEASER_CATEGORIES.forEach((cat) => {
    out.push(...products.filter((p) => p.teaser && slugify(p.category) === cat).slice(0, 2));
  });
  return out;
}

export const CATEGORY_LABELS: Record<string, string> = {
  'promotional-products': 'Promotional Products', textiles: 'Textiles', drinkware: 'Drinkware',
  'corporate-gifts': 'Corporate Gifts', bags: 'Bags', 'commercial-printing': 'Commercial Printing',
  ppe: 'PPE', 'large-format': 'Large Format', eco: 'Eco', portfolio: 'KCB Portfolio',
};
export const categoryLabel = (slug: string) => CATEGORY_LABELS[slug] ?? labelise(slug);
export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);

// Service id -> exact catalogue category slugs.
export const serviceAliases: Record<string, string[]> = {
  'large-format': ['large-format'],
  'commercial-printing': ['commercial-printing'],
  'corporate-branding': ['corporate-gifts', 'portfolio'],
  'promotional-gifts': ['promotional-products', 'corporate-gifts'],
  'textile-garment': ['textiles', 'ppe'],
  'eco-printing': ['eco'],
};

export function categoriesFor(param?: string): string[] | null {
  if (!param) return null;
  const slug = slugify(param);
  if (serviceAliases[slug]) return serviceAliases[slug];
  return [slug];
}
