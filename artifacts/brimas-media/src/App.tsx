import { useEffect } from 'react';
import { ArrowUpRight, Phone } from 'lucide-react';
import { FaEnvelope, FaWhatsapp } from 'react-icons/fa6';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecordView } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CALL, whatsappHref } from '@/lib/catalog';
import { MiniMap } from '@/seo/Location';
import { SiteMenu } from '@/components/SiteMenu';
import { Brand } from '@/components/Brand';
import { SITE } from '@/lib/site-config';
import { CatalogueImage } from '@/components/CatalogueImage';
import { catalogue, homeTeasers } from '@/lib/pg-catalogue';
import hero from '@/lib/print-garage-hero.json';
import copy from '@/lib/print-garage-copy.json';

const queryClient = new QueryClient();

const HERO_TITLE = 'Print Garage - Printing and Branding Garage in Kampala, Uganda';
const HERO_COPY = copy.hero;
const SERVICE_NAMES = ['Large Format', 'Commercial Printing', 'Corporate Branding', 'Promotional Gifts', 'Textile/Garment', 'Eco Printing'];

function AppContent() {
  const { mutate: recordView } = useRecordView();
  const generalMessage = 'Hello Print Garage, I have a print or branding brief. Could you help me choose the specifications and confirm a price?';

  useEffect(() => {
    recordView(undefined, { onError: (error) => console.error('Could not record homepage view', error) });
  }, [recordView]);

  useEffect(() => {
    const go = () => { if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView(); };
    const frame = requestAnimationFrame(go);
    window.addEventListener('hashchange', go);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('hashchange', go); };
  }, []);

  const services = SERVICE_NAMES.map((name, i) => ({ id: catalogue.services[i].id, name, image: catalogue.services[i].image, dims: catalogue.products.find((p) => p.image === catalogue.services[i].image) }));
  const teasers = homeTeasers(catalogue.products);
  const pillars = [
    ['Mission', catalogue.mission], ['Vision', catalogue.vision], ['Purpose', catalogue.purpose],
  ] as const;

  return (
    <div className="print-garage-page">
      <header className="topbar">
        <div className="shell topbar-inner">
          <a href="#top" aria-label="Print Garage home" data-testid="link-home"><Brand /></a>
          <div className="header-tools">
            <a className="header-cta" href={whatsappHref(generalMessage)} target="_blank" rel="noreferrer" aria-label="WhatsApp Print Garage" data-testid="link-header-whatsapp"><FaWhatsapp size={17} aria-hidden="true" /><span className="header-cta-label">WhatsApp</span></a>
            <SiteMenu home />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero hero--center">
          <CatalogueImage className="hero-background" src={hero.image} alt={hero.alt} width={hero.width} height={hero.height} loading="eager" fetchPriority="high" decoding="async" sizes="100vw" />
          <div className="shell hero-grid">
            <div className="hero-copy">
              <h1 className="reveal">{HERO_TITLE}</h1>
              <p className="hero-intro reveal delay-1">{HERO_COPY}</p>
              <div className="hero-actions reveal delay-2">
                <a className="button hero-quote" href="/request-a-quote" data-testid="button-hero-quote">Get a Quote <ArrowUpRight size={17} aria-hidden="true" /></a>
                <a className="button hero-call" href={CALL} data-testid="button-hero-call"><Phone size={16} aria-hidden="true" /> Call</a>
                <a className="button hero-wa" href={SITE.whatsapp} target="_blank" rel="noreferrer" data-testid="button-hero-whatsapp"><FaWhatsapp size={17} aria-hidden="true" /> WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        <section className="section pg-about" id="proof">
          <div className="shell pg-about-grid">
            <h2>Who we are</h2>
            <p>{catalogue.about}</p>
          </div>
        </section>

        <section className="section pg-services" id="services">
          <div className="shell">
            <h2 className="pg-h">Services</h2>
            <div className="pg-zig">
              {services.map((s, i) => (
                <a className={`pg-zig-row${i % 2 ? ' flip' : ''}`} href={`/products/${s.id}`} key={s.name} data-testid={`link-service-${s.id}`}>
                  <div className="pg-zig-media"><CatalogueImage src={s.image} alt={s.name} width={s.dims?.width} height={s.dims?.height} loading="lazy" decoding="async" /></div>
                  <div className="pg-zig-text"><span className="pg-num">{String(i + 1).padStart(2, '0')}</span><h3>{s.name}</h3><span className="pg-link">View products <ArrowUpRight size={16} aria-hidden="true" /></span></div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section pg-pillars" id="mvp">
          <div className="shell pg-pillars-grid">
            {pillars.map(([label, text]) => (
              <div className="pg-pillar" key={label}><h3>{label}</h3><p>{text}</p></div>
            ))}
          </div>
        </section>

        <section className="section pg-products" id="showcase">
          <div className="shell">
            <h2 className="pg-h">Products</h2>
            {teasers.length === 0
              ? <p className="catalogue-empty">Open the catalogue to explore available Print Garage product options.</p>
              : <div className="pg-masonry">
                {teasers.map((p) => (
                  <a href={`/products/${p.category}`} className="pg-m-item" key={p.id} data-testid={`card-teaser-${p.id}`}>
                    <CatalogueImage src={p.image} alt={p.name} width={p.width} height={p.height} loading="lazy" decoding="async" />
                  </a>
                ))}
              </div>}
            <div className="pg-more"><a className="button pg-more-btn" href="/products" data-testid="link-view-more">View More <ArrowUpRight size={17} aria-hidden="true" /></a></div>
          </div>
        </section>

        <section className="section pg-partners" id="partners">
          <div className="shell">
            <h2>OUR PARTNERS</h2>
            <p className="pg-partners-sub">{copy.partners}</p>
            {catalogue.partners.length > 0
              ? <div className="pg-logos">{catalogue.partners.map((p) => <div className="pg-logo" key={p.name}><img src={p.logo} alt={p.name} width={300} height={160} loading="lazy" decoding="async" /></div>)}</div>
              : <p className="pg-partners-note" data-testid="text-partners-note">We are checking the source material before displaying partner identities.</p>}
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="footer-map seo-home-location"><MiniMap /></div>
        <div className="shell footer-inner">
          <Brand />
          <div className="footer-meta">
            <div className="footer-links">
              <a href={CALL} data-testid="link-mobile-phone"><Phone size={14} aria-hidden="true" /> {SITE.displayPhone}</a>
              <a href={`mailto:${SITE.email}`} data-testid="link-email-primary"><FaEnvelope size={14} aria-hidden="true" /> {SITE.email}</a>
              <a href={SITE.whatsapp} target="_blank" rel="noreferrer" data-testid="link-footer-whatsapp"><FaWhatsapp size={14} aria-hidden="true" /> WhatsApp</a>
            </div>
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
