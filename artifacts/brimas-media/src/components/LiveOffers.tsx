import { services, textiles } from '@/lib/live-offers';
import { whatsappHref } from '@/lib/catalog';
import './live-offers.css';

export function ServiceOffers() {
  return (
    <section className="live-offers" aria-labelledby="digital-services-heading">
      <h2 id="digital-services-heading">Digital & media services</h2>
      <div className="live-service-grid">
        {services.map((service) => (
          <article className="live-service" key={service.title}>
            {service.badge && <span className="live-offer-badge">{service.badge}</span>}
            <h3>{service.title}</h3>
            <p className="live-offer-price">{service.price}</p>
            {service.description && <p className="live-offer-description">{service.description}</p>}
            {service.offering && (
              <div className="live-sub-offer">
                <h4>{service.offering.title}</h4>
                <p className="live-offer-description">{service.offering.description}</p>
                <p className="live-offer-price">{service.offering.price}</p>
                <div className="live-offer-actions">
                  <a href={whatsappHref(service.offering.wa)} target="_blank" rel="noreferrer">Enquire about social media management</a>
                </div>
              </div>
            )}
            <div className="live-offer-actions">
              {(service.btns ?? [{ label: service.offering ? 'Request a studio demo' : 'Enquire on WhatsApp', wa: service.wa! }]).map((button) => (
                <a key={button.label} href={whatsappHref(button.wa)} target="_blank" rel="noreferrer">{button.label}</a>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TextileOffers() {
  return (
    <section className="live-offers" aria-labelledby="textile-offers-heading">
      <h2 id="textile-offers-heading">Textile prices & packs</h2>
      <p>Prices apply to the sizes and packs shown. Confirm availability, VAT and any branding charges when ordering.</p>
      {Object.entries(textiles).map(([title, items]) => (
        <div className="live-textile-group" key={title}>
          <h3>{title}</h3>
          {items.map((item) => (
            <div className="live-textile-row" key={item.name}>
              <div><strong>{item.name}</strong>{item.note && <small>{item.note}</small>}</div>
              <span className="live-offer-price">{item.price}</span>
              <a href={whatsappHref(`Hello Print Garage, I am interested in ${item.name} at ${item.price}.${item.note ? ` ${item.note}.` : ''} Please confirm availability, VAT and the final price.`)} target="_blank" rel="noreferrer" aria-label={`Enquire about ${item.name}`}>Enquire</a>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
