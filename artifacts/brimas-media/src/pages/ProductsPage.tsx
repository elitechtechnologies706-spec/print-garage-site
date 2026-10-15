import { useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Leaf, Search } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { SiteMenu } from '@/components/SiteMenu';
import { Brand } from '@/components/Brand';
import { CatalogueImage } from '@/components/CatalogueImage';
import { catalogue, categoriesFor, categoryLabel, labelise, productFilters } from '@/lib/pg-catalogue';
import { whatsappHref } from '@/lib/catalog';
import { SITE } from '@/lib/site-config';
import { productDescription } from '@/lib/product-description';
import { ServiceOffers, TextileOffers } from '@/components/LiveOffers';
import { SocialLinks } from '@/components/SocialLinks';
import './products.css';

const PAGE = 24;

export function ProductsPage() {
  const [, params] = useRoute('/products/:category');
  const [, navigate] = useLocation();
  const param = params?.category;
  const groups = categoriesFor(param);
  const activeProductFilter = productFilters.find((filter) => filter.id === param)
    ?? productFilters.find((filter) => param !== undefined && filter.categories.some((category) => category === param));
  const promotionalCategoryGroups = activeProductFilter?.id === 'promotional' ? activeProductFilter.categories : [];
  const selectedPromotionalCategory = activeProductFilter?.id === 'promotional' && param !== 'promotional' ? param ?? '' : '';
  const currentFilterTitle = activeProductFilter && activeProductFilter.id === param ? activeProductFilter.label : undefined;
  const isDigitalMedia = param === 'digital-media';
  const [search, setSearch] = useState('');
  const [ecoOnly, setEcoOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => { setShown(PAGE); setSearch(''); setEcoOnly(false); }, [param]);

  const all = catalogue.products;

  const inGroup = useMemo(() => all.filter((p) =>
    (!groups || groups.includes(p.category))
    && (!selectedPromotionalCategory || p.category === selectedPromotionalCategory)), [all, groups, selectedPromotionalCategory]);
  const q = search.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const list = inGroup.filter((p) =>
    (!ecoOnly || p.eco)
    && `${p.name}${p.category}${p.subcategory ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '').includes(q));
  const visible = list.slice(0, shown);
  const serviceName = catalogue.services.find((x) => x.id === param)?.name;
  const title = isDigitalMedia ? 'Digital & Media Services' : !groups ? 'Products' : currentFilterTitle ?? serviceName ?? (groups.length === 1 ? categoryLabel(groups[0]) : labelise(param ?? ''));

  return (
    <div className="print-garage-page">
      <header className="topbar"><div className="shell topbar-inner">
        <a href="/" aria-label="Print Garage home"><Brand /></a>
        <div className="header-tools"><SiteMenu currentPath="/products" /></div>
      </div></header>
      <main className="section pp">
        <div className="shell">
          <p className="pp-kicker">Print Garage catalogue</p>
          <h1>{title}</h1>
          <nav className="pp-cats" aria-label="Product categories">
            {productFilters.map((filter) => (
                <button type="button" key={filter.id} className={filter.id === (activeProductFilter?.id ?? (!param ? 'all' : undefined)) ? 'on' : ''} onClick={() => { setSearch(''); setEcoOnly(false); navigate(filter.id === 'all' ? '/products' : `/products/${filter.id}`); }} data-testid={`button-cat-${filter.id}`}>{filter.label}</button>
            ))}
          </nav>
            {promotionalCategoryGroups.length > 1 && (
              <label className="pp-group-filter">
                <span>Browse category</span>
                <select
                  value={selectedPromotionalCategory}
                  onChange={(event) => navigate(event.currentTarget.value ? `/products/${event.currentTarget.value}` : '/products/promotional')}
                  aria-label="Browse promotional product category"
                  data-testid="select-product-category"
                >
                  <option value="">All promotional categories</option>
                  {promotionalCategoryGroups.map((category) => (
                    <option value={category} key={category}>
                      {categoryLabel(category)} ({all.filter((product) => product.category === category).length})
                    </option>
                  ))}
                </select>
              </label>
            )}
          {isDigitalMedia ? <ServiceOffers showHeading={false} /> : <>
          {groups?.includes('textiles') && <TextileOffers />}
          <div className="pp-tools">
            <label className="pp-search"><Search size={16} aria-hidden="true" /><input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setShown(PAGE); }} placeholder="Search products" aria-label="Search products" data-testid="input-product-search" /></label>
            <label className="pp-eco"><input type="checkbox" checked={ecoOnly} onChange={(e) => { setEcoOnly(e.target.checked); setShown(PAGE); }} /> Eco only</label>
          </div>
          <p className="catalogue-results" role="status">Showing {visible.length} of {list.length} items</p>
          {all.length === 0 && <p className="catalogue-empty">Product references are not available here yet. Send Print Garage the item you have in mind through WhatsApp.</p>}
          {all.length > 0 && list.length === 0 && <p className="catalogue-empty">Nothing in this selection matches your search. Clear a filter or choose a different product group.</p>}
          <div className="pp-grid">
            {visible.map((p) => {
              const msg = `Hello Print Garage, please help me plan an order for:\n${p.name} (${categoryLabel(p.category)}${p.subcategory ? ` / ${labelise(p.subcategory)}` : ''})\nWhat specifications, branding choices and quantities do you need to quote this item?`;
              return (
                <article className="pp-card" key={p.id} data-testid={`card-product-${p.id}`}>
                  <div className="pp-media">
                    {p.eco && <span className="pp-eco-badge"><Leaf size={12} aria-hidden="true" /> Eco</span>}
                    <CatalogueImage src={p.image} alt={p.name} width={p.width} height={p.height} loading="lazy" decoding="async" />
                  </div>
                  <div className="pp-body">
                    <span className="pp-cat">{categoryLabel(p.category)}{p.subcategory ? ` / ${labelise(p.subcategory)}` : ''}</span>
                    <h2>{p.name}</h2>
                    <p className="pp-description" data-testid={`text-product-description-${p.id}`}>{productDescription(p)}</p>
                    <a className="pp-enquire" href={whatsappHref(msg)} target="_blank" rel="noreferrer" data-testid={`link-enquire-${p.id}`}><FaWhatsapp size={16} aria-hidden="true" /> Enquire on WhatsApp</a>
                  </div>
                </article>
              );
            })}
          </div>
          {shown < list.length && <div className="pp-more"><button type="button" className="button button-dark" onClick={() => setShown((n) => n + PAGE)} data-testid="button-load-more">Load more</button></div>}
          {groups?.length === 1 && groups[0] === 'portfolio' && <p className="showcase-note">KCB-branded samples are design references, not evidence of completed Print Garage work.</p>}
          </>}
        </div>
      </main>
      <footer className="footer"><div className="shell footer-inner"><Brand /><div className="footer-meta"><SocialLinks /><small>© {new Date().getFullYear()} Print Garage · {SITE.address}</small></div></div></footer>
    </div>
  );
}
