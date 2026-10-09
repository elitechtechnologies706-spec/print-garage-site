import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { servicePages } from '../seo/service-data';
import { catalogue, categoryLabel, CATEGORY_ORDER } from '../lib/pg-catalogue';
import './SiteMenu.css';

const sections = [
  { id: 'top', label: 'Home' },
  { id: 'showcase', label: 'Our Products' },
  { id: 'services', label: 'Services' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'proof', label: 'About Us' },
  { id: 'contact', label: 'Contact Us' },
] as const;

const serviceCategories = [
  ['Printing', '/printing-services-kampala'],
  ['Large Format & Signage', '/large-format-printing-industrial-area'],
  ['Branded Clothing', '/t-shirt-printing-embroidery-kampala'],
  ['PPE & Safety', '/ppe-supplier-kampala-uganda'],
  ['Promotional Products', '/promotional-items-mugs-pens-kampala'],
  ['Corporate Gifts', '/corporate-gifts-branding-kampala'],
  ['Packaging', '/corporate-gifts-branding-kampala#guide-prices'],
] as const;

export function SiteMenu({ home = false, currentPath }: { home?: boolean; currentPath?: string }) {
  const navigationRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuPanelId = useId();

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      navigationRef.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((menu) => {
        if (!menu.contains(event.target as Node)) menu.open = false;
      });
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const menu = navigationRef.current?.querySelector<HTMLDetailsElement>('.nav-category-dropdown[open], .site-menu[open]');
        if (menu) {
          menu.open = false;
          menu.querySelector('summary')?.focus();
        }
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onEscape);
    };
  }, []);

  const closeMenu = () => {
    navigationRef.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((menu) => { menu.open = false; });
  };

  const sectionLink = (id: string) => id === 'showcase' ? '/products' : home ? `#${id}` : `/#${id}`;
  const productCats = CATEGORY_ORDER.filter((c) => catalogue.products.some((p) => p.category === c));
  const navigationItem = ({ id, label }: typeof sections[number], mobile: boolean) => {
    if (id === 'gallery') {
      return <a key={id} href="/gallery" onClick={closeMenu} aria-current={currentPath === '/gallery' ? 'page' : undefined} data-testid="link-gallery">{label}</a>;
    }
    if (!mobile || (id !== 'showcase' && id !== 'services')) {
      return <a key={id} href={sectionLink(id)} onClick={closeMenu} data-testid={`link-${id}`}>{label}</a>;
    }
    return (
      <details className="nav-category-dropdown" key={id} data-testid={`nav-dropdown-${id}`}>
        <summary role="button" tabIndex={0}>{label}<ChevronDown size={14} aria-hidden="true" /></summary>
        <div className="nav-dropdown-panel">
          <a href={sectionLink(id)} onClick={closeMenu}>View all {id === 'showcase' ? 'products' : 'services'}</a>
          {id === 'showcase'
            ? productCats.map((c) => <a key={c} href={`/products/${c}`} onClick={closeMenu} aria-current={currentPath === `/products/${c}` ? 'page' : undefined}>{categoryLabel(c)}</a>)
            : <>
              {serviceCategories.map(([category, href]) => <a key={category} href={href} onClick={closeMenu} aria-current={currentPath === href ? 'page' : undefined}>{category}</a>)}
              <span className="site-menu-label site-menu-divider">More service details</span>
              {servicePages.filter((service) => !serviceCategories.some(([, href]) => href === service.path)).map((service) => <a key={service.slug} href={service.path} onClick={closeMenu} aria-current={currentPath === service.path ? 'page' : undefined}>{service.label}</a>)}
            </>}
        </div>
      </details>
    );
  };

  return (
    <div className="navigation-controls" ref={navigationRef}>
    <nav className="desktop-site-navigation" aria-label="Main navigation">
      {sections.map((section) => navigationItem(section, false))}
    </nav>
    <details className="site-menu" onToggle={(event) => setMobileMenuOpen(event.currentTarget.open)}>
      <summary role="button" tabIndex={0} aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileMenuOpen} aria-controls={menuPanelId} data-testid="nav-menu-toggle">
        <Menu className="site-menu-open-icon" size={21} aria-hidden="true" />
        <X className="site-menu-close-icon" size={21} aria-hidden="true" />
      </summary>
      <nav id={menuPanelId} className="site-menu-panel" aria-label="Site navigation">
        <span className="site-menu-label">Navigate</span>
        <a href="/price-list" aria-current={currentPath === '/price-list' ? 'page' : undefined} onClick={closeMenu} data-testid="link-nav-price-list">Full price list · VAT included</a>
        <a href="/request-a-quote" aria-current={currentPath === '/request-a-quote' ? 'page' : undefined} onClick={closeMenu} data-testid="link-nav-request-quote">Request a quote</a>
        {sections.map((section) => navigationItem(section, true))}
      </nav>
    </details>
    </div>
  );
}