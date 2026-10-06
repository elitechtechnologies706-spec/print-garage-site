// VAT-inclusive values transcribed from the supplied "TOTAL PRICE LIST".
// Prices are listed exactly by product variant; unspecified sizes, decoration and units
// must be confirmed with Print Garage rather than inferred from a different product.
export type PriceListItem = {
  code: string;
  name: string;
  price: number | readonly [number, number] | null;
  note?: string;
};

export const priceListSections: { title: string; items: PriceListItem[] }[] = [
  {
    title: 'Large format printing',
    items: [
      { code: '001', name: 'Outdoor banner — per metre', price: 17700, note: 'Confirm width, material and finishing before ordering.' },
      { code: '002', name: 'Indoor banner PVC', price: 29500 },
      { code: '003', name: 'Backdrop banner 2.2 m × 2.35 m', price: 2124000 },
      { code: '004', name: 'Teardrops (L-banner)', price: 377600 },
      { code: '005', name: 'Teardrop', price: 306800 },
      { code: '006', name: 'Pull-up banners', price: 259600 },
      { code: '007', name: 'Flags', price: 141600 },
      { code: '008', name: 'Corex standees, 120 cm × 100 cm', price: 295000 },
      { code: '009', name: 'Road signages', price: null, note: 'Depends on measurements.' },
      { code: '010', name: 'Vehicle branding', price: null, note: 'Depends on measurements.' },
      { code: '011', name: 'Office branding', price: null, note: 'Depends on measurements.' },
    ],
  },
  {
    title: 'Commercial printing',
    items: [
      { code: '012', name: 'Envelopes, A3', price: 1062 },
      { code: '013', name: 'Envelopes, A4', price: 826 },
      { code: '014', name: 'Envelopes, A5', price: 708 },
      { code: '015', name: 'Envelopes, cheque size', price: 590 },
      { code: '016', name: 'Spiral notebook', price: 18290 },
      { code: '017', name: 'Catalogue, 100–150 pages (100 pcs and above)', price: 33630 },
      { code: '018', name: 'Magazines', price: 40710 },
      { code: '019', name: 'Brochures, A4', price: 1180 },
      { code: '020', name: 'Brochures, A5', price: 590 },
      { code: '021', name: 'Brochures, A6', price: 354 },
      { code: '022', name: 'Posters, A3', price: 1770 },
      { code: '023', name: 'Posters, A4', price: 1180 },
      { code: '024', name: 'Gift bags', price: 10030 },
    ],
  },
  {
    title: 'Promotional items',
    items: [
      { code: '025', name: 'Executive bags', price: 177000 },
      { code: '026', name: 'Normal bags', price: 76700 },
      { code: '027', name: 'Notebooks', price: 41300 },
      { code: '028', name: 'Ordinary notebooks', price: 29500 },
      { code: '029', name: 'Executive pens', price: 41300 },
      { code: '030', name: 'Ordinary pens', price: 8850 },
      { code: '031', name: 'Round neck, high-end T-shirt', price: 37760 },
      { code: '032', name: 'Round neck, high T-shirt', price: 29500 },
      { code: '033', name: 'V-neck T-shirts', price: 41300 },
      { code: '034', name: 'Polo T-shirts, high-end', price: 53100 },
      { code: '035', name: 'Ordinary polo T-shirts', price: 41300 },
      { code: '036', name: 'Umbrella, big', price: 59000 },
      { code: '037', name: 'Umbrella, small', price: 41300 },
      { code: '038', name: 'Caps', price: 14160 },
      { code: '039', name: 'Key holders', price: 17700 },
      { code: '040', name: 'Reflector jackets', price: [17700, 29500] },
      { code: '041', name: 'Hoodies', price: 70800 },
      { code: '042', name: 'Mugs, high-end', price: 76700 },
      { code: '043', name: 'Ordinary mugs', price: 53100 },
      { code: '044', name: 'Hats', price: 17700 },
      { code: '045', name: 'Diaries', price: 53100 },
      { code: '046', name: 'Cross bags', price: 41300 },
      { code: '047', name: 'Corporate shirts, short-sleeved', price: 64900 },
      { code: '048', name: 'Corporate shirts, long-sleeved', price: 82600 },
      { code: '049', name: 'Travel mugs', price: 70800 },
      { code: '050', name: 'Water bottles', price: 35400 },
      { code: '051', name: 'Duffle bags', price: 212400 },
      { code: '052', name: 'Visibility jackets', price: 70800 },
      { code: '053', name: 'Lapel pins (badges)', price: 17700 },
      { code: '054', name: 'Power banks', price: 112100 },
      { code: '055', name: 'Wireless pad', price: 88500 },
      { code: '056', name: 'Plaques', price: 295000 },
      { code: '057', name: 'Lanyard', price: 17700 },
    ],
  },
  {
    title: 'Textiles & garments',
    items: [
      { code: '058', name: 'Full overalls', price: 70800 },
      { code: '059', name: 'Two-piece overalls with reflectors', price: 88500 },
      { code: '060', name: 'Overcoats', price: 53100 },
      { code: '061', name: 'Aprons', price: 29500 },
      { code: '062', name: 'Chef coats', price: 64900 },
    ],
  },
];

export const pricedItemByCode = new Map(
  priceListSections.flatMap(({ items }) => items).map((item) => [item.code, item]),
);

export function listedPrice(code: string): number {
  const price = pricedItemByCode.get(code)?.price;
  if (typeof price !== 'number') throw new Error(`No fixed VAT-inclusive price listed for item ${code}`);
  return price;
}