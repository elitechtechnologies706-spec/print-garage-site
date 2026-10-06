import { isNeutralDescription, isNeutralProductImage } from './brand-neutral-images';

// Retain generic reviewed product examples without inherited client marks.
const example = (category: string, title: string, description: string, slug: string, alt: string, kind: 'photo' | 'mockup' = 'photo') => ({
  category, title, description, image: `/products/${slug}.webp`, alt, kind, contain: true,
});

export const productExamples = [
  example('Corporate gifts', 'Notebooks & pens', 'Coordinated stationery for office and event gifting.', 'notebooks-pens', 'Blue, yellow and red notebooks stacked beside a black pen'),
  example('Garment branding', 'Printed hoodies', 'Hooded garments with an example printed design.', 'pink-hoodie', 'Pink hooded jumper with a black printed design', 'mockup'),
  example('Signage', 'Shopfront signage', 'A shopfront sign concept showing business visibility.', 'pharmacy-signage', 'Pharmacy shopfront with a green and white sign concept', 'mockup'),
  example('Garment branding', 'Printed T-shirts', 'Artwork and garment choices confirmed with your quote.', 'printed-white-tshirt', 'White T-shirt with a colourful printed figure design', 'mockup'),
  example('Event displays', 'Feather flags', 'Branded flag concepts for outdoor displays.', 'feather-flags', 'Red and purple feather flags with example printed artwork', 'mockup'),
  example('Event displays', 'Branded gazebos', 'Event shelter branding with specifications agreed per order.', 'branded-gazebo', 'White gazebo with example branding on the canopy', 'mockup'),
  example('Corporate gifts', 'Mug gift sets', 'A coordinated presentation box with drinkware and accessories.', 'mug-gift-set', 'Presentation box containing a mug, bottle and small accessories'),
  example('Promotional items', 'Wireless mice', 'Practical desk accessories for promotional gifting.', 'wireless-mice', 'Black, red and beige wireless computer mice'),
  example('Promotional items', 'Promotional pens', 'Pen styles and branding confirmed before production.', 'promotional-pens', 'Selection of black promotional pens'),
  example('Corporate gifts', 'Executive gift sets', 'Coordinated stationery and accessories in a presentation box.', 'executive-gift-set', 'Black gift box with a blue notebook and matching accessories'),
  example('Promotional items', 'Tassel keyrings', 'Colourful keyring options for small promotional gifts.', 'tassel-keyrings', 'Circular keyrings with tassels in several colours'),
  example('Garment branding', 'Navy polo shirts', 'A navy and lime garment design example.', 'navy-polo', 'Navy polo shirt with lime green collar and side panels', 'mockup'),
  example('Garment branding', 'Green polo shirts', 'A contrasting polo shirt design for teamwear enquiries.', 'green-polo', 'Lime green polo shirt with black collar and side panels', 'mockup'),
  example('Promotional items', 'Round branded keyrings', 'Example artwork on circular promotional keyrings.', 'round-keyrings', 'Two round keyrings with yellow and blue example branding'),
  example('Vehicle branding', 'Vehicle graphics', 'A vehicle-wrap concept with coordinated graphics.', 'blue-vehicle-branding', 'Blue minivan with an example colourful vehicle branding design', 'mockup'),
  example('Promotional items', 'Reusable drinkware', 'Travel-cup styles, capacity and branding are quoted separately.', 'branded-drinkware', 'Grey and brown reusable travel cups with example Absa logos'),
  example('Bags & accessories', 'Running armbands', 'Phone-holder accessories for sport and promotional enquiries.', 'running-armband', 'Black running phone armband with an example Absa logo'),
].filter((item) => isNeutralDescription(item.alt) && isNeutralProductImage(item.image));