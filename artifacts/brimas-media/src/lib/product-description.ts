import descriptions from './product-descriptions.json';
import { categoryLabel, type CatalogueProduct } from './pg-catalogue';

const byType: Record<string, string> = descriptions;

export function productDescription(product: CatalogueProduct): string {
  if (product.category === 'portfolio') {
    const referenceTypes: [RegExp, string][] = [
      [/notebook|diary/i, 'notebook gift'],
      [/tumbler|cup|mug|bottle|flask/i, 'drinkware'],
      [/pen/i, 'pen gift'],
      [/bag|backpack/i, 'bag'],
      [/shirt|polo|cap/i, 'team clothing'],
      [/gift|hamper/i, 'corporate gift'],
    ];
    const type = referenceTypes.find(([pattern]) => pattern.test(product.name))?.[1];
    return type ? `A ${type} design reference for planning your own branded order.` : byType['kcb-catalogue'];
  }
  if (product.category === 'eco' && product.subcategory === 'stationery') {
    return 'Explore stationery options for your next eco-themed gift brief.';
  }
  return byType[product.subcategory ?? '']
    ?? `Discuss branding and quantities for this ${categoryLabel(product.category).toLowerCase()} item.`;
}
