import { listedPrice } from './price-list';
import { SITE } from './site-config';

export const WHATSAPP = SITE.whatsapp;
export const CALL = `tel:${SITE.phone}`;

export type QuoteKey = 'cards' | 'banner' | 'tshirt' | 'mug' | 'overall' | 'helmet';

export const quoteOptions: Record<QuoteKey, {
  category: string;
  label: string;
  price: number | null;
  guide: string;
  unit: string;
  sizes: string[];
  materials: string[];
  finishes: string[];
}> = {
  cards: {
    category: 'Printing',
    label: 'Business cards',
    price: null,
    guide: 'Request a quote · no matching price in the current list',
    unit: 'cards',
    sizes: ['Standard 90 × 50 mm', 'Premium 85 × 55 mm'],
    materials: ['Standard card stock', 'Heavy card stock'],
    finishes: ['Standard finish', 'Matte finish'],
  },
  banner: {
    category: 'Large Format & Signage',
    label: 'Outdoor banner — per metre',
    price: listedPrice('001'),
    guide: 'UGX 17,700 / metre · VAT included; confirm width',
    unit: 'metres',
    sizes: ['Confirm finished width with Print Garage'],
    materials: ['Outdoor banner — confirm material'],
    finishes: ['Finishing to confirm'],
  },
  tshirt: {
    category: 'Branded Clothing',
    label: 'Round neck, high T-shirt',
    price: listedPrice('032'),
    guide: 'UGX 29,500 / T-shirt · VAT included',
    unit: 'T-shirts',
    sizes: ['Mixed team sizes', 'Small–XL', '2XL–4XL'],
    materials: ['Round neck, high — confirm fabric'],
    finishes: ['Branding quoted from artwork'],
  },
  mug: {
    category: 'Promotional Products',
    label: 'Ordinary mug',
    price: listedPrice('043'),
    guide: 'UGX 53,100 / mug · VAT included',
    unit: 'mugs',
    sizes: ['Capacity to confirm'],
    materials: ['Ordinary mug — confirm material'],
    finishes: ['Branding quoted from artwork'],
  },
  overall: {
    category: 'PPE & Safety',
    label: 'Full overall',
    price: listedPrice('058'),
    guide: 'UGX 70,800 / full overall · VAT included',
    unit: 'full overalls',
    sizes: ['Mixed team sizes', 'Small–XL', '2XL–4XL'],
    materials: ['Workwear fabric — confirm specification'],
    finishes: ['Branding and reflectors to confirm'],
  },
  helmet: {
    category: 'PPE & Safety',
    label: 'Helmet',
    price: null,
    guide: 'Request a quote · not in the current price list',
    unit: 'helmets',
    sizes: ['Standard fit'],
    materials: ['Safety helmet'],
    finishes: ['Standard finish'],
  },
};

export function formatUgx(value: number) {
  return `UGX ${Math.round(value).toLocaleString('en-UG')}`;
}

export function formatUsd(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function whatsappHref(message: string) {
  return `${WHATSAPP}?text=${encodeURIComponent(message)}`;
}