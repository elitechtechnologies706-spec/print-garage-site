import { ArrowRight, ArrowUpRight, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { CALL, WHATSAPP, whatsappHref } from '../lib/catalog';
import { servicePages, SITE_URL, contextualServices } from './service-data';
import type { ServicePage } from './service-data';
import { LocationSection, MiniMap } from './Location';
import { SiteMenu } from '../components/SiteMenu';
import { Brand } from '../components/Brand';
import { SITE } from '../lib/site-config';
import { quotePageHref } from '../pages/RequestQuote';
import { CatalogueImage } from '../components/CatalogueImage';
import './landing.css';

export function LandingPage({ service }: { service: ServicePage }) {
  const related = servicePages.filter((item) => item.slug !== service.slug);
  const message = [
    'Hello Print Garage, I would like to ask about a service.',
    `Service: ${service.label}`,
    `Page: ${SITE_URL.replace(/\/$/, '')}${service.path}`,
    'Please tell me what details you need to discuss this job.',
  ].join('\n');
  const quoteUrl = whatsappHref(message);
  const requestUrl = quotePageHref(service.slug);
  return (
    <div className="seo-page">
      <header className="seo-top">
        <div className="seo-wrap seo-top-inner">
          <a className="seo-logo" href="/" aria-label="Print Garage homepage" data-testid="link-seo-home">
            <Brand />
          </a>
          <div className="seo-top-right">
            <span className="seo-top-address seo-mono">Peacock Building / 2nd Floor / Kampala</span>
            <a className="seo-top-cta seo-mono" href={quoteUrl} target="_blank" rel="noopener noreferrer" data-testid="link-seo-header-whatsapp"><FaWhatsapp size={17} aria-hidden="true" /> WhatsApp us</a>
            <SiteMenu currentPath={service.path} />
          </div>
        </div>
      </header>

      <main>
        <section className="seo-hero" aria-labelledby="seo-page-title">
          <div className="seo-wrap">
            <nav className="seo-breadcrumb" aria-label="Breadcrumb">
              <a href="/" data-testid="link-seo-breadcrumb-home">Home</a>
              <span aria-hidden="true">/</span>
              <span aria-current="page" data-testid="text-seo-breadcrumb-current">{service.label}</span>
            </nav>
            <div className="seo-hero-grid">
              <div>
                <span className="seo-kicker seo-mono">Printing &amp; branding · Kampala</span>
                <h1 id="seo-page-title" data-testid="text-seo-h1">{service.h1}</h1>
                <p className="seo-hero-intro" data-testid="text-seo-intro">{service.intro}</p>
                <div className="seo-hero-actions">
                  <a className="seo-btn seo-btn-primary" href={requestUrl} data-testid="link-seo-hero-request-quote">Request a quote <ArrowUpRight size={16} aria-hidden="true" /></a>
                  <a className="seo-btn seo-btn-outline" href="#guide-prices" data-testid="link-seo-hero-prices">See guide pricing <ArrowRight size={16} aria-hidden="true" /></a>
                </div>
                <div className="seo-hero-note">
                  <span>Peacock Building, 2nd Floor</span>
                  <span>Bring a design or sample to discuss</span>
                  <span>Price confirmed for your specification</span>
                </div>
              </div>
              <div className="seo-visual">
                {service.image ? (
                  <figure className={`seo-image-frame ${service.image.kind === 'mockup' ? 'is-mockup' : ''}${service.image.contain ? ' is-contained' : ''}`} data-testid="figure-seo-product-image">
                    <span className="seo-image-tag seo-mono">{service.image.kind === 'photo' ? 'Product photo' : 'Product mockup'}</span>
                    <CatalogueImage src={service.image.src} alt={service.image.alt} loading="eager" decoding="async" fetchPriority="high" sizes="(max-width: 700px) calc(100vw - 36px), 50vw" />
                    <figcaption>{service.image.caption}</figcaption>
                  </figure>
                ) : (
                  <div className="seo-visual-fallback" aria-label={`${service.label} at Print Garage`} data-testid="graphic-seo-service">
                    <span className="seo-mono">Print Garage / Kampala / 01</span>
                    <strong>{service.label}</strong>
                    <span className="seo-mono">Your artwork. Your quantities. A defined production brief.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="seo-ticker" aria-label="Why work with Print Garage">
          <div className="seo-wrap seo-ticker-inner">
            <span><b>01</b> Plan the item and its purpose</span>
            <span><b>02</b> Review materials and artwork</span>
            <span><b>03</b> Confirm price and fulfilment</span>
          </div>
        </div>

        <section className="seo-section" aria-labelledby="seo-overview-title">
          <div className="seo-wrap">
            <div className="seo-section-header">
              <div><span className="seo-mono seo-eyebrow">Inside this service</span><h2 id="seo-overview-title">Specify it with Print Garage.</h2></div>
            </div>
            <div className="seo-overview">
              <p className="seo-detail" data-testid="text-seo-detail">
                {service.detail} For related orders, see{' '}
                {contextualServices(service.slug).map((item, index) => (
                  <span key={item.slug}>{index > 0 ? ', ' : ''}<a href={item.path}>{item.label.toLowerCase()}</a></span>
                ))}.
              </p>
              <div className="seo-detail-aside"><strong>A useful enquiry has specifics.</strong>Include quantities, a design reference, your target date and any delivery requirements. Print Garage can review the material and finish options against that brief.</div>
            </div>
            <div className="seo-lists">
              <div className="seo-list-card">
                <span className="seo-mono seo-eyebrow">01 / Define the job</span>
                <h3>Options to discuss</h3>
                <ul>{service.deliverables.map((item, index) => <li key={`${item}-${index}`} data-testid={`text-seo-deliverable-${index}`}>{item}</li>)}</ul>
              </div>
              <div className="seo-list-card">
                <span className="seo-mono seo-eyebrow">02 / Define the purpose</span>
                <h3>Projects this can support</h3>
                <ul>{service.useCases.map((item, index) => <li key={`${item}-${index}`} data-testid={`text-seo-use-case-${index}`}>{item}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        <section className="seo-section seo-pricing" id="guide-prices" aria-labelledby="seo-pricing-title">
          <div className="seo-wrap">
            <div className="seo-section-header">
              <div><span className="seo-mono seo-eyebrow">Planning your order</span><h2 id="seo-pricing-title">Choose a scope. Confirm a price.</h2></div>
              <p>The options below describe order sizes, not fixed packages. Individual guide rates are on our <a href="/price-list">VAT-inclusive price list</a>.</p>
            </div>
            <div className="seo-price-panel">
              <div className="seo-price-head">
                <strong>{service.label}</strong>
                <a href="/price-list" className="seo-mono">Full price list ↗</a>
              </div>
              <div className="seo-table-scroll">
                <table className="seo-table" data-testid="table-seo-pricing">
                  <thead><tr><th scope="col">Order size</th><th scope="col">Typical scope</th><th scope="col">Price</th></tr></thead>
                  <tbody>
                    {service.tiers.map((tier) => (
                      <tr key={tier.name} data-testid={`row-seo-tier-${tier.name.toLowerCase()}`}>
                        <td>{tier.name}</td>
                        <td>{tier.scope}</td>
                        <td className="seo-price-value" data-testid={`text-seo-ugx-${tier.name.toLowerCase()}`}>Request a quote</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="seo-price-foot">
                <p>{service.tierNote}</p>
              </div>
            </div>
            <div className="seo-price-action"><a className="seo-btn seo-btn-dark" href={requestUrl} data-testid="link-seo-pricing-request-quote">Request a price for your job <ArrowUpRight size={15} aria-hidden="true" /></a> <a className="seo-btn seo-btn-outline" href="/price-list" data-testid="link-seo-full-price-list">See all VAT-inclusive prices <ArrowUpRight size={15} aria-hidden="true" /></a></div>
          </div>
        </section>

        <section className="seo-section seo-faq" aria-labelledby="seo-faq-title">
          <div className="seo-wrap">
            <div className="seo-section-header">
              <div><span className="seo-mono seo-eyebrow">Order preparation</span><h2 id="seo-faq-title">Check the details first.</h2></div>
              <p>Use these answers to prepare your enquiry. Anything specific to your job can be discussed with Print Garage.</p>
            </div>
            <div className="seo-faq-grid">
              {service.faqs.map((faq, index) => (
                <details className="seo-faq-item" key={faq.question} open={index === 0} data-testid={`faq-seo-${index}`}>
                  <summary data-testid={`button-seo-faq-${index}`}>{faq.question}<span aria-hidden="true"><ArrowUpRight size={22} /></span></summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <LocationSection />

        <section className="seo-section seo-related" aria-labelledby="seo-related-title">
          <div className="seo-wrap">
            <div className="seo-section-header">
              <div><span className="seo-mono seo-eyebrow">Build out your brief</span><h2 id="seo-related-title">What else does your project need?</h2></div>
              <p>Pair this enquiry with another Print Garage service for the same team, premises or event.</p>
            </div>
            <nav className="seo-related-grid" aria-label="Related services">
              {related.map((item) => <a className="seo-related-link" href={item.path} key={item.slug} data-testid={`link-seo-related-${item.slug}`}><span>{item.label}</span><ArrowUpRight size={17} aria-hidden="true" /></a>)}
            </nav>
          </div>
        </section>

        <section className="seo-final" aria-labelledby="seo-final-title">
          <div className="seo-wrap seo-final-inner">
            <div><span className="seo-mono seo-eyebrow">Start with the specification</span><h2 id="seo-final-title">Bring your next job to Print Garage.</h2></div>
            <div><p>Tell us the item, the number of pieces and your target date. Add a design or reference so we can discuss the right production details.</p>
              <div className="seo-final-actions">
                 <a className="seo-btn seo-btn-dark" href={requestUrl} data-testid="link-seo-bottom-request-quote">Request a quote <ArrowUpRight size={15} aria-hidden="true" /></a>
                <a className="seo-btn seo-btn-light" href={CALL} data-testid="link-seo-bottom-call"><Phone size={17} aria-hidden="true" /> Call {SITE.displayPhone}</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="seo-footer">
        <div className="seo-wrap seo-footer-layout">
          <div className="seo-footer-brand"><Brand /><p>Kampala print and branding enquiries, from office materials to team kit.</p></div>
          <div className="seo-footer-links">
            <span className="seo-mono" style={{ color: 'var(--seo-blue)' }}>Keep in touch</span>
            <a href="/" data-testid="link-seo-footer-home">Home</a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" data-testid="link-seo-footer-whatsapp">WhatsApp · {SITE.displayPhone}</a>
            <a href={CALL} data-testid="link-seo-footer-call">Call the team</a>
            <a href={`mailto:${SITE.email}`} data-testid="link-seo-footer-email">{SITE.email}</a>
          </div>
          <MiniMap />
          <small className="seo-footer-end">Print Garage · {SITE.address}</small>
        </div>
      </footer>
      <nav className="seo-sticky" aria-label="Quick contact">
        <a href={CALL} data-testid="link-seo-mobile-call"><Phone size={16} aria-hidden="true" /> Call</a>
        <a href={quoteUrl} target="_blank" rel="noopener noreferrer" data-testid="link-seo-mobile-whatsapp"><FaWhatsapp size={18} aria-hidden="true" /> WhatsApp</a>
      </nav>
    </div>
  );
}