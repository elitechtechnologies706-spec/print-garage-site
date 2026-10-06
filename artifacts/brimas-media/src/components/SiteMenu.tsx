import { useEffect, useRef } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { servicePages } from '../seo/service-data';
import { productCategories } from '../lib/product-navigation';
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

  const sectionLink = (id: string) => home ? `#${id}` : `/#${id}`;
  const navigationItem = ({ id, label }: typeof sections[number]) => {
    if (id === 'gallery') {
      return <a key={id} href="/gallery" onClick={closeMenu} aria-current={currentPath === '/gallery' ? 'page' : undefined} data-testid="link-gallery">{label}</a>;
    }
    if (id !== 'showcase' && id !== 'services') {
      return <a key={id} href={sectionLink(id)} onClick={closeMenu} data-testid={`link-${id}`}>{label}</a>;
    }
    return (
      <details className="nav-category-dropdown" key={id} data-testid={`nav-dropdown-${id}`}>
        <summary>{label}<ChevronDown size={14} aria-hidden="true" /></summary>
        <div className="nav-dropdown-panel">
          <a href={sectionLink(id)} onClick={closeMenu}>View all {id === 'showcase' ? 'products' : 'services'}</a>
          {id === 'showcase'
            ? productCategories.map((category) => <a key={category.id} href={sectionLink(`products-${category.id}`)} onClick={closeMenu}>{category.label}</a>)
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
      {sections.map(navigationItem)}
    </nav>
    <details className="site-menu">
      <summary aria-label="Open navigation menu" data-testid="nav-menu-toggle">
        <Menu className="site-menu-open-icon" size={21} aria-hidden="true" />
        <X className="site-menu-close-icon" size={21} aria-hidden="true" />
      </summary>
      <nav className="site-menu-panel" aria-label="Site navigation">
        <span className="site-menu-label">Navigate</span>
        <a href="/price-list" aria-current={currentPath === '/price-list' ? 'page' : undefined} onClick={closeMenu} data-testid="link-nav-price-list">Full price list · VAT included</a>
        <a href="/request-a-quote" aria-current={currentPath === '/request-a-quote' ? 'page' : undefined} onClick={closeMenu} data-testid="link-nav-request-quote">Request a quote</a>
        {sections.map(navigationItem)}
      </nav>
    </details>
    </div>
  );
}