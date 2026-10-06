import { isNeutralDescription, isNeutralProductImage } from './brand-neutral-images';

// Generic reviewed product photos only, without inherited client marks.
export const giftExamples = [
  {
    category: 'Corporate gifts',
    title: 'Desk charging organisers',
    description: 'A pen holder and charging-pad combination for desk gifting. Confirm device compatibility with your quote.',
    image: '/products/desk-charging-organiser.webp',
    alt: 'Black and bamboo-effect desk organiser with a pen holder and phone charging pad, showing example UN Volunteers branding',
  },
  {
    category: 'Corporate gifts',
    title: 'Passport and luggage-tag sets',
    description: 'A coordinated travel-accessory set presented in a gift box.',
    image: '/products/passport-luggage-gift-set.webp',
    alt: 'Brown passport cover and matching luggage tag in a black presentation box with example BW initials',
  },
  {
    category: 'Bags & accessories',
    title: 'Everyday backpacks',
    description: 'A flap-top backpack with a front zip pocket for everyday essentials.',
    image: '/products/grey-backpack.webp',
    alt: 'Grey backpack with a flap closure, carry handle and front zip pocket',
  },
  {
    category: 'Corporate gifts',
    title: 'Two-tone travel organisers',
    description: 'Travel organisers with card slots and compartments for small essentials.',
    image: '/products/two-tone-travel-organiser.webp',
    alt: 'Open brown travel organiser with card slots and a cream-and-brown closed organiser in front',
  },
  {
    category: 'Corporate gifts',
    title: 'Notebook and pouch sets',
    description: 'A matching patterned notebook and storage pouch for stationery gifting.',
    image: '/products/notebook-pouch-set.webp',
    alt: 'Grey and cream patterned notebook alongside a matching envelope-style pouch',
  },
  {
    category: 'Corporate gifts',
    title: 'Tan travel organisers',
    description: 'A coordinated organiser style for travel documents and cards.',
    image: '/products/tan-travel-organiser.webp',
    alt: 'Open tan travel organiser with card pockets and a matching closed organiser',
  },
  {
    category: 'Bags & accessories',
    title: 'Colourful waist bags',
    description: 'Compact zip bags in a selection of colours for events and everyday use.',
    image: '/products/colourful-waist-bags.webp',
    alt: 'Waist bags in yellow, green, black, pink and blue',
  },
  {
    category: 'Corporate gifts',
    title: 'Travel adapters',
    description: 'A compact adapter example for travel gifting. Plug compatibility and electrical specifications are confirmed per order.',
    image: '/products/travel-adapter.webp',
    alt: 'Black and grey travel adapter with multiple ports and retractable plug fittings',
  },
  {
    category: 'Bags & accessories',
    title: 'Envelope-style laptop sleeves',
    description: 'A simple sleeve with a flap closure for carrying a laptop. Confirm the required device size.',
    image: '/products/laptop-sleeve.webp',
    alt: 'Grey envelope-style laptop sleeve on a wooden surface',
  },
  {
    category: 'Bags & accessories',
    title: 'Travel wash bags',
    description: 'A brown zip-compartment wash bag with a carry handle for travel essentials.',
    image: '/products/travel-wash-bag.webp',
    alt: 'Brown travel wash bag with a carry handle and two zip compartments',
  },
  {
    category: 'Corporate gifts',
    title: 'Coordinated travel gift sets',
    description: 'A presentation-box example combining a travel flask, zip pouch and small accessories.',
    image: '/products/travel-gift-set.webp',
    alt: 'Black presentation box with a travel flask, zip pouch and accessories, showing example ELI initials',
  },
].filter((item) => isNeutralDescription(item.alt) && isNeutralProductImage(item.image))
  .map((item) => ({ ...item, kind: 'photo' as const, contain: true }));