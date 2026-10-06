import { useState } from 'react';
import { CatalogueImage } from './CatalogueImage';
import { galleryCategories, galleryItems } from '../lib/gallery-items';
import './Gallery.css';

const PAGE_SIZE = 9;

export function Gallery() {
  const [category, setCategory] = useState('All');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const matchingItems = galleryItems.filter((item) => category === 'All' || item.category === category);
  const visibleItems = matchingItems.slice(0, limit);

  return (
    <section className="section gallery" id="gallery" aria-labelledby="gallery-heading">
      <div className="shell">
        <div className="section-heading">
          <div className="eyebrow">Gallery / selected catalogue examples</div>
          <h2 id="gallery-heading">Product photos and branding concepts.</h2>
          <p>Explore selected product photos and branding concepts from our catalogue. Choose a category to find examples for your brief.</p>
        </div>
        <div className="gallery-filters" role="group" aria-label="Filter gallery by category">
          {['All', ...galleryCategories].map((label) => (
            <button
              key={label}
              type="button"
              aria-pressed={category === label}
              aria-controls="gallery-grid"
              onClick={() => { setCategory(label); setLimit(PAGE_SIZE); }}
            >{label === 'All' ? 'All examples' : label}</button>
          ))}
        </div>
        <p className="gallery-status" role="status">Showing {visibleItems.length} of {matchingItems.length} examples{category !== 'All' ? ` · ${category}` : ''}</p>
        <div className="gallery-grid" id="gallery-grid">
          {visibleItems.map((item) => (
            <figure className="gallery-card" key={item.id}>
              <div className="gallery-media">
                <CatalogueImage
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1280px) 382px, (min-width: 1024px) calc((100vw - 104px) / 3), (min-width: 640px) calc((100vw - 52px) / 2), calc(100vw - 36px)"
                />
              </div>
              <figcaption>
                <div className="gallery-card-labels"><span>{item.category}</span><span>{item.provenance === 'mockup' ? 'Mockup' : 'Product photo'}</span></div>
                <h3>{item.title}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
        {visibleItems.length < matchingItems.length && (
          <div className="gallery-more">
            <button className="button button-dark" type="button" onClick={() => setLimit((count) => count + PAGE_SIZE)}>Show more examples</button>
          </div>
        )}
        <p className="showcase-note">Product photos and mockups are examples, not a list of completed client projects. Any logos shown are example branding, not endorsements. Specifications and availability are confirmed with your quotation.</p>
        <a className="button button-dark" href="/gallery" style={{ marginTop: 22 }}>Browse all 254 catalogue images <span aria-hidden="true">↗</span></a>
        <br />
        <a className="showcase-service-link" href="#behind-the-scenes">See the garment-making photo sequences <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
