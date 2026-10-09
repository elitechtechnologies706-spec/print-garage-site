import { useEffect, useState } from 'react';
import { SiteMenu } from '../components/SiteMenu';
import { Brand } from '../components/Brand';
import { CatalogueImage } from '../components/CatalogueImage';
import { fullGalleryCategories, fullGalleryItems } from '../lib/gallery-catalogue';
import '../components/Gallery.css';

const PAGE_SIZE = 12;

function GalleryAssetImage({ item }: { item: typeof fullGalleryItems[number] }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p className="gallery-image-error" role="status">This image is currently unavailable.</p>;
  return <CatalogueImage src={item.src} alt={item.alt} width={item.width} height={item.height}
    srcSet={item.srcSet} loading="lazy" decoding="async"
    sizes="(min-width: 1280px) 382px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 640px) calc((100vw - 52px) / 2), calc(100vw - 36px)"
    onError={() => setFailed(true)} />;
}

export function GalleryPage() {
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const items = fullGalleryItems.filter((item) => category === 'All' || item.category === category);
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const visibleItems = items.slice(offset, offset + PAGE_SIZE);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category') ?? 'All';
      setCategory(fullGalleryCategories.includes(category) ? category : 'All');
      const requestedPage = Number(params.get('page') ?? 1);
      setPage(Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
    };
    restore();
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  const navigate = (nextCategory: string, nextPage: number) => {
    setCategory(nextCategory);
    setPage(nextPage);
    const params = new URLSearchParams();
    if (nextCategory !== 'All') params.set('category', nextCategory);
    if (nextPage > 1) params.set('page', String(nextPage));
    window.history.pushState(null, '', `${window.location.pathname}${params.size ? `?${params}` : ''}`);
    if (nextCategory === category) document.getElementById('full-gallery-heading')?.scrollIntoView({ behavior: 'instant' });
  };

  return (
    <div className="print-garage-page">
      <header className="topbar">
        <div className="shell topbar-inner">
          <a href="/" aria-label="Print Garage home" className="brand"><Brand /></a>
          <div className="header-tools"><SiteMenu currentPath="/gallery" /></div>
        </div>
      </header>
      <main>
        <section className="section gallery" aria-labelledby="full-gallery-heading">
          <div className="shell">
            <div className="section-heading">
              <div className="eyebrow">Gallery / product examples</div>
              <h1 id="full-gallery-heading" className="full-gallery-heading">Print Garage Gallery</h1>
              <h2 className="full-gallery-subheading">{fullGalleryItems.length} references for your next brief.</h2>
              <p>Choose a category to explore product photography and branding concepts. This reference collection helps you describe an enquiry; it does not document completed Print Garage commissions.</p>
              <a className="showcase-service-link" href="/products">Explore the source-backed product catalogue <span aria-hidden="true">↗</span></a>
            </div>
            <div className="gallery-filters" role="group" aria-label="Filter full gallery by category">
              {['All', ...fullGalleryCategories].map((label) => <button key={label} type="button" aria-pressed={category === label} aria-controls="full-gallery-grid" onClick={() => navigate(label, 1)}>{label === 'All' ? `All ${fullGalleryItems.length} images` : label}</button>)}
            </div>
            <p className="gallery-status" role="status">Showing {offset + 1}–{offset + visibleItems.length} of {items.length} images · Page {currentPage} of {pageCount}{category !== 'All' ? ` · ${category}` : ''}</p>
            <div className="gallery-grid" id="full-gallery-grid">
              {visibleItems.map((item) => <figure className="gallery-card" key={item.id} data-asset-id={item.id}>
                <div className="gallery-media"><GalleryAssetImage item={item} /></div>
                <figcaption><div className="gallery-card-labels"><span>{item.category}</span><span>{item.provenance === 'mockup' ? 'Mockup' : item.provenance === 'photo' ? 'Product photo' : 'Description unverified'}</span></div><h3>{item.title}</h3></figcaption>
              </figure>)}
            </div>
            <nav className="gallery-pagination" aria-label="Gallery pages">
              <button className="button button-dark" type="button" disabled={currentPage === 1} onClick={() => navigate(category, currentPage - 1)}>Previous</button>
              <label htmlFor="gallery-page">Page<select id="gallery-page" value={currentPage} onChange={(event) => navigate(category, Number(event.target.value))}>{Array.from({ length: pageCount }, (_, index) => <option key={index} value={index + 1}>{index + 1} of {pageCount}</option>)}</select></label>
              <button className="button button-dark" type="button" disabled={currentPage === pageCount} onClick={() => navigate(category, currentPage + 1)}>Next</button>
            </nav>
            <p className="showcase-note">Reference-image logos illustrate possible branding only. They do not establish a client relationship; request confirmation of the item and specification you want.</p>
          </div>
        </section>
      </main>
      <footer className="footer"><div className="shell"><a href="/">Print Garage home</a> · <a href="/request-a-quote">Request a quote</a></div></footer>
    </div>
  );
}
