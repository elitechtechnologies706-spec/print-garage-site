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
    question: `How is my ${subject} order priced at Print Garage?`,
    answer,
  };
}

const quoteCost = 'Print Garage prices the specification you submit rather than applying one rate to every job. Include dimensions, quantities, materials, finishing and a design reference so we can prepare a UGX quotation.';

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
    h1: 'Business Print, Specified with Print Garage',
    title: 'Printing Services Kampala | Print Garage',
    meta: 'Prepare your business print brief with Print Garage in Kampala. Discuss stationery, cards and campaign materials, with paper and finishing specified per order.',
    intro: 'The documents your business hands out should belong to the same brand. Plan your cards, stationery and campaign materials as a clear print brief.',
    detail: 'List the documents, their finished sizes and the number of copies. Add the artwork and explain how the pieces will be distributed. Print Garage can then discuss paper choices, finishing and the production schedule for that specification.',
    deliverables: ['Office stationery and contact cards', 'Print quantities matched to your brief', 'A discussion of paper, artwork and finish'],
    useCases: ['Setting up company stationery', 'Updating sales materials', 'Planning a printed event pack'],
    tiers: quoteTiers(['A single document specification', 'A stationery set for one business', 'Several print items across a campaign']),
    tierNote: 'Guide rates apply only to the items named in the price list. Bespoke print specifications and business cards need an individual quotation.',
    faqs: [
      costQuestion('printing services', quoteCost),
      { question: 'Which files should accompany a print enquiry?', answer: 'Attach your design, the intended finished dimensions and your copy count. We will review what you have supplied and identify any specification details still needed.' },
      { question: 'What should I provide for a reprint?', answer: 'A previous sample or job specification is useful, together with the new quantities. Ask us to recheck paper availability and scheduling rather than assuming the earlier order terms still apply.' },
    ],
  },
  {
    slug: 'business-cards-printing-kampala',
    path: '/business-cards-printing-kampala',
    label: 'Business card printing',
    h1: 'Your Team, Introduced on Print Garage Cards',
    title: 'Business Cards Kampala | Print Garage | Request a Quote',
    meta: 'Create a coordinated business-card order with Print Garage in Kampala. Submit staff details, preferred card size, paper and quantities for a tailored quotation.',
    intro: 'Give every contact the right information in a compact, branded format. Build one card design or a set of matching versions for your staff.',
    detail: 'Choose between the guide formats of 90 × 50 mm for standard cards and 85 × 55 mm for premium cards. Prepare the correct details for each person and say how many copies each needs. Cards are quoted individually; there is no fixed card rate in the published list.',
    deliverables: ['90 × 50 mm or 85 × 55 mm format enquiries', 'Paper-weight choices for quotation', 'Matte finishing discussed as part of the brief'],
    useCases: ['Welcoming a staff member', 'Preparing for a business exhibition', 'Aligning contact cards across branches'],
    tiers: quoteTiers(['A 100-card starting enquiry', 'Several personalised staff versions', 'A larger business-card replenishment']),
    tierNote: 'Select the size, paper and finishing before requesting the rate. A business-card total cannot be taken from the fixed-price guide.',
    faqs: [
      costQuestion('business card printing', 'Business cards require their own quotation. We need the copy count, dimensions, paper choice, finish and design before a UGX total can be confirmed.'),
      { question: 'Which card formats can I specify?', answer: 'Our reference dimensions are 90 × 50 mm for standard cards and 85 × 55 mm for the premium format. Identify your preferred option when submitting the artwork.' },
      { question: 'How do I submit a team card order?', answer: 'Provide a checked list of names, roles and contact details, alongside quantities for each version. This lets us discuss the complete run without guessing who needs which card.' },
    ],
  },
  {
    slug: 'flyers-brochures-printing-kampala',
    path: '/flyers-brochures-printing-kampala',
    label: 'Flyers & brochures',
    h1: 'Print Garage Handouts for Your Next Campaign',
    title: 'Flyers & Brochures Kampala | Print Garage',
    meta: 'Turn a Kampala promotion into a flyer or brochure brief with Print Garage. Choose the format, paper, copy count and folds before requesting your print price.',
    intro: 'A quick announcement and a detailed product story need different formats. Choose the amount of information first, then plan the handout around it.',
    detail: 'A4, A5 and A6 brochure entries appear in the VAT-inclusive guide. For flyers or a different paper, fold, page count or print run, describe the complete specification. Those choices need a quotation rather than an assumed brochure rate.',
    deliverables: ['Offer leaflets and announcement handouts', 'Product or company brochure enquiries', 'Paper, page and fold details agreed in the brief'],
    useCases: ['Introducing a new outlet', 'Presenting a product range', 'Distributing campaign information'],
    tiers: quoteTiers(['One handout design and copy count', 'Multiple versions for a campaign', 'A larger distribution print brief']),
    tierNote: 'The named brochure formats have guide entries. Custom flyers and alterations to a brochure specification are priced on enquiry.',
    faqs: [
      costQuestion('flyers and brochures printing', 'Use the VAT-inclusive guide for its named A4, A5 and A6 brochure entries. A flyer or customised brochure needs its paper, finish, artwork and copy count reviewed for a quotation.'),
      { question: 'What belongs in a brochure specification?', answer: 'Include the closed size, number of pages, copies required and colour details. Explain any folding or binding and attach the design you want printed.' },
      { question: 'How should a mixed handout order be organised?', answer: 'Give flyers and brochures separate lines in your enquiry, each with dimensions and quantities. We can then review the items together while keeping their costs distinct.' },
    ],
  },
  {
    slug: 'banner-printing-kampala',
    path: '/banner-printing-kampala',
    label: 'Banner printing',
    h1: 'A Banner Brief Built Around Your Space',
    title: 'Banner Printing Kampala | Print Garage | Price Guide',
    meta: 'Specify an outdoor banner with Print Garage in Kampala. Share your measured width, height, display location and finishing needs for a confirmed quotation.',
    intro: 'Measure the display area before choosing your banner. The message, dimensions and hanging method all belong in the same production brief.',
    detail: 'Describe the banner location and supply both width and height. Tell us whether you need eyelets or help with installation. The published outdoor-banner guide is UGX 17,700 per metre including VAT; it is not a square-metre rate or an all-inclusive installation price.',
    deliverables: ['Vinyl banner enquiries', 'Finished dimensions from your measurements', 'Hanging and edge-finishing specifications'],
    useCases: ['Advertising an offer outdoors', 'Preparing an event display', 'Announcing a shop opening'],
    tiers: quoteTiers(['One measured outdoor banner', 'A coordinated set of banner positions', 'Banner orders across several locations']),
    tierNote: 'UGX 17,700 is the VAT-inclusive per-metre guide rate. Confirm the full dimensions and extras before calculating an order total.',
    faqs: [
      costQuestion('banner printing', 'Our outdoor-banner guide shows UGX 17,700 per metre, VAT included. Submit the dimensions, artwork and required finishing so the complete job can be priced correctly.'),
      { question: 'Which measurements do you need for a banner?', answer: 'Use metres for both the width and height. A photo of the proposed position can help explain the fixing points and display arrangement.' },
      { question: 'Does the banner rate cover fittings?', answer: 'Do not assume eyelets, other finishing or installation are included. Put those requirements in your enquiry and ask for them to be confirmed in the quotation.' },
    ],
  },
  {
    slug: 'large-format-printing-industrial-area',
    image: { src: '/products/pharmacy-signage.webp', alt: 'Pharmacy shopfront signage visual reference', kind: 'mockup', contain: true, caption: 'A signage concept to inform your brief, not a completed-project claim.' },
    path: '/large-format-printing-industrial-area',
    label: 'Large-format printing',
    h1: 'Print Garage Graphics for Bigger Surfaces',
    title: 'Large Format & Signage Kampala | Print Garage',
    meta: 'Bring your large-surface branding plans to Print Garage in Kampala. Discuss signs, display graphics and banners with material and installation needs specified.',
    intro: 'A shopfront, event space or worksite gives your brand room to be seen. Describe the surface and viewing position so the print specification suits the location.',
    detail: 'Start with the measured area, a location photograph and the artwork. Explain indoor or outdoor use and any installation needs. Different sign materials and surfaces require separate quotations; a banner guide rate cannot price every large-format job.',
    deliverables: ['Surface-specific graphic enquiries', 'Banner options where appropriate', 'Material and finishing discussion for the location'],
    useCases: ['Identifying business premises', 'Updating retail display areas', 'Branding a campaign venue'],
    tiers: quoteTiers(['A single surface or sign brief', 'Several graphics for one location', 'A coordinated multi-location specification']),
    tierNote: 'The per-metre banner entry is only a guide for that named product. Sign substrates, fittings and installation need their own agreed specification.',
    faqs: [
      costQuestion('large-format printing', 'The guide lists outdoor banners at UGX 17,700 per metre including VAT. Other large-format materials or installation work are assessed from the specific surface, dimensions and finish.'),
      { question: 'What helps an in-person signage discussion?', answer: 'Bring your measurements and design, plus a photograph of the intended position. You can discuss them at Peacock Building, 2nd Floor, Kampala.' },
      { question: 'Can I use a vinyl-banner rate for a shop sign?', answer: 'A sign may need a different substrate, finishing and fixing arrangement. Request its own quotation instead of applying the banner rate.' },
    ],
  },
  {
    slug: 't-shirt-printing-embroidery-kampala',
    image: { src: '/products/printed-white-tshirt.webp', alt: 'Colourful artwork illustrated on a white T-shirt', kind: 'mockup', contain: true, caption: 'A garment concept: confirm the actual shirt and decoration specification on enquiry.' },
    path: '/t-shirt-printing-embroidery-kampala',
    label: 'T-shirt printing & embroidery',
    h1: 'Team Clothing with Your Brand in Mind',
    title: 'T-Shirt Printing & Embroidery Kampala | Print Garage',
    meta: 'Plan branded T-shirts and garment decoration with Print Garage in Kampala. Submit your style, team sizes, logo placements and quantities for review.',
    intro: 'Choose the garment your team will actually wear, then decide how the logo should appear. Shirt style, fit and decoration belong in one coordinated brief.',
    detail: 'Our guide separates round-neck, V-neck and polo variants. The named round-neck high T-shirt has a VAT-inclusive guide rate of UGX 29,500. Printing, embroidery, stitch coverage and larger-size requirements must be checked separately in your quotation.',
    deliverables: ['Shirt-style selections from the guide', 'Artwork and decoration-placement enquiries', 'Quantity breakdowns by garment size'],
    useCases: ['Outfitting a field crew', 'Identifying event personnel', 'Preparing launch-day clothing'],
    tiers: quoteTiers(['A few shirts with defined artwork', 'A team order split across sizes', 'A larger or recurring clothing brief']),
    tierNote: 'Garment guide entries do not automatically include logo printing or embroidery. Ask for the shirt and decoration to be specified in the final price.',
    faqs: [
      costQuestion('T-shirt printing and embroidery', 'The round-neck high T-shirt guide entry is UGX 29,500 with VAT. Choose your actual garment variant from the list, then request a quotation for any printing or embroidery.'),
      { question: 'How do I prepare a mixed-size shirt brief?', answer: 'Count the pieces required in each size and identify the shirt style. Attach your design so garment availability and decoration can be reviewed together.' },
      { question: 'Which logo details affect garment decoration?', answer: 'Show us the artwork, its approximate dimensions and the intended position on the shirt. For embroidery, stitch coverage also needs assessment.' },
    ],
  },
  {
    slug: 'uniform-embroidery-kampala',
    path: '/uniform-embroidery-kampala',
    label: 'Uniform embroidery',
    h1: 'Uniform Logos, Carefully Specified',
    title: 'Uniform Embroidery Kampala | Print Garage',
    meta: 'Discuss embroidered uniform logos with Print Garage in Kampala. Define the garment, logo dimensions, position and staff quantities for an individual quote.',
    intro: 'Plan where the logo sits and how it should read before ordering a uniform run. Small chest marks and larger designs need different embroidery specifications.',
    detail: 'Include the garment type, size list, artwork dimensions and preferred placement. Thread coverage and the number of pieces influence the job. Print Garage does not publish a universal embroidery rate; the complete brief needs review.',
    deliverables: ['An enquiry built around your logo placement', 'Uniform types and size counts', 'Artwork review for an embroidery quotation'],
    useCases: ['Identifying reception staff', 'Branding operational workwear', 'Reordering an established uniform style'],
    tiers: quoteTiers(['A sample or limited uniform enquiry', 'One staff uniform specification', 'A repeat or multi-size uniform brief']),
    tierNote: 'There is no fixed embroidery rate in the guide. Describe the artwork area, garment supply and run size to request an accurate quotation.',
    faqs: [
      costQuestion('uniform embroidery', quoteCost),
      { question: 'How should I present a uniform logo enquiry?', answer: 'Use the best-quality logo file you have and identify the garment, position and approximate design size. Those details let us assess the embroidery rather than quote from the company name alone.' },
      { question: 'What size information should accompany a uniform order?', answer: 'List each garment type with the number required in every size. Availability and the production schedule can then be checked against that list.' },
    ],
  },
  {
    slug: 'promotional-items-mugs-pens-kampala',
    path: '/promotional-items-mugs-pens-kampala',
    label: 'Promotional mugs & pens',
    h1: 'Useful Giveaways, Chosen for Your Audience',
    title: 'Promotional Mugs & Pens Kampala | Print Garage',
    meta: 'Explore mugs, pens and promotional-item enquiries at Print Garage in Kampala. Match the product, quantity and logo treatment to the people receiving it.',
    intro: 'Pick an item that fits the occasion and the people taking it home. Then specify the colour, quantity and brand placement for your promotional order.',
    detail: 'The guide names ordinary mugs at UGX 53,100 and ordinary pens at UGX 8,850, both with VAT included. A travel cup is a separate product. Check the material, capacity, colour and decoration requirements before using any guide entry to plan a total.',
    deliverables: ['Mug and pen options from the named guide entries', 'A product brief matched to the occasion', 'Logo position and quantity specifications'],
    useCases: ['Preparing customer giveaways', 'Building conference participant packs', 'Choosing branded desk essentials'],
    image: { src: '/products/promotional-pens.webp', alt: 'Black pen styles shown as promotional product references', kind: 'photo', contain: true, caption: 'Use the pen reference to describe your enquiry; style and decoration need confirmation.' },
    tiers: quoteTiers(['One promotional product specification', 'Mugs or pens for a recipient group', 'A campaign combining several giveaway items']),
    tierNote: 'A guide rate names an individual item, not a complete giveaway package. Material, capacity and branding must match the product in your quotation.',
    faqs: [
      costQuestion('promotional mugs and pens', 'VAT-inclusive guide entries are UGX 53,100 for ordinary mugs and UGX 8,850 for ordinary pens. The actual variant, branding and quantity still need confirmation before an order is agreed.'),
      { question: 'Can I apply an ordinary-mug rate to a travel cup?', answer: 'No. Ordinary mugs and travel cups are different guide items. Ask about the exact cup shown or requested, including its capacity and material.' },
      { question: 'How do I describe a combined giveaway order?', answer: 'Specify each item on its own line with a colour, quantity and design. That gives us enough detail to assess the combination and provide a complete quotation.' },
    ],
  },
  {
    slug: 'ppe-supplier-kampala-uganda',
    path: '/ppe-supplier-kampala-uganda',
    label: 'PPE supply',
    h1: 'Plan Your Crew’s Protective Kit',
    title: 'PPE & Safety Kampala Uganda | Print Garage',
    meta: 'Prepare a PPE and workwear enquiry with Print Garage in Kampala. List sizes, headcounts and the protective standards required by your site.',
    intro: 'Protective equipment should be selected against the job, not just the appearance of a catalogue image. Put your site requirements beside the crew quantities.',
    detail: 'Full overalls have a VAT-inclusive guide entry of UGX 70,800; two-piece reflective overalls are UGX 88,500. Helmets require a quotation. Verify the exact garment, protective standard, documentation and stock before choosing equipment for site use.',
    deliverables: ['Helmet specifications for individual quotation', 'Workwear choices from the named guide variants', 'Crew size and quantity schedules'],
    useCases: ['Preparing people for a new site', 'Replacing worn protective garments', 'Planning a workwear supply enquiry'],
    image: { src: '/products/branded-overalls-rack.webp', alt: 'Workwear reference showing high-visibility garments on hangers', kind: 'photo', caption: 'Appearance alone does not establish a PPE rating; verify the product documents for your site.' },
    tiers: quoteTiers(['A specific protective-item enquiry', 'A crew clothing and helmet list', 'A larger site-equipment brief']),
    tierNote: 'Listed overall variants have their own VAT-inclusive rates. Helmet costs, any branding and site-standard suitability require explicit confirmation.',
    faqs: [
      costQuestion('PPE supply', 'The full-overall guide rate is UGX 70,800 including VAT. Helmets have no fixed rate in the list and must be quoted against the safety specification you require.'),
      { question: 'How do I combine garments and helmets in an enquiry?', answer: 'Provide a separate helmet count and overall size breakdown, followed by the site requirements. We can then check the requested items and prepare a quotation for the complete list.' },
      { question: 'How can I check equipment suitability for a site?', answer: 'State the required protective standard and request documentation for the exact product offered. A reference photo or general product description is not proof of certification.' },
    ],
  },
  {
    slug: 'safety-helmets-overalls-kampala',
    path: '/safety-helmets-overalls-kampala',
    label: 'Safety helmets & overalls',
    h1: 'Helmets and Workwear for a Defined Crew List',
    title: 'Safety Helmets & Overalls Kampala | Print Garage',
    meta: 'Organise a helmet and overall enquiry at Print Garage in Kampala. Supply garment sizes, colours and protective requirements for a specification-based quotation.',
    intro: 'Count the people first, then identify the garments and protective headwear each role requires. A clear crew list makes the supply enquiry easier to review.',
    detail: 'The calculator names full overalls at UGX 70,800 with VAT included, but provides no fixed helmet rate. Describe the fit, colour, reflective requirements and any logo placement. Protective suitability must be checked against the standards required for your work.',
    deliverables: ['Headwear requirements for quotation', 'Overall colours and size counts', 'A combined supply brief for the crew'],
    useCases: ['Equipping a construction workforce', 'Preparing industrial visitor kit', 'Specifying garments for a new project'],
    image: { src: '/products/reflective-overalls-range.webp', alt: 'Several reflective-overall colours displayed on a rack', kind: 'photo', caption: 'A garment selection reference; the quoted product must meet your stated specification.' },
    tiers: quoteTiers(['One garment or protective-headwear brief', 'A counted team equipment list', 'A larger workwear and PPE supply enquiry']),
    tierNote: 'Check the named overall rates in the VAT-inclusive guide. Helmet specification, branding and required compliance documents need separate review.',
    faqs: [
      costQuestion('safety helmets and overalls', 'The guide includes full overalls at UGX 70,800 and two-piece reflective overalls at UGX 88,500, VAT included. Obtain a separate helmet quotation and confirm suitability for your site.'),
      { question: 'Which overall size ranges appear in the calculator?', answer: 'Small–XL and 2XL–4XL are the listed ranges. Provide a count by size so current availability can be checked for the garments you need.' },
      { question: 'How is company branding specified on workwear?', answer: 'Attach the logo and indicate its position and the number of garments. Branding is not assumed within the overall guide rate; ask for it to be included in the complete specification.' },
    ],
  },
  {
    slug: 'corporate-gifts-branding-kampala',
    path: '/corporate-gifts-branding-kampala',
    label: 'Corporate gifts',
    h1: 'A Gift Brief with the Recipient in Mind',
    title: 'Corporate Gifts & Branding Kampala | Print Garage',
    meta: 'Shape a corporate-gift enquiry with Print Garage in Kampala. Discuss recipients, useful items, presentation and branding within your planned budget.',
    intro: 'Start with who will receive the gift and why. Those two details help define useful contents, an appropriate presentation and the number of sets to request.',
    detail: 'Share the occasion, budget range, preferred items and recipient count. We can discuss the proposed contents and branding, subject to availability. Gallery sets are references, not guaranteed combinations; no fixed set price or current stock list is published.',
    deliverables: ['A contents brief for gift sets or hampers', 'Presentation and logo-treatment enquiries', 'Recipient counts and fulfilment requirements to discuss'],
    useCases: ['Acknowledging a business relationship', 'Marking a staff milestone', 'Welcoming participants or new colleagues'],
    image: { src: '/products/executive-gift-set.webp', alt: 'Gift-set reference with a blue notebook and accessories in a black box', kind: 'photo', contain: true, caption: 'An example arrangement, not a stock guarantee; confirm each item in the proposed set.' },
    tiers: quoteTiers(['A limited set of personalised gifts', 'Gifts for one staff or client group', 'A wider recipient list or recurring gifting brief']),
    tierNote: 'A corporate-gift total depends on the contents, packaging, branding and quantities agreed in your enquiry. The guide does not publish a fixed set rate.',
    faqs: [
      costQuestion('corporate gifts and branding', 'Send the recipient count, desired products, packaging preferences and budget range. Those choices form the basis of a gift quotation rather than a universal package price.'),
      { question: 'How can I propose my own gift combination?', answer: 'List the items you would like and explain the occasion and budget. We will discuss availability and the branding options for the requested combination.' },
      { question: 'Will an order exactly match a photographed set?', answer: 'Not automatically. Reference sets show ideas; each product and the final presentation must be confirmed before the order is agreed.' },
    ],
  },
  {
    slug: 'construction-company-branding-bundle',
    path: '/construction-company-branding-bundle',
    label: 'Construction company branding bundle',
    h1: 'Build a Site-Team Brief with Print Garage',
    title: 'Construction Company Branding Bundle | Print Garage',
    meta: 'Coordinate a construction-team enquiry with Print Garage in Kampala: workwear, helmets, business cards and T-shirts, with the complete mix quoted to specification.',
    intro: 'Clothing, protective headwear and company print can be planned in one site-team enquiry. Use the pack reference as a starting list, then define your actual crew needs.',
    detail: 'The Head to Toe PPE Pack has no published package total. State the crew count, garment choices and safety requirements when requesting a quotation. Do not treat individual guide rates as an approved price for the complete bundle.',
    deliverables: ['A reference quantity of 20 overalls plus 20 standard helmets', 'A 100-business-card component', 'A 50-T-shirt component with decoration to confirm'],
    useCases: ['Planning a new site workforce', 'Adding crew members to a project', 'Coordinating company presentation across kit and print'],
    image: { src: '/products/branded-overalls-rack.webp', alt: 'Hanging high-visibility workwear used as a site-team kit reference', kind: 'photo', caption: 'Workwear reference only; confirm helmets, business cards and T-shirts within the complete brief.' },
    tiers: [
      { name: 'Small', scope: 'A smaller crew list priced to specification' },
      { name: 'Medium', scope: 'Head to Toe PPE Pack reference: 20 overalls, 20 helmets, 100 cards and 50 T-shirts; quotation required' },
      { name: 'Bulk', scope: 'A specification covering several site crews' },
    ],
    tierNote: 'The package needs an agreed quotation covering stock, fit, artwork, protective requirements and timing. A fixed pack price is not published.',
    faqs: [
      costQuestion('a construction company branding bundle', 'The guide has no fixed bundle total. Submit the exact product mix, garment sizes and crew headcount so a complete package quotation can be prepared.'),
      { question: 'Can the reference pack be adapted to my headcount?', answer: 'Describe your preferred quantity of each item and the number of people involved. A different combination will need its own confirmed quotation.' },
      { question: 'Which details make a site-team brief ready for review?', answer: 'Supply the company design files, overall and T-shirt size lists, required helmet standard and checked business-card details. That information defines the kit and print components together.' },
    ],
  },
];

export const serviceByPath = new Map(servicePages.map((service) => [service.path, service]));