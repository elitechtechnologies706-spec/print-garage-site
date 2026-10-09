import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Search } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { SiteMenu } from '../components/SiteMenu';
import { Brand } from '../components/Brand';
import { SITE } from '../lib/site-config';
import { CALL } from '../lib/catalog';
import { formatUgx, whatsappHref } from '../lib/catalog';
import { priceListSections, type PriceListItem } from '../lib/price-list';
import './price-list.css';

function displayPrice(item: PriceListItem) {
  if (item.price === null) return 'Request a quote';
  if (typeof item.price === 'number') return formatUgx(item.price);
  return `${formatUgx(item.price[0])}–${formatUgx(item.price[1]).replace('UGX ', '')}`;
}

export function PriceList() {
  const [search, setSearch] = useState('');
  const sections = useMemo(() => priceListSections.map((section) => ({
    ...section,
    items: section.items.filter((item) => `${item.name} ${section.title}`.toLowerCase().includes(search.trim().toLowerCase())),
  })).filter((section) => section.items.length > 0), [search]);

  return (
    <div className="price-page">
      <header className="price-page-header">
        <div className="shell price-page-header-inner">
          <a href="/" className="price-page-brand" aria-label="Print Garage home"><Brand /></a>
          <nav aria-label="Price list navigation" className="price-page-toplinks">
            <a href="/"><ArrowLeft size={16} aria-hidden="true" /> Home</a>
            <a href="/request-a-quote">Request a quote <ArrowUpRight size={16} aria-hidden="true" /></a>
          </nav>
          <SiteMenu currentPath="/price-list" />
        </div>
      </header>
      <main>
        <section className="price-page-hero">
          <div className="shell">
            <span className="price-page-eyebrow">Print Garage / Kampala</span>
            <h1>Plan your Print Garage order<span>.</span></h1>
            <p>Use these <strong>UGX guide rates, including VAT</strong>, to explore your options. Your final quotation depends on the exact item, quantities, branding requirements and current availability.</p>
            <a href={whatsappHref('Hello Print Garage, please help me confirm an item and its current price.')} target="_blank" rel="noreferrer" className="price-page-hero-link"><FaWhatsapp size={18} aria-hidden="true" /> Ask about an item <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </section>

        <div className="shell price-page-body">
          <div className="price-page-intro">
            <div>
              <span className="price-page-eyebrow">Prices / 001—062</span>
              <h2>Compare items for your brief.</h2>
              <p>Items marked “Request a quote” have no published fixed rate. For ranges, ask which option applies to your order. The outdoor banner unit is <strong>per metre</strong>; it must not be read as a square-metre price.</p>
            </div>
            <label className="price-page-search">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Search prices</span>
              <input type="search" placeholder="Search products…" value={search} onChange={(event) => setSearch(event.target.value)} data-testid="input-price-search" />
            </label>
          </div>
          {sections.length === 0 && <p className="price-page-empty" role="status">No products match “{search}”. Try another search or ask Print Garage for a quote.</p>}
          {sections.map((section) => (
            <section className="price-page-section" key={section.title} aria-label={section.title}>
              <div className="price-page-section-head"><h2>{section.title}</h2><span>{section.items.length} items</span></div>
              <div className="price-page-table-head" aria-hidden="true"><span>Product</span><span>VAT-inclusive price</span><span>Enquire</span></div>
              <div className="price-page-items">
                {section.items.map((item) => {
                  const price = displayPrice(item);
                  const message = [
                    `Hello Print Garage, I would like a quote for ${item.name} (item ${item.code}).`,
                    item.price === null ? 'Please confirm the price based on my measurements/specification.' : `The website lists ${price} including VAT. Please confirm the final price and what is included.`,
                  ].join('\n');
                  return (
                    <div className="price-page-item" key={item.code} data-testid={`price-item-${item.code}`}>
                      <div className="price-page-item-name"><span className="price-page-code">{item.code}</span><div><strong>{item.name}</strong>{item.note && <small>{item.note}</small>}</div></div>
                      <span className={`price-page-value${item.price === null ? ' price-page-value--quote' : ''}`}>{price}</span>
                      <a href={whatsappHref(message)} target="_blank" rel="noreferrer" aria-label={`Enquire about ${item.name} on WhatsApp`} data-testid={`link-price-enquire-${item.code}`}><FaWhatsapp size={18} aria-hidden="true" /> Enquire</a>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
          <div className="price-page-notice">
            <strong>Need something different?</strong>
            <p>For business cards, helmets, custom branding or a Head to Toe PPE Pack, ask Print Garage to price the complete specification. This guide does not publish fixed totals for those jobs.</p>
            <a href="/request-a-quote">Request a quote <ArrowUpRight size={17} aria-hidden="true" /></a>
          </div>
        </div>
      </main>
      <footer className="price-page-footer"><div className="shell">Print Garage · {SITE.address} <a href={CALL}>{SITE.displayPhone}</a></div></footer>
    </div>
  );
}