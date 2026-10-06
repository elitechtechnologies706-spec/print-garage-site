import { useEffect } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { useForm } from 'react-hook-form';
import { Form } from '../components/ui/form';
import { SiteMenu } from '../components/SiteMenu';
import { Brand } from '../components/Brand';
import { servicePages } from '../seo/service-data';
import { whatsappHref } from '../lib/catalog';
import '../seo/landing.css';
import './request-quote.css';

type QuoteBrief = {
  service: string;
  quantity: string;
  details: string;
  deadline: string;
  name: string;
};

export function quotePageHref(slug: string) {
  return `/request-a-quote?service=${encodeURIComponent(slug)}`;
}

export function RequestQuote() {
  const form = useForm<QuoteBrief>({
    defaultValues: { service: '', quantity: '', details: '', deadline: '', name: '' },
  });
  const { setValue } = form;

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('service');
    if (slug && servicePages.some((item) => item.slug === slug)) setValue('service', slug);
  }, [setValue]);

  const submit = (brief: QuoteBrief) => {
    const chosen = servicePages.find((item) => item.slug === brief.service);
    if (!chosen && brief.service !== 'other') return;
    const message = [
      'Hello Print Garage, I would like a quote for one job.',
      `Service: ${chosen?.label ?? 'Other / custom request'}`,
      `Quantity: ${brief.quantity.trim()}`,
      `What I need: ${brief.details.trim()}`,
      ...(brief.deadline.trim() ? [`When I need it: ${brief.deadline.trim()}`] : []),
      ...(brief.name.trim() ? [`My name: ${brief.name.trim()}`] : []),
      'Please confirm the price and next steps for this specific request.',
    ].join('\n');
    window.location.assign(whatsappHref(message));
  };

  return (
    <div className="seo-page request-quote-page">
      <header className="seo-top">
        <div className="seo-wrap seo-top-inner">
          <a className="seo-logo" href="/" aria-label="Print Garage homepage" data-testid="link-quote-home">
            <Brand />
          </a>
          <div className="seo-top-right">
            <span className="seo-top-address seo-mono">Peacock Building / 2nd Floor / Kampala</span>
            <SiteMenu currentPath="/request-a-quote" />
          </div>
        </div>
      </header>
      <main className="seo-wrap request-quote-layout">
        <div className="request-quote-intro">
          <a href="/" className="request-quote-back" data-testid="link-quote-back"><ArrowLeft size={16} /> Back to home</a>
          <span className="seo-mono seo-eyebrow">One brief / One job</span>
          <h1>Request a quote for what <em>you</em> need.</h1>
          <p>Choose one service and tell us about your order. We’ll prepare a WhatsApp message with only your request, so the team can confirm a price based on your specs.</p>
          <div className="request-quote-note">
            <strong>No fixed price for every job.</strong>
            <span>Quantities, materials, branding and timing can affect the final quote. You can review the message before sending it on WhatsApp.</span>
          </div>
        </div>
        <Form {...form}>
          <form className="request-quote-form" onSubmit={form.handleSubmit(submit)}>
            <span className="seo-mono seo-eyebrow">Tell us about your job</span>
            <h2>Your quote brief</h2>
            <label htmlFor="request-service">What do you need? <span aria-hidden="true">*</span></label>
            <select id="request-service" required data-testid="select-request-service" {...form.register('service', { required: true })}>
              <option value="">Choose one service</option>
              {servicePages.map((item) => <option key={item.slug} value={item.slug}>{item.label}</option>)}
              <option value="other">Other / custom request</option>
            </select>
            <label htmlFor="request-quantity">Quantity or order size <span aria-hidden="true">*</span></label>
            <input id="request-quantity" required maxLength={120} placeholder="e.g. 100 cards, 20 uniforms, or not sure yet" data-testid="input-request-quantity" {...form.register('quantity', { validate: (value) => !!value.trim() })} />
            <label htmlFor="request-details">Your specifications <span aria-hidden="true">*</span></label>
            <textarea id="request-details" required maxLength={1200} rows={5} placeholder="Describe size, material, artwork, colours or any special requirements." data-testid="textarea-request-details" {...form.register('details', { validate: (value) => !!value.trim() })} />
            <div className="request-quote-row">
              <div><label htmlFor="request-deadline">When do you need it? <small>Optional</small></label><input id="request-deadline" maxLength={100} placeholder="e.g. next Friday" data-testid="input-request-deadline" {...form.register('deadline')} /></div>
              <div><label htmlFor="request-name">Your name <small>Optional</small></label><input id="request-name" maxLength={100} placeholder="How should we address you?" data-testid="input-request-name" {...form.register('name')} /></div>
            </div>
            <button type="submit" className="seo-btn seo-btn-primary request-quote-submit" data-testid="button-request-whatsapp">
              <FaWhatsapp size={20} aria-hidden="true" /> Continue to WhatsApp <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <p className="request-quote-help">WhatsApp opens with your brief ready to review. You decide when to send it.</p>
          </form>
        </Form>
      </main>
    </div>
  );
}