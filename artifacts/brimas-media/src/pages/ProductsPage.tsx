import { useEffect, useMemo, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Leaf, Search } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { SiteMenu } from '@/components/SiteMenu';
import { Brand } from '@/components/Brand';
import { CatalogueImage } from '@/components/CatalogueImage';
import { catalogue, categoriesFor, categoryLabel, labelise, CATEGORY_ORDER } from '@/lib/pg-catalogue';
import { whatsappHref } from '@/lib/catalog';
import { SITE } from '@/lib/site-config';
import { productDescription } from '@/lib/product-description';
import './products.css';

const PAGE = 24;

export function ProductsPage() {
  const [, params] = useRoute('/products/:category');
  const [, navigate] = useLocation();
  const param = params?.category;
  const groups = categoriesFor(param);
  const [search, setSearch] = useState('');
  const [sub, setSub] = useState('all');
  const [ecoOnly, setEcoOnly] = useState(false);
  const [shown, setShown] = useState(PAGE);

  useEffect(() => { setSub('all'); setShown(PAGE); setSearch(''); setEcoOnly(false); }, [param]);

  const all = catalogue.products;
  const categories = useMemo(() => {
    const present = new Set(all.map((p) => p.category));
    return [...CATEGORY_ORDER.filter((c) => present.has(c)), ...[...present].filter((c) => !CATEGORY_ORDER.includes(c))].map((c) => [c, categoryLabel(c)] as const);
  }, [all]);

  const inGroup = useMemo(() => all.filter((p) => !groups || groups.includes(p.category)), [all, groups]);
  const subs = useMemo(() => [...new Set(inGroup.map((p) => p.subcategory).filter(Boolean) as string[])], [inGroup]);
  const q = search.toLowerCase().replace(/[^a-z0-9]+/g, '');
  const list = inGroup.filter((p) =>
    (sub === 'all' || p.subcategory === sub) && (!ecoOnly || p.eco)
    && `${p.name}${p.category}${p.subcategory ?? ''}`.toLowerCase().replace(/[^a-z0-9]+/g, '').includes(q));
  const visible = list.slice(0, shown);
  const serviceName = catalogue.services.find((x) => x.id === param)?.name;
  const title = !groups ? 'Products' : serviceName ?? (groups.length === 1 ? categoryLabel(groups[0]) : labelise(param ?? ''));

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
            <button type="button" className={!groups ? 'on' : ''} onClick={() => { setSearch(''); setEcoOnly(false); navigate('/products'); }} data-testid="button-cat-all">All</button>
            {categories.map(([slug, label]) => (
              <button type="button" key={slug} className={groups?.length === 1 && groups[0] === slug ? 'on' : ''} onClick={() => { setSearch(''); setEcoOnly(false); navigate(`/products/${slug}`); }} data-testid={`button-cat-${slug}`}>{label}</button>
            ))}
          </nav>
          {subs.length > 0 && (
            <div className="pp-subs" aria-label="Subcategories">
              <button type="button" className={sub === 'all' ? 'on' : ''} onClick={() => { setSub('all'); setShown(PAGE); }}>All types</button>
              {subs.map((s) => <button type="button" key={s} className={sub === s ? 'on' : ''} onClick={() => { setSub(s); setShown(PAGE); }}>{labelise(s)}</button>)}
            </div>
          )}
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
          {groups?.includes('portfolio') && <p className="showcase-note">KCB-branded samples are design references, not evidence of completed Print Garage work.</p>}
        </div>
      </main>
      <footer className="footer"><div className="shell footer-inner"><Brand /><div className="footer-meta"><small>© {new Date().getFullYear()} Print Garage · {SITE.address}</small></div></div></footer>
    </div>
  );
}
