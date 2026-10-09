import { ArrowUpRight, Clock3, MapPin, Navigation, Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { CALL, whatsappHref } from '../lib/catalog';
import { SITE } from '../lib/site-config';

const MAP_QUERY = 'Peacock Building Kampala Uganda';
const MAP_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;
const MAP_DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;
const OSM_SEARCH = `https://www.openstreetmap.org/search?query=${encodeURIComponent(MAP_QUERY)}`;
const LOCATION_MESSAGE = `Hello Print Garage, I would like to discuss a project at ${SITE.address}. Could you send a location pin and advise a suitable visiting time?`;

export function LocationSection() {
  return (
    <section className="seo-section seo-location" id="location" aria-labelledby="seo-location-title">
      <div className="seo-wrap">
        <div className="seo-section-header">
          <div>
            <span className="seo-mono seo-eyebrow">Discuss your brief in Kampala</span>
            <h2 id="seo-location-title">Visit Print Garage.</h2>
          </div>
          <p>Have a sample or design to discuss? Bring it to Print Garage so we can work through the materials, quantities and finish with you.</p>
        </div>
        <div className="seo-location-layout">
          <div>
            <div className="seo-map-shell">
              <iframe title="Map search for Peacock Building, Kampala" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" data-testid="iframe-location-map" />
              <span className="seo-map-label seo-mono">Peacock Building · 2nd Floor</span>
            </div>
            <p className="seo-map-fallback">Map not loading? <a href={OSM_SEARCH} target="_blank" rel="noopener noreferrer" data-testid="link-location-osm">Find this address on OpenStreetMap <ArrowUpRight size={12} aria-hidden="true" style={{ display: 'inline' }} /></a></p>
          </div>
          <div className="seo-address-card">
            <span className="seo-mono seo-eyebrow">Visit Print Garage</span>
            <h3>Peacock Building.<br />2nd Floor · Kampala.</h3>
            <div className="seo-address-detail">
              <MapPin size={19} aria-hidden="true" />
              <div><strong>Address</strong><span>{SITE.address}</span></div>
            </div>
            <div className="seo-address-detail">
              <Navigation size={19} aria-hidden="true" />
              <div><strong>Before you travel</strong><span>Ask us to confirm the entrance and share a location pin.</span></div>
            </div>
            <div className="seo-address-detail">
              <Clock3 size={19} aria-hidden="true" />
              <div><strong>Opening hours</strong><span>Call or WhatsApp to confirm when to visit.</span></div>
            </div>
            <div className="seo-location-actions">
              <a className="seo-btn seo-btn-dark" href={MAP_DIRECTIONS} target="_blank" rel="noopener noreferrer" data-testid="link-location-directions"><Navigation size={17} aria-hidden="true" /> Get directions <ArrowUpRight size={15} aria-hidden="true" /></a>
              <a className="seo-btn seo-btn-light" href={whatsappHref(LOCATION_MESSAGE)} target="_blank" rel="noopener noreferrer" data-testid="link-location-whatsapp"><FaWhatsapp size={19} aria-hidden="true" /> Ask for location on WhatsApp</a>
              <a className="seo-btn" href={CALL} data-testid="link-location-call"><Phone size={17} aria-hidden="true" /> Call for directions · {SITE.displayPhone}</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MiniMap() {
  return (
    <div className="seo-mini">
      <h3 className="seo-mono">Visit Print Garage</h3>
      <div className="seo-mini-frame">
        <iframe title="Mini map search for Peacock Building, Kampala" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" data-testid="iframe-footer-mini-map" />
      </div>
      <p>Peacock Building · 2nd Floor · Kampala<br />Confirm opening hours before visiting · <a href={MAP_DIRECTIONS} target="_blank" rel="noopener noreferrer" data-testid="link-footer-directions">Get directions</a> · <a href={OSM_SEARCH} target="_blank" rel="noopener noreferrer" data-testid="link-footer-osm">OSM</a></p>
    </div>
  );
}