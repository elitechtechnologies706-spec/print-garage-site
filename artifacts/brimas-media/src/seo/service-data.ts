// Canonical origin matches the live site's preferred www host.
export { SITE_URL } from '../lib/site-config';

export type PriceTier = {
  name: 'Small' | 'Medium' | 'Bulk';
  scope: string;
  priceUgx?: number;
};

export type ServicePage = {
  slug: string;
  path: string;
  label: string;
  h1: string;
  title: string;
  meta: string;
  intro: string;
  detail: string;
  deliverables: string[];
  useCases: string[];
  image?: { src: string; alt: string; kind: 'photo' | 'mockup'; caption: string; contain?: boolean };
  tiers: PriceTier[];
  tierNote: string;
  faqs: { question: string; answer: string }[];
  schemaProduct?: { name: string; priceUgx: number; unit: string };
};

const tierNames = ['Small', 'Medium', 'Bulk'] as const;

function quoteTiers(scopes: readonly [string, string, string]): PriceTier[] {
  return tierNames.map((name, index) => ({ name, scope: scopes[index] }));
}

function costQuestion(subject: string, answer: string) {
  return {
    question: `How much does ${subject} cost in Kampala?`,
    answer,
  };
}

const quoteCost = 'There is no approved fixed rate for every specification. Send the dimensions or quantities, material, finish and artwork to Print Garage for a confirmed UGX quote.';

const serviceGroups = [
  ['printing-services-kampala', 'business-cards-printing-kampala', 'flyers-brochures-printing-kampala', 'banner-printing-kampala', 'large-format-printing-industrial-area'],
  ['t-shirt-printing-embroidery-kampala', 'uniform-embroidery-kampala', 'promotional-items-mugs-pens-kampala', 'corporate-gifts-branding-kampala'],
  ['ppe-supplier-kampala-uganda', 'safety-helmets-overalls-kampala', 'construction-company-branding-bundle'],
];

export function contextualServices(slug: string): ServicePage[] {
  const group = serviceGroups.find((items) => items.includes(slug));
  if (!group) throw new Error(`Define a contextual service group for ${slug}.`);
  return group.filter((item) => item !== slug).map((item) => {
    const service = servicePages.find((service) => service.slug === item);
    if (!service) throw new Error(`Unknown related service ${item}.`);
    return service;
  });
}

export const servicePages: ServicePage[] = [
  {
    slug: 'printing-services-kampala',
    path: '/printing-services-kampala',
    label: 'Printing services',
    h1: 'Printing Services in Kampala',
    title: 'Printing Services Kampala | Print Garage',
    meta: 'Printing services, brochures, envelopes and posters in Kampala. Confirm your specifications and current price at Print Garage, Peacock Building, 2nd Floor.',
    intro: 'Cards, company stationery and campaign print handled by a Kampala production partner you can actually visit.',
    detail: 'Start with the piece you need, not a generic price list. Tell the team what it will be used for, how many you need and whether your artwork is print-ready. Print Garage can confirm the stock, finish and schedule before production.',
    deliverables: ['Business cards and company stationery', 'Short-run print briefs and repeat orders', 'Artwork and finishing requirements confirmed with the team'],
    useCases: ['Opening a new office', 'Refreshing customer-facing materials', 'Preparing handouts for an event'],
    tiers: quoteTiers(['One print item or trial run', 'Coordinated company print batch', 'Multi-item campaign or repeat supply']),
    tierNote: 'Printing covers different formats. See the current VAT-inclusive price list for named products; business cards and custom jobs require a quote.',
    faqs: [
      costQuestion('printing services', quoteCost),
      { question: 'Can I bring artwork to Print Garage?', answer: 'Yes. Bring or send the design, required quantity and finished size. The team can tell you whether the files and print specification are ready.' },
      { question: 'Can Print Garage handle repeat company orders?', answer: 'Send the previous specification or sample and the new quantity. Print Garage will confirm the current stock and production timing before you commit.' },
    ],
  },
  {
    slug: 'business-cards-printing-kampala',
    path: '/business-cards-printing-kampala',
    label: 'Business card printing',
    h1: 'Business Card Printing in Kampala',
    title: 'Business Cards Kampala | Print Garage | Request a Quote',
    meta: 'Business card printing in Kampala by quote. Share quantity, card stock and artwork with Print Garage at Peacock Building, 2nd Floor. WhatsApp +256 780 347272.',
    intro: 'Make the first introduction feel considered. Order standard cards for one person or a coordinated set for the whole team.',
    detail: 'Business cards are not listed with a fixed price in the guide. Tell Print Garage whether you need a standard 90 × 50 mm card or a premium 85 × 55 mm format, and share the names, contacts and artwork for every version.',
    deliverables: ['Standard and premium card sizes', 'Standard or heavier card stock', 'Matte finish available for quotation'],
    useCases: ['New team members', 'Trade shows and sales visits', 'Branch-wide card refreshes'],
    tiers: quoteTiers(['100 standard cards', 'Cards for several team members', 'Large or repeat card run']),
    tierNote: 'Business cards are not in the current fixed price list. Quantity, stock, finish and artwork determine the confirmed quote.',
    faqs: [
      costQuestion('business card printing', 'The current price list does not include business cards. Send your quantity, size, stock, finish and artwork for a confirmed UGX quote.'),
      { question: 'What size should I send for my business cards?', answer: 'The guide lists standard 90 × 50 mm and premium 85 × 55 mm options. Share your design and preferred format for a final specification.' },
      { question: 'Can I print cards for different staff in one order?', answer: 'Yes, send each name, title and contact detail with the quantity per person. The team will confirm the final run and price before printing.' },
    ],
  },
  {
    slug: 'flyers-brochures-printing-kampala',
    path: '/flyers-brochures-printing-kampala',
    label: 'Flyers & brochures',
    h1: 'Flyers & Brochures Printing in Kampala',
    title: 'Flyers & Brochures Kampala | Print Garage',
    meta: 'Flyers and brochures in Kampala. Send size, quantity, paper and artwork to Print Garage at Peacock Building, 2nd Floor. WhatsApp +256 780 347272.',
    intro: 'Give your promotion something people can hold onto, from a simple handout to a more detailed company brochure.',
    detail: 'The VAT-inclusive price list names A4, A5 and A6 brochures. Flyers and other paper weights, folds, page counts, colours or run sizes need a job-specific quote from the team.',
    deliverables: ['Flyers for offers and announcements', 'Brochures for products and services', 'Print specification checked before production'],
    useCases: ['Store launches', 'Sales meetings', 'Event and field distribution'],
    tiers: quoteTiers(['One design / short run', 'Several versions or a wider distribution', 'Large campaign or repeat order']),
    tierNote: 'These are custom-job examples. See the full price list for named brochure sizes; flyer specifications require a separate quote.',
    faqs: [
      costQuestion('flyers and brochures printing', 'The current VAT-inclusive list includes A4, A5 and A6 brochures. Flyers and custom formats are quoted from paper, finish, quantity and artwork.'),
      { question: 'What information helps you quote a brochure?', answer: 'Send finished size, page count, quantity, colour requirements and whether it needs folding or binding, along with any artwork.' },
      { question: 'Can I ask for both flyers and brochures?', answer: 'Yes. List each item separately with its own quantity and dimensions so Print Garage can price the complete brief clearly.' },
    ],
  },
  {
    slug: 'banner-printing-kampala',
    path: '/banner-printing-kampala',
    label: 'Banner printing',
    h1: 'Banner Printing in Kampala',
    title: 'Banner Printing Kampala | Print Garage | Price Guide',
    meta: 'Outdoor banner printing in Kampala. Confirm dimensions, materials, finishing and current prices with Print Garage at Peacock Building, 2nd Floor.',
    intro: 'Make your announcement visible from across the road with a banner sized for the actual space it needs to fill.',
    detail: 'The VAT-inclusive guide prices outdoor banners per metre, not per square metre. Specify width and height, where the banner will hang, and whether you need eyelets or installation so Print Garage can confirm a final quote.',
    deliverables: ['Banner vinyl printing', 'Sizes based on your measured space', 'Finishing and fixing requirements checked'],
    useCases: ['Outdoor promotions', 'Event backdrops', 'Storefront announcements'],
    tiers: quoteTiers(['Outdoor banner, measured for placement', 'Several banners or larger site', 'Repeat campaign or multi-site order']),
    tierNote: 'The price list states UGX 17,700 per metre for outdoor banners, VAT included. No square-metre rate or finishing allowance is inferred.',
    faqs: [
      costQuestion('banner printing', 'Outdoor banners are listed at UGX 17,700 per metre including VAT. Confirm the width, finishing, installation and artwork for a final job-specific quote.'),
      { question: 'How do I measure for a banner?', answer: 'Send the width and height in metres, plus a photo of the installation space if useful. The team will confirm the finished size and hanging method.' },
      { question: 'Are eyelets included in the guide?', answer: 'Eyelets are part of the final specification, not an automatically included extra. Ask Print Garage to confirm the finishing and installation before ordering.' },
    ],
  },
  {
    slug: 'large-format-printing-industrial-area',
    image: { src: '/products/pharmacy-signage.webp', alt: 'Shopfront with a pharmacy signage concept', kind: 'mockup', contain: true, caption: 'Signage concept; materials, dimensions and installation are quoted separately.' },
    path: '/large-format-printing-industrial-area',
    label: 'Large-format printing',
    h1: 'Large Format & Signage in Kampala',
    title: 'Large Format & Signage Kampala | Print Garage',
    meta: 'Large-format printing, banners and signage in Kampala. Bring your measurements and artwork to Print Garage at Peacock Building, 2nd Floor, for a job-specific quote.',
    intro: 'When a print needs to be seen at distance, the right dimensions and material matter more than a one-size-fits-all price.',
    detail: 'Bring your measurements, artwork and a description of where the print or sign will be used. Print Garage will confirm the material, finishing and timing for your order. Sign and surface jobs need a job-specific quotation.',
    deliverables: ['Large-format print briefs', 'Banner vinyl as a priced example', 'Material and finishing advice for the intended placement'],
    useCases: ['Site visibility', 'Retail and showroom graphics', 'Event and campaign installations'],
    tiers: quoteTiers(['One large-format job', 'Several signs or banners', 'Multi-site large-format rollout']),
    tierNote: 'The outdoor banner price is per metre, not a universal large-format rate. Confirm width, installation and substrates with the team.',
    faqs: [
      costQuestion('large-format printing', 'Outdoor banners are listed at UGX 17,700 per metre including VAT. Other materials, finishes and installation needs must be quoted from your measurements and intended use.'),
      { question: 'Can I discuss large-format print in person?', answer: 'Yes. Bring the measurements, artwork and a photo of the space to Print Garage at Peacock Building, 2nd Floor, Kampala.' },
      { question: 'Is a banner price the same as a sign price?', answer: 'No. The outdoor banner rate is per metre. A sign or different surface needs its own material and installation quote.' },
    ],
  },
  {
    slug: 't-shirt-printing-embroidery-kampala',
    image: { src: '/products/printed-white-tshirt.webp', alt: 'White T-shirt with a colourful print design', kind: 'mockup', contain: true, caption: 'Garment print example; garment, artwork and branding method are confirmed per order.' },
    path: '/t-shirt-printing-embroidery-kampala',
    label: 'T-shirt printing & embroidery',
    h1: 'T-Shirt Printing & Embroidery in Kampala',
    title: 'T-Shirt Printing & Embroidery Kampala | Print Garage',
    meta: 'Branded clothing, T-shirt printing and embroidery enquiries in Kampala. Confirm garment styles, sizes, artwork and current prices with Print Garage.',
    intro: 'Put the same name on every team member without treating every garment and decoration method as the same job.',
    detail: 'The VAT-inclusive price list distinguishes round-neck, V-neck and polo T-shirt variants. The listed round-neck high T-shirt is UGX 29,500. Branding, embroidery, stitch coverage and larger sizes need a confirmed quote.',
    deliverables: ['Named T-shirt variants from the current price list', 'Branding and embroidery enquiries with artwork details', 'Mixed sizes and repeat runs discussed before production'],
    useCases: ['Field teams', 'Event staff', 'Promotion and launch crews'],
    tiers: quoteTiers(['Small T-shirt order', 'Mixed-size team T-shirts', 'Bulk or repeat garment run']),
    tierNote: 'The VAT-inclusive list has individual T-shirt variants; these jobs are quoted separately. Branding and embroidery are not assumed included.',
    faqs: [
      costQuestion('T-shirt printing and embroidery', 'A round-neck high T-shirt is listed at UGX 29,500 including VAT. Other variants appear on the full price list. Branding and embroidery need a separate quote.'),
      { question: 'Can I mix sizes in one T-shirt order?', answer: 'Yes. Share your size breakdown, preferred garment and artwork so the team can confirm availability and the final price.' },
      { question: 'What should I send for an embroidery quote?', answer: 'Send the logo, garment type, placement, approximate size and quantity. Stitch coverage affects the final specification.' },
    ],
  },
  {
    slug: 'uniform-embroidery-kampala',
    path: '/uniform-embroidery-kampala',
    label: 'Uniform embroidery',
    h1: 'Uniform Embroidery in Kampala',
    title: 'Uniform Embroidery Kampala | Print Garage',
    meta: 'Uniform embroidery in Kampala: share your logo, placement and team sizes with Print Garage at Peacock Building, 2nd Floor. WhatsApp +256 780 347272.',
    intro: 'A consistent mark on the right garment makes a team easier to recognize, whether it is a small front logo or a larger placement.',
    detail: 'Thread count, logo size, placement, garment supply and run size all shape an embroidery quote. Bring your artwork and size breakdown to Print Garage; there is no approved universal embroidery rate.',
    deliverables: ['Logo placement discussion', 'Garment and size specification', 'Embroidery brief reviewed before production'],
    useCases: ['Front-desk uniforms', 'Field staff workwear', 'Team refreshes and repeat orders'],
    tiers: quoteTiers(['One sample or small uniform run', 'A coordinated team set', 'Multi-size or repeat uniform programme']),
    tierNote: 'Embroidery prices are not published. Send the logo dimensions, placement, garments and quantity for a real quotation.',
    faqs: [
      costQuestion('uniform embroidery', quoteCost),
      { question: 'Do you need my logo file to quote embroidery?', answer: 'Yes. Send the clearest available artwork plus intended stitch size, garment and placement so Print Garage can assess the job.' },
      { question: 'Can uniforms be ordered in different sizes?', answer: 'Provide a size list per garment and the number of pieces in each size. The team can confirm suitable stock and production timing.' },
    ],
  },
  {
    slug: 'promotional-items-mugs-pens-kampala',
    path: '/promotional-items-mugs-pens-kampala',
    label: 'Promotional mugs & pens',
    h1: 'Promotional Products & Mugs in Kampala',
    title: 'Promotional Mugs & Pens Kampala | Print Garage',
    meta: 'Promotional products, mugs and pens in Kampala. Confirm colours, quantity, artwork and current prices with Print Garage at Peacock Building, 2nd Floor.',
    intro: 'Choose the useful things people keep reaching for, then make the brand treatment clear and consistent.',
    detail: 'The VAT-inclusive list names ordinary mugs at UGX 53,100 and ordinary pens at UGX 8,850. The pictured travel mugs are a different item. Material, capacity, colour, branding and quantity should be confirmed before ordering.',
    deliverables: ['Named mug and pen variants from the current list', 'Product selection discussed to match your brief', 'Artwork placement reviewed before ordering'],
    useCases: ['Client thank-you gifts', 'Conference welcome packs', 'Desk and reception supplies'],
    image: { src: '/products/promotional-pens.webp', alt: 'Selection of black promotional pens', kind: 'photo', contain: true, caption: 'Pen styles and branding are confirmed with your order.' },
    tiers: quoteTiers(['Individual mug or pen order', 'Mugs and pens for a team', 'Multi-item promotional campaign']),
    tierNote: 'Individual items have VAT-inclusive list prices, but these mixed jobs need a quote. Branding, capacity and material are confirmed separately.',
    faqs: [
      costQuestion('promotional mugs and pens', 'Ordinary mugs are listed at UGX 53,100 and ordinary pens at UGX 8,850 including VAT. Confirm the item, branding and quantity for a final quote.'),
      { question: 'Are the travel mugs in the image the same as the priced mug?', answer: 'No. The image is a catalogue example of travel cups. Ordinary mugs and travel mugs are separately priced in the current list.' },
      { question: 'Can you put mugs and pens in one order?', answer: 'Yes. List each product, colour, quantity and artwork separately so Print Garage can confirm the combined order and final price.' },
    ],
  },
  {
    slug: 'ppe-supplier-kampala-uganda',
    path: '/ppe-supplier-kampala-uganda',
    label: 'PPE supply',
    h1: 'PPE & Safety Supplies in Kampala, Uganda',
    title: 'PPE & Safety Kampala Uganda | Print Garage',
    meta: 'PPE and workwear enquiries in Kampala. Confirm sizes, quantities, site standards and product documentation with Print Garage before ordering.',
    intro: 'Equip the crew with the right garments and protective items while keeping quantities and sizes together in one brief.',
    detail: 'The current list prices full overalls at UGX 70,800 including VAT and two-piece reflective overalls at UGX 88,500. Helmets are not listed with a fixed price. Confirm protective standards, garment details and availability before placing an order.',
    deliverables: ['Standard safety helmets by quote', 'Named workwear variants from the list', 'Team quantities and sizes confirmed with the supplier'],
    useCases: ['Site onboarding', 'Replacement protective kit', 'Crew-wide workwear orders'],
    image: { src: '/products/branded-overalls-rack.webp', alt: 'High-visibility overalls and workwear hanging on a rack', kind: 'photo', caption: 'Product photo of workwear; confirm the specific PPE standard for your site.' },
    tiers: quoteTiers(['Individual PPE need', 'Team workwear and helmets', 'Bulk site kit order']),
    tierNote: 'Helmets are quote-only. The full price list has VAT-inclusive rates for named overall variants; site standards and branding require confirmation.',
    faqs: [
      costQuestion('PPE supply', 'Full overalls are listed at UGX 70,800 including VAT. Standard safety helmets are not on the current fixed price list; request a quote for the required safety specification.'),
      { question: 'Can I order helmets and overalls together?', answer: 'Yes. Send quantities for each item, overall sizes and any site-specific requirements. Print Garage will confirm availability and the final quote.' },
      { question: 'Are PPE items certified for my site?', answer: 'Certification requirements differ by project. Share the standard you need and ask Print Garage to confirm the exact product documentation before ordering.' },
    ],
  },
  {
    slug: 'safety-helmets-overalls-kampala',
    path: '/safety-helmets-overalls-kampala',
    label: 'Safety helmets & overalls',
    h1: 'Safety Helmets & Overalls in Kampala',
    title: 'Safety Helmets & Overalls Kampala | Print Garage',
    meta: 'Safety helmets and overalls in Kampala. Confirm sizes, quantities, branding, prices and site requirements with Print Garage at Peacock Building, 2nd Floor.',
    intro: 'One team, one coordinated kit. Sort helmet counts and garment sizes before work begins instead of chasing replacements later.',
    detail: 'The current calculator lists full overalls at UGX 70,800 including VAT. It does not list a fixed helmet price. Colour, fit, reflective details, branding and any required safety certification should be confirmed for your site.',
    deliverables: ['Standard helmets by quote', 'Overall size and colour discussion', 'Combined team list reviewed before supply'],
    useCases: ['Construction teams', 'Industrial visitors and staff', 'New-project PPE onboarding'],
    image: { src: '/products/reflective-overalls-range.webp', alt: 'Reflective overalls in multiple colours hanging on a clothing rack', kind: 'photo', caption: 'Product photo; the exact garment and safety specification are confirmed per order.' },
    tiers: quoteTiers(['Individual garment or helmet', 'Team PPE order', 'Bulk site workwear and PPE']),
    tierNote: 'See the current VAT-inclusive list for named overall variants. Helmets, branding and certification are quoted by specification.',
    faqs: [
      costQuestion('safety helmets and overalls', 'Full overalls are listed at UGX 70,800 including VAT; two-piece reflective overalls are UGX 88,500. Helmets are quote-only. Confirm exact site requirements before ordering.'),
      { question: 'What sizes of overalls can I ask about?', answer: 'The calculator lists Small–XL and 2XL–4XL size ranges. Send the count for each size so the team can check availability.' },
      { question: 'Can Print Garage add our logo to the kit?', answer: 'Send the artwork, placement and quantities. Guide overall prices do not assume branding; the full specification is confirmed in the final quote.' },
    ],
  },
  {
    slug: 'corporate-gifts-branding-kampala',
    path: '/corporate-gifts-branding-kampala',
    label: 'Corporate gifts',
    h1: 'Corporate Gifts & Branding in Kampala',
    title: 'Corporate Gifts & Branding Kampala | Print Garage',
    meta: 'Corporate gifts and packaging enquiries in Kampala. Send recipient count, preferred items and budget to Print Garage. WhatsApp +256 780 347272.',
    intro: 'A gift should feel assembled for its recipient, not pulled from a generic shelf at the last minute.',
    detail: 'Print Garage can discuss the contents, presentation, quantity and brand treatment for your occasion. The gallery shows example gift boxes, but no fixed gift-set price or current stock list has been approved for publication.',
    deliverables: ['Gift box and hamper brief', 'Packaging and brand treatment options', 'Recipient counts and delivery needs discussed'],
    useCases: ['Client appreciation', 'Staff recognition', 'Event and onboarding gifts'],
    image: { src: '/products/executive-gift-set.webp', alt: 'Black presentation box containing a blue notebook and coordinated accessories', kind: 'photo', contain: true, caption: 'Catalogue gift-set example. Contents, branding and current availability are confirmed with the team.' },
    tiers: quoteTiers(['A few individual gifts', 'A team or client-list order', 'Multi-recipient campaign or repeat gifting']),
    tierNote: 'No fixed corporate-gift package price has been approved. Contents, packaging and quantities are quoted from your brief.',
    faqs: [
      costQuestion('corporate gifts and branding', 'Gift contents and quantities vary. Share the number of recipients, preferred items and budget range for an approved quotation.'),
      { question: 'Can I choose what goes inside the gift box?', answer: 'Yes. Share the occasion, budget and preferred items. Print Garage can confirm what is available and what can be branded.' },
      { question: 'Do the photographed boxes show guaranteed contents?', answer: 'No. The photos are examples; the team confirms current item availability and the final combination for your order.' },
    ],
  },
  {
    slug: 'construction-company-branding-bundle',
    path: '/construction-company-branding-bundle',
    label: 'Construction company branding bundle',
    h1: 'Construction Company Branding Bundle in Kampala',
    title: 'Construction Company Branding Bundle | Print Garage',
    meta: 'Discuss crew workwear, helmets, cards and branded T-shirts with Print Garage in Kampala. Package specifications and price by quote. WhatsApp +256 780 347272.',
    intro: 'A ready-made starting brief for site teams that need workwear, helmets and branded essentials together.',
    detail: 'The current price sheet does not list a total for the Head to Toe PPE Pack. Share the crew size, garment variants and site requirements to receive a confirmed package quote; individual prices cannot be added up into an assumed bundle price.',
    deliverables: ['20 overalls and 20 standard helmets', '100 business cards', '50 T-shirts with branding specification confirmed'],
    useCases: ['New site mobilisation', 'Growing a field crew', 'Presenting a consistent company identity'],
    image: { src: '/products/branded-overalls-rack.webp', alt: 'High-visibility overalls hanging on a rack', kind: 'photo', caption: 'Workwear photo; the complete pack also includes helmets, cards and T-shirts.' },
    tiers: [
      { name: 'Small', scope: 'Custom smaller crew kit — request a quote' },
      { name: 'Medium', scope: 'Head to Toe PPE Pack — 20 overalls, 20 helmets, 100 cards, 50 T-shirts — request a quote' },
      { name: 'Bulk', scope: 'Multi-crew rollout — request a quote' },
    ],
    tierNote: 'No fixed package price appears in the current list. Confirm stock, sizes, artwork, protective standards and lead time.',
    faqs: [
      costQuestion('a construction company branding bundle', 'No fixed package total appears in the current VAT-inclusive list. Share the crew count, sizes and exact products for a confirmed quote.'),
      { question: 'Can I change the pack quantities?', answer: 'Yes. Send the crew count and quantities you want. Every package mix needs a confirmed quote.' },
      { question: 'What do you need to brand a new site team?', answer: 'Send the company artwork, overall size breakdown, helmet requirements, card details and T-shirt sizes. Print Garage will confirm the final specification.' },
    ],
  },
];

export const serviceByPath = new Map(servicePages.map((service) => [service.path, service]));