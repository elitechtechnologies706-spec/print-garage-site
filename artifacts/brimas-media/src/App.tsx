import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Calculator, Check, Factory, Phone } from 'lucide-react';
import { FaClock, FaEnvelope, FaLocationDot, FaWhatsapp } from 'react-icons/fa6';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecordView } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { CALL, formatUgx, formatUsd, quoteOptions, whatsappHref, type QuoteKey } from '@/lib/catalog';
import { LocationSection, MiniMap } from '@/seo/Location';
import { servicePages } from '@/seo/service-data';
import { SiteMenu } from '@/components/SiteMenu';
import { Gallery } from '@/components/Gallery';
import { Brand } from '@/components/Brand';
import { SITE } from '@/lib/site-config';
import { isNeutralProductImage } from '@/lib/brand-neutral-images';
import { giftExamples } from '@/lib/gift-examples';
import { productExamples } from '@/lib/product-examples';
import { productCategories } from '@/lib/product-navigation';
import { CatalogueImage, useImageBase } from '@/components/CatalogueImage';
import { resolveImageSource } from '@/lib/image-source';

const queryClient = new QueryClient();
type Currency = 'UGX' | 'USD';

const turnaroundOptions = [
  ['01', 'SAME DAY', 'Depending on the job'],
  ['02', '24 HOURS', 'Depending on quantity and artwork'],
  ['03', '2-3 WORKING DAYS', 'Depending on specifications'],
];

type ShowcaseItem = {
  category: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  kind: 'photo' | 'mockup';
  portrait?: boolean;
  contain?: boolean;
};

const showcaseItems: ShowcaseItem[] = [
  {
    category: 'Workwear',
    title: 'Protective footwear',
    description: 'Confirm sizes and the required site standard before ordering.',
    image: '/products/ppe-footwear.jpg',
    alt: 'Protective work boots',
    kind: 'photo' as const,
    contain: true,
  },
  ...productExamples,
  ...giftExamples,
].filter((item) => isNeutralProductImage(item.image));

const showcaseServicePaths: Record<string, string> = {
  Workwear: '/ppe-supplier-kampala-uganda',
  Packaging: '/corporate-gifts-branding-kampala',
  'Corporate gifts': '/corporate-gifts-branding-kampala',
  'Bags & accessories': '/corporate-gifts-branding-kampala',
  'Garment branding': '/t-shirt-printing-embroidery-kampala',
  Signage: '/large-format-printing-industrial-area',
  'Event displays': '/large-format-printing-industrial-area',
  'Vehicle branding': '/large-format-printing-industrial-area',
  'Promotional items': '/promotional-items-mugs-pens-kampala',
};

function HomeServiceLinks() {
  return (
    <nav className="local-services-grid" aria-label="Kampala service pages">
      {servicePages.map((service, index) => (
        <a href={service.path} key={service.slug} data-testid={`link-home-service-${service.slug}`}>
          <span className="mono">{String(index + 1).padStart(2, '0')} / KAMPALA</span>
          <strong>{service.label}</strong>
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </nav>
  );
}

function AppContent() {
  const imageBase = useImageBase();
  const { mutate: recordView } = useRecordView();
  const exchange = useExchangeRate();
  const [currency, setCurrency] = useState<Currency>('UGX');
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [productCategory, setProductCategory] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [product, setProduct] = useState<QuoteKey>('tshirt');
  const [quantity, setQuantity] = useState('10');
  const [size, setSize] = useState(quoteOptions.tshirt.sizes[0]);
  const [material, setMaterial] = useState(quoteOptions.tshirt.materials[0]);
  const [finish, setFinish] = useState(quoteOptions.tshirt.finishes[0]);

  useEffect(() => {
    recordView(undefined, { onError: (error) => console.error('Could not record homepage view', error) });
  }, [recordView]);

  useEffect(() => {
    const scrollToSection = () => {
      if (window.location.hash) {
        const hash = window.location.hash.slice(1);
        const category = productCategories.find((item) => `products-${item.id}` === hash);
        if (category || hash === 'showcase') {
          setProductCategory(category?.id ?? 'all');
          setProductSearch('');
          document.getElementById('showcase')?.scrollIntoView();
        } else {
          document.getElementById(hash)?.scrollIntoView();
        }
      }
    };
    const frame = requestAnimationFrame(scrollToSection);
    window.addEventListener('hashchange', scrollToSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', scrollToSection);
    };
  }, []);

  const activeCategory = productCategories.find((category) => category.id === productCategory);
  const searchText = productSearch.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const visibleProducts = showcaseItems.filter((item) =>
    (!activeCategory || item.category === activeCategory.category)
    && `${item.title} ${item.category} ${item.description}`.toLowerCase().replace(/[^a-z0-9]+/g, '').includes(searchText));

  const selected = quoteOptions[product];
  const qty = Math.max(1, Number(quantity) || 1);
  const ugxTotal = useMemo(() => selected.price === null ? null : qty * selected.price, [qty, selected.price]);
  const usdTotal = ugxTotal === null ? null : ugxTotal / exchange.rate;

  const setProductAndReset = (value: QuoteKey) => {
    setProduct(value);
    setSize(quoteOptions[value].sizes[0]);
    setMaterial(quoteOptions[value].materials[0]);
    setFinish(quoteOptions[value].finishes[0]);
  };

  const quoteMessage = [
    'Hello Print Garage, I need a quote.',
    `Product: ${selected.label} (${selected.category})`,
    `Quantity: ${qty} ${selected.unit}`,
    `Size: ${size}`,
    `Material: ${material}`,
    `Finish: ${finish}`,
    ugxTotal === null ? 'Price: please quote this item; no matching current list price.' : `VAT-inclusive list estimate: ${formatUgx(ugxTotal)} / indicative ${formatUsd(usdTotal!)}`,
    ...(ugxTotal === null ? [] : [`Rate used: 1 USD = ${formatUgx(exchange.rate)}${exchange.date ? ` (${exchange.date})` : ' (guide rate)'}`]),
    'Please confirm the final quote from my exact specs.',
  ].join('\n');
  const generalMessage = 'Hello Print Garage, I would like to discuss a printing or branding job. Please help me with the next steps.';
  const packMessage = [
    'Hello Print Garage, I want the Head to Toe PPE Pack.',
    'Pack: 20 overalls, 20 helmets, 100 cards, 50 T-shirts.',
    'Please quote the complete package. It is not priced as a package in the current list.',
    'Please confirm availability and delivery timing.',
  ].join('\n');

  return (
    <div className="print-garage-page">
      <header className="topbar">
        <div className="shell topbar-inner">
          <a href="#top" aria-label="Print Garage home" data-testid="link-home"><Brand /></a>
          <div className="header-tools">
            <span className="header-currency" role="group" aria-label="Quote currency">
              <button type="button" className={currency === 'UGX' ? 'active' : ''} aria-pressed={currency === 'UGX'} onClick={() => setCurrency('UGX')} data-testid="header-currency-ugx">UGX</button>
              <button type="button" className={currency === 'USD' ? 'active' : ''} aria-pressed={currency === 'USD'} onClick={() => setCurrency('USD')} data-testid="header-currency-usd">USD</button>
            </span>
            <a className="header-cta" href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer" aria-label="WhatsApp Print Garage" data-testid="link-header-whatsapp"><FaWhatsapp size={17} aria-hidden="true" /><span className="header-cta-label">WhatsApp</span></a>
            <SiteMenu home />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <CatalogueImage className="hero-background" src={heroImageFailed ? '/products/notebooks-pens.webp' : '/hero/printing-branding.webp'} alt={heroImageFailed ? 'Notebooks and pens for business stationery' : 'AI-generated illustration of a printing and branding workshop with a wide-format printer, printed stationery, T-shirt and mug'} loading="eager" fetchPriority="high" decoding="async" sizes="100vw" onError={() => setHeroImageFailed(true)} />
          <div className="shell hero-grid">
            <div className="hero-copy">
              <div className="hero-kicker reveal">Walk in. Bring your idea. Get it produced.</div>
              <h1 className="reveal delay-1">PRINTING &amp; BRANDING SERVICES IN KAMPALA</h1>
              <p className="hero-intro reveal delay-2">From everyday printing to branded clothing, promotional products, corporate gifts, PPE and signage — Print Garage helps you get your branding produced and ready.</p>
              <div className="hero-actions reveal delay-3">
                <a className="button button-primary" href={SITE.whatsapp} target="_blank" rel="noreferrer" data-testid="button-hero-whatsapp"><FaWhatsapp size={17} aria-hidden="true" /> WHATSAPP US</a>
                <a className="button button-outline" href="#contact" data-testid="button-hero-visit">VISIT PRINT GARAGE <ArrowUpRight size={17} aria-hidden="true" /></a>
              </div>
              <a className="hero-price-link" href="/price-list" data-testid="button-hero-price-list"><Calculator size={15} aria-hidden="true" /> See full price list</a>
              <div className="hero-meta reveal delay-3">
                 <div className="meta-item"><b>Walk-in service in Kampala</b><span>Peacock Building · 2nd Floor</span></div>
                 <div className="meta-item"><b>Confirm your deadline</b><span>Turnaround depends on job, quantity and specs.</span></div>
              </div>
            </div>
          </div>
        </section>

        <div className="strip" aria-label="Print Garage services">
          <div className="strip-track">
            {[0, 1].map((copy) => <span key={copy}>Walk-in printing · branded clothing · promotional products · corporate gifts · PPE · packaging · signage · </span>)}
          </div>
        </div>

        <section className="section services" id="services">
          <div className="shell">
            <div className="section-heading">
              <div className="eyebrow">Printing, branding and more</div>
              <h2>Printing and branding in Kampala, Uganda.</h2>
              <p>A look at the products behind our services — printed pieces, branded items, teamwear and site gear. Explore a service to tell us what you need.</p>
            </div>
            <div className="service-grid">
              <a className="service-card" href="/printing-services-kampala" data-testid="link-service-printing">
                <div className="service-card-media"><CatalogueImage src="/products/notebooks-pens.webp" alt="Notebooks and pens for business stationery" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">01 / PAPER</span><span className="service-arrow" aria-hidden="true">↗</span><h3>Printing</h3><p>Business cards, flyers, brochures and everyday business printing.</p><span className="service-card-cta">Explore printing <span aria-hidden="true">↗</span></span></div>
              </a>
              <a className="service-card" href="/large-format-printing-industrial-area" data-testid="link-service-large-format">
                <div className="service-card-media service-card-media--contain"><CatalogueImage src="/products/pharmacy-signage.webp" alt="Pharmacy shopfront with an example signage concept" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">02 / SCALE</span><span className="service-arrow" aria-hidden="true">↗</span><h3>Large Format &amp; Signage</h3><p>Signs and banners made to be seen from across the road.</p><span className="service-card-cta">Explore large format <span aria-hidden="true">↗</span></span></div>
              </a>
              <a className="service-card" href="/promotional-items-mugs-pens-kampala" data-testid="link-service-promotional">
                <div className="service-card-media service-card-media--contain"><CatalogueImage src="/products/promotional-pens.webp" alt="Promotional pen options" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">03 / GIVE</span><span className="service-arrow" aria-hidden="true">↗</span><h3>Promotional Products</h3><p>Mugs, water bottles, notebooks, pens, key-rings and other branded items.</p><span className="service-card-cta">Explore promotional products <span aria-hidden="true">↗</span></span></div>
              </a>
              <a className="service-card" href="/t-shirt-printing-embroidery-kampala" data-testid="link-service-textiles">
                <div className="service-card-media service-card-media--contain"><CatalogueImage src="/products/printed-white-tshirt.webp" alt="White T-shirt with an example printed design" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">04 / WEAR</span><span className="service-arrow" aria-hidden="true">↗</span><h3>Branded Clothing</h3><p>Branded T-shirts and workwear.</p><span className="service-card-cta">Explore teamwear <span aria-hidden="true">↗</span></span></div>
              </a>
              <a className="service-card" href="/ppe-supplier-kampala-uganda" data-testid="link-service-ppe">
                <div className="service-card-media service-card-media--contain"><CatalogueImage src="/products/ppe-footwear.jpg" alt="Protective work boots" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">05 / PROTECT</span><span className="service-arrow" aria-hidden="true">↗</span><h3>PPE &amp; Safety</h3><p>Helmets, coveralls, safety shoes, reflective vests, gloves, protective glasses.</p><span className="service-card-cta">Explore PPE <span aria-hidden="true">↗</span></span></div>
              </a>
              <a className="service-card" href="/corporate-gifts-branding-kampala" data-testid="link-service-gifts">
                <div className="service-card-media service-card-media--contain"><CatalogueImage src="/products/executive-gift-set.webp" alt="Corporate gift presentation set" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">06 / GIFT</span><span className="service-arrow" aria-hidden="true">↗</span><h3>Corporate Gifts</h3><p>Useful, coordinated gifts with branding and presentation confirmed for your order.</p><span className="service-card-cta">Explore corporate gifts <span aria-hidden="true">↗</span></span></div>
              </a>
              <a className="service-card" href="/corporate-gifts-branding-kampala#guide-prices" data-testid="link-service-packaging">
                <div className="service-card-media service-card-media--contain"><CatalogueImage src="/products/executive-gift-set.webp" alt="Presentation box packaging example" loading="lazy" decoding="async" /></div>
                <div className="service-card-content"><span className="service-number">07 / PACKAGE</span><span className="service-arrow" aria-hidden="true">↗</span><h3>Packaging</h3><p>Bring your packaging idea, dimensions and quantity for a job-specific quote.</p><span className="service-card-cta">Discuss packaging <span aria-hidden="true">↗</span></span></div>
              </a>
            </div>
          </div>
        </section>

        <Gallery />

        <section className="section showcase" id="showcase">
          <div className="shell">
            {productCategories.map((category) => <span className="product-category-anchor" id={`products-${category.id}`} key={category.id} aria-hidden="true" />)}
            <div className="section-heading">
              <div className="eyebrow">Product examples</div>
              <h2>Workwear, branded products and corporate gifts.</h2>
              <p>Explore product photos and mockups for workwear, PPE, packaging, corporate gifts and travel accessories. Bring your brief and Print Garage can confirm the right options for your order.</p>
              <a className="showcase-service-link" href="/gallery">See the product gallery <ArrowUpRight size={15} aria-hidden="true" /></a>
            </div>
            <div className="catalogue-filters">
              <label htmlFor="product-search">Search products<input id="product-search" type="search" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search mugs, T-shirts, notebooks…" /></label>
              <label htmlFor="product-category">Product category<select id="product-category" value={productCategory} onChange={(event) => {
                setProductCategory(event.target.value);
                window.history.replaceState(null, '', event.target.value === 'all' ? '#showcase' : `#products-${event.target.value}`);
              }}><option value="all">All products</option>{productCategories.map((category) => <option value={category.id} key={category.id}>{category.label}</option>)}</select></label>
              <button className="button button-dark" type="button" onClick={() => {
                setProductCategory('all'); setProductSearch('');
                window.history.replaceState(null, '', '#showcase');
              }}>Reset filters</button>
            </div>
            <p className="catalogue-results" role="status">Showing {visibleProducts.length} of {showcaseItems.length} product examples{activeCategory ? ` · ${activeCategory.label}` : ''}</p>
            {visibleProducts.length === 0 && <p className="catalogue-empty">No matching products. Try another search or reset the filters to see all examples.</p>}
            <div className="showcase-grid">
              {visibleProducts.map((item, index) => (
                <article className="showcase-card" key={item.title}>
                  <div
                    className={`showcase-media${item.kind === 'photo' ? ' showcase-media--photo' : ''}${item.portrait ? ' showcase-media--portrait' : ''}${item.contain ? ' showcase-media--contained' : ''}`}
                    style={item.portrait ? { backgroundImage: `url(${resolveImageSource(item.image, imageBase)})` } : undefined}
                  >
                    <span className="showcase-index">{String(index + 1).padStart(2, '0')}</span>
                    <span className="showcase-format">{item.kind === 'photo' ? 'Product photo' : 'Mockup'}</span>
                    <CatalogueImage src={item.image} alt={item.alt} loading="lazy" decoding="async" />
                  </div>
                  <div className="showcase-copy">
                    <span>{item.category}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <a className="showcase-service-link" href={showcaseServicePaths[item.category]}>Explore the service <ArrowUpRight size={15} aria-hidden="true" /></a>
                  </div>
                </article>
              ))}
            </div>
            <p className="showcase-note">Catalogue images are product examples. Any logos or initials shown are example branding, not client endorsements. Contents, materials, specifications and current availability are confirmed with your quotation.</p>
          </div>
        </section>

        <section className="section local-services" id="local-services">
          <div className="shell">
            <div className="section-heading">
              <div className="eyebrow">Explore the range</div>
              <h2>Explore our printing and branding services.</h2>
              <p>Read the details for each Kampala service, check any available guide rates and send a brief directly to the team.</p>
            </div>
            <HomeServiceLinks />
          </div>
        </section>

        <section className="section proof" id="proof">
          <div className="shell">
            <div className="section-heading">
              <div className="eyebrow">About Us · Print Garage</div>
              <h2>YOUR LOCAL PRINTING &amp; BRANDING PARTNER IN KAMPALA</h2>
              <p>Walk in with an idea, artwork or a sample. We help individuals and businesses arrange practical printing, branded clothing, gifts, PPE, packaging and signage.</p>
              <p>Need it soon? Tell us your deadline before ordering. We’ll confirm the job specifications and available turnaround with you.</p>
            </div>
            <div className="machine-layout">
              <h3>TURNAROUND OPTIONS</h3>
              <div className="machine-list" aria-label="Turnaround options">
                {turnaroundOptions.map(([number, name, purpose]) => <div className="machine-row" key={name}><span className="machine-mark">{number}</span><span><strong>{name}</strong><small>{purpose}</small></span><span className="machine-rate">CONFIRM</span></div>)}
              </div>
              <aside className="proof-tile">
                <h3>Bring your idea.<br />Confirm your deadline.</h3>
                <p>Turnaround depends on the job, quantity, artwork and specifications. Confirm your deadline with us.</p>
                <span className="mono">Peacock Building / 2nd Floor / Kampala</span>
              </aside>
            </div>
          </div>
        </section>

        <section className="section quote-section" id="quote">
          <div className="shell quote-layout">
            <div className="quote-intro">
              <div className="eyebrow">The 2-minute brief</div>
              <h2>Price the first move.</h2>
              <p>Choose an item from the current VAT-inclusive list, add your specs and get a guide estimate in UGX or USD. For other products, ask the team for a quote.</p>
              <p className="mono" style={{ fontSize: '10px', marginTop: '26px' }}>VAT included · branding, dimensions and final quote confirmed from your specs</p>
            </div>
            <form className="quote-form" onSubmit={(event) => event.preventDefault()} aria-label="Instant quote calculator">
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="quote-product">What are we making?</label>
                  <select id="quote-product" value={product} onChange={(event) => setProductAndReset(event.target.value as QuoteKey)} data-testid="select-quote-product">
                    {(Object.entries(quoteOptions) as [QuoteKey, typeof quoteOptions[QuoteKey]][]).map(([key, option]) => <option value={key} key={key}>{option.category} · {option.label}</option>)}
                  </select>
                </div>
                <div className="field">
                    <label htmlFor="quote-quantity">Quantity ({selected.unit})</label>
                  <input id="quote-quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} data-testid="input-quote-quantity" />
                </div>
                <div className="field">
                  <label htmlFor="quote-size">Size / dimensions</label>
                  <select id="quote-size" value={size} onChange={(event) => setSize(event.target.value)} data-testid="select-quote-size">{selected.sizes.map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                <div className="field">
                  <label htmlFor="quote-material">Material</label>
                  <select id="quote-material" value={material} onChange={(event) => setMaterial(event.target.value)} data-testid="select-quote-material">{selected.materials.map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                <div className="field">
                  <label htmlFor="quote-finish">Finish</label>
                  <select id="quote-finish" value={finish} onChange={(event) => setFinish(event.target.value)} data-testid="select-quote-finish">{selected.finishes.map((item) => <option key={item}>{item}</option>)}</select>
                </div>
                <div className="field">
                  <label>Guide rate</label>
                  <div style={{ minHeight: '44px', display: 'flex', alignItems: 'center', fontFamily: 'var(--app-font-mono)', fontSize: '11px' }}>{selected.guide}</div>
                </div>
              </div>
              <div className="quote-total">
                <div className="quote-total-label"><span>Live estimate</span><span className="currency-toggle"><button type="button" className={currency === 'UGX' ? 'active' : ''} onClick={() => setCurrency('UGX')} data-testid="button-currency-ugx">UGX</button><button type="button" className={currency === 'USD' ? 'active' : ''} onClick={() => setCurrency('USD')} data-testid="button-currency-usd">USD</button></span></div>
                <strong className="total-primary" data-testid="text-quote-total">{ugxTotal === null ? 'Request a quote' : currency === 'UGX' ? formatUgx(ugxTotal) : formatUsd(usdTotal!)}</strong>
                <span className="total-secondary" data-testid="text-quote-secondary">{ugxTotal === null ? 'No matching price in the current list' : `${currency === 'UGX' ? formatUsd(usdTotal!) : formatUgx(ugxTotal)} · VAT-inclusive guide`}</span>
              </div>
              <p className="quote-note">List prices include VAT. Branding, finish, dimensions and delivery are not assumed included; final pricing is confirmed from your exact specs. <a href="/price-list">View all listed prices</a>.</p>
              <div className="quote-actions">
                <a className="button button-dark" href={whatsappHref(quoteMessage)} target="_blank" rel="noreferrer" data-testid="button-quote-whatsapp"><FaWhatsapp size={18} aria-hidden="true" /> Send to WhatsApp</a>
                <a className="button button-primary" href={CALL} data-testid="button-quote-call"><Phone size={16} /> Call Print Garage</a>
              </div>
              <p className="rate-line" data-testid="text-exchange-rate">1 USD = {formatUgx(exchange.rate)} · {exchange.date ? `${exchange.date} · ` : ''}{exchange.source}{exchange.loading ? ' · checking live rate' : ''}</p>
            </form>
          </div>
        </section>

        <section className="section pack" id="pack">
          <div className="shell pack-layout">
              <div className="pack-art" aria-label="Head to Toe PPE Pack graphic">
              <span className="mono">Field-ready / team-sized</span>
              <h3>BUILD<br />READY.</h3>
                <span className="pack-chip">CUSTOM<br />QUOTE</span>
            </div>
            <div className="pack-copy">
              <div className="eyebrow">A shortcut for site teams</div>
              <h2>The Head to Toe PPE Pack.</h2>
              <p>One order to outfit a working crew and put your name in the right places. The current list does not include a package total; ask for a quote on the complete specification.</p>
              <div className="pack-list"><div><Check size={13} /> 20 overalls</div><div><Check size={13} /> 20 helmets</div><div><Check size={13} /> 100 cards</div><div><Check size={13} /> 50 T-shirts</div></div>
              <strong className="pack-price" data-testid="text-pack-price">Request a quote</strong>
              <a className="button button-primary" style={{ marginTop: '22px', width: 'fit-content' }} href={whatsappHref(packMessage)} target="_blank" rel="noreferrer" data-testid="button-pack-whatsapp"><FaWhatsapp size={18} aria-hidden="true" /> Ask about the pack <ArrowUpRight size={15} /></a>
            </div>
          </div>
        </section>

        <section className="section process" id="process">
          <div className="shell">
            <div className="section-heading">
              <div className="eyebrow">How the handoff works</div>
              <h2>Less chasing. More making.</h2>
            </div>
            <div className="process-grid">
              <div className="process-step"><span className="step-num">01 / BRIEF</span><div><h3>Send the job.</h3><p>WhatsApp a reference, a quantity, or simply tell us what the team needs.</p></div></div>
              <div className="process-step"><span className="step-num">02 / CONFIRM</span><div><h3>Agree the details.</h3><p>Confirm quantity, artwork, specifications, price and turnaround before the job starts.</p></div></div>
              <div className="process-step"><span className="step-num">03 / COLLECT</span><div><h3>Get your order.</h3><p>Collect at Peacock Building, 2nd Floor, or discuss delivery arrangements with us.</p></div></div>
            </div>
          </div>
        </section>

        <section className="section contact" id="contact">
          <div className="shell">
            <div className="section-heading">
              <div className="eyebrow">Come through</div>
              <h2>Walk in. Call. WhatsApp your idea.</h2>
            </div>
            <div className="contact-grid">
              <div className="contact-block"><FaLocationDot size={19} color={SITE.primary} aria-hidden="true" /><h3>Visit Print Garage</h3><p>Peacock Building, 2nd Floor<br />Kampala, Uganda</p></div>
              <div className="contact-block"><FaClock size={19} color={SITE.secondary} aria-hidden="true" /><h3>Plan your visit</h3><p>Call or WhatsApp to confirm opening hours and your deadline before travelling.</p></div>
              <div className="contact-block"><FaEnvelope size={19} color={SITE.primary} aria-hidden="true" /><h3>Print Garage · Talk to a person</h3><a href={CALL} data-testid="link-mobile-phone">{SITE.displayPhone}</a><a href={`mailto:${SITE.email}`} data-testid="link-email-primary">{SITE.email}</a></div>
              <div className="contact-cta"><div><Factory size={21} color="hsl(0 0% 100%)" /><h3>Bring your idea to Print Garage</h3><p>Walk in with a brief. We’ll help you confirm the next step.</p></div><a className="button button-primary" href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer" data-testid="button-contact-whatsapp"><FaWhatsapp size={19} aria-hidden="true" /> WhatsApp {SITE.displayPhone}</a></div>
            </div>
          </div>
        </section>
        <div className="seo-home-location"><LocationSection /></div>
      </main>

      <footer className="footer">
        <div className="footer-map seo-home-location"><MiniMap /></div>
        <div className="shell footer-inner">
          <Brand />
          <div className="footer-meta">
            <small>© {new Date().getFullYear()} Print Garage · {SITE.address}</small>
          </div>
        </div>
      </footer>

      <div className="mobile-cta" aria-label="Quick contact">
        <a href={CALL} data-testid="mobile-link-call"><Phone size={15} /> Call Print Garage</a>
        <a href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer" data-testid="mobile-link-whatsapp"><FaWhatsapp size={17} aria-hidden="true" /> WhatsApp</a>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;