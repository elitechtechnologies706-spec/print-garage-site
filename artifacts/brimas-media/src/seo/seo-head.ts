import { SITE_URL, type ServicePage } from './service-data';
import { SITE } from '../lib/site-config';
import { categoryLabel, productFilters } from '../lib/pg-catalogue';
import hero from '../lib/print-garage-hero.json';

export const HOME_TITLE = 'Printing & Branding Services in Kampala | Print Garage';
export const HOME_META = 'Get your next brand project made at Print Garage in Kampala: shopfront signs, business print, staff clothing and promotional items tailored to your brief.';
export const PRICE_LIST_TITLE = 'Printing & Branding Price List Kampala | Print Garage';
export const PRICE_LIST_META = 'Plan a Print Garage order with our UGX, VAT-inclusive price guide. Compare print, garment and gift options, then request confirmation for your exact specification.';
export const QUOTE_TITLE = 'Request a Printing & Branding Quote | Print Garage';
export const QUOTE_META = 'Build a Print Garage brief with your item, quantity, artwork details and target date. Review it in WhatsApp before sending it for a Kampala printing or branding quote.';
export const PRODUCTS_TITLE = 'Products Catalogue Kampala | Print Garage';
export const PRODUCTS_META = 'Find a starting point for your Print Garage project. Explore mugs, bags, gift sets, workwear and eco options, with product-specific WhatsApp enquiries.';
export const GALLERY_TITLE = 'Product & Branding Gallery Kampala | Print Garage';
export const GALLERY_META = 'Explore the Print Garage visual reference gallery for product and branding ideas. These photos and concepts guide enquiries, not claims of completed client work.';
export const OG_IMAGE = `${SITE_URL}${hero.image}`;
export const MAP_URL = `https://maps.google.com/?q=${encodeURIComponent(SITE.address)}`;

export function productCategorySeo(slug: string) {
  const filter = productFilters.find((item) => item.id === slug);
  const label = filter?.label ?? categoryLabel(slug);
  if (slug === 'promotional') {
    return {
      title: 'Promotional Gifts & Branding Items in Kampala | Print Garage',
      meta: 'Browse promotional products, bags, drinkware and eco options in the Print Garage catalogue. Share your item, quantity and branding details for an enquiry.',
    };
  }
  if (slug === 'digital-media') {
    return {
      title: 'Digital & Media Services in Kampala | Print Garage',
      meta: 'Explore website and software development plus digital and media services from Print Garage. Share your project scope and requirements for an enquiry.',
    };
  }
  return {
    title: `${label} Catalogue in Kampala | Print Garage`,
    meta: `Browse ${label.toLowerCase()} examples in the Print Garage catalogue. Send your Kampala enquiry with the item, quantity and branding details to discuss a suitable specification.`,
  };
}

type SeoPage = { title: string; meta: string; path: string; indexable?: boolean };

const serviceArea = [
  { '@type': 'City', name: 'Kampala' },
  { '@type': 'Country', name: 'Uganda' },
];

export function structuredData(service?: ServicePage, page?: SeoPage) {
  if (!SITE_URL || page?.indexable === false) return [];
  const business = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_URL}/#print-garage`,
    name: SITE.name,
    description: 'Print Garage helps Kampala organisations specify business print, shopfront graphics, branded clothing and useful promotional items.',
    url: SITE_URL,
    image: OG_IMAGE,
    telephone: SITE.phone,
    contactPoint: [SITE.phone].map((telephone) => ({
      '@type': 'ContactPoint',
      telephone,
      contactType: 'customer service',
    })),
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.streetAddress,
      addressLocality: 'Kampala',
      addressCountry: 'UG',
    },
    hasMap: MAP_URL,
    areaServed: serviceArea,
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE.name,
    url: `${SITE_URL}/`,
    publisher: { '@id': business['@id'] },
    inLanguage: 'en',
  };
  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${page?.path ?? service?.path ?? '/'}#webpage`,
    url: `${SITE_URL}${page?.path ?? service?.path ?? '/'}`,
    name: page?.title ?? service?.title ?? HOME_TITLE,
    description: page?.meta ?? service?.meta ?? HOME_META,
    isPartOf: { '@id': website['@id'] },
    about: { '@id': business['@id'] },
    inLanguage: 'en',
  };

  if (!service) {
    if (page?.path === '/products' || page?.path.startsWith('/products/')) {
      const category = page.path.split('/')[2];
      const label = category
        ? productFilters.find((item) => item.id === category)?.label ?? categoryLabel(category)
        : 'Products';
      const items = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE_URL}/products` },
      ];
      if (category) items.push({ '@type': 'ListItem', position: 3, name: label, item: `${SITE_URL}${page.path}` });
      return [
        business,
        website,
        webpage,
        { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items },
      ];
    }
    return [business, website, webpage];
  }

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: service.label, item: `${SITE_URL}${service.path}` },
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  const offering = service.schemaProduct
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: service.schemaProduct.name,
        description: `${service.schemaProduct.name} guide price; final order specifications are confirmed by Print Garage.`,
        brand: { '@type': 'Brand', name: SITE.name },
        offers: {
          '@type': 'Offer',
          price: service.schemaProduct.priceUgx,
          priceCurrency: 'UGX',
          url: `${SITE_URL}${service.path}`,
          seller: { '@id': business['@id'] },
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.label,
        serviceType: service.label,
        areaServed: serviceArea,
        provider: { '@id': business['@id'] },
      };

  return [business, website, webpage, breadcrumbs, faq, offering];
}

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    const match = selector.match(/\[(name|property)="([^"]+)"\]/);
    if (match) element.setAttribute(match[1], match[2]);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export function applySeoHead(service?: ServicePage, page?: SeoPage) {
  const title = page?.title ?? service?.title ?? HOME_TITLE;
  const description = page?.meta ?? service?.meta ?? HOME_META;
  const url = `${SITE_URL}${page?.path ?? service?.path ?? '/'}`;
  document.title = title;
  setMeta('meta[name="robots"]', 'content', !SITE_URL || page?.indexable === false ? 'noindex, nofollow' : 'index, follow');
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  if (SITE_URL) setMeta('meta[property="og:url"]', 'content', url);
  else document.querySelector('meta[property="og:url"]')?.remove();
  setMeta('meta[property="og:image"]', 'content', OG_IMAGE);
  setMeta('meta[property="og:type"]', 'content', 'website');
  setMeta('meta[property="og:site_name"]', 'content', SITE.name);
  setMeta('meta[property="og:image:alt"]', 'content', 'Illustration of printing and branding in Kampala');
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  setMeta('meta[name="twitter:image"]', 'content', OG_IMAGE);
  setMeta('meta[name="twitter:image:alt"]', 'content', 'Illustration of printing and branding in Kampala');
  let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (SITE_URL && !canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  if (SITE_URL && canonical) canonical.href = url;
  else canonical?.remove();
  let schema = document.getElementById('print-garage-structured-data');
  if (!schema) {
    schema = document.createElement('script');
    schema.id = 'print-garage-structured-data';
    schema.setAttribute('type', 'application/ld+json');
    document.head.appendChild(schema);
  }
  schema.textContent = JSON.stringify(structuredData(service, page));
}