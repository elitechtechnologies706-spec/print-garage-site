import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { Route, Router, Switch, useLocation } from 'wouter';
import App from './App';
import NotFound from './pages/not-found';
import { ErrorBoundary } from './components/error-boundary';
import { LandingPage } from './seo/LandingPage';
import { RequestQuote } from './pages/RequestQuote';
import { PriceList } from './pages/PriceList';
import AdminViews from './pages/AdminViews';
import { servicePages, type ServicePage } from './seo/service-data';
import { applySeoHead, PRICE_LIST_META, PRICE_LIST_TITLE, QUOTE_META, QUOTE_TITLE, GALLERY_TITLE, GALLERY_META } from './seo/seo-head';

const LazyGalleryPage = lazy(() => import('./pages/GalleryPage').then((module) => ({ default: module.GalleryPage })));

function GalleryRoute({ component: Page = LazyGalleryPage }: { component?: ComponentType }) {
  useEffect(() => applySeoHead(undefined, { title: GALLERY_TITLE, meta: GALLERY_META, path: '/gallery' }), []);
  return <Suspense fallback={<main className="section"><div className="shell"><h1>Print Garage Gallery</h1><p role="status">Loading the gallery…</p></div></main>}><Page /></Suspense>;
}

function HomeRoute() {
  useEffect(() => applySeoHead(), []);
  return <App />;
}

function ServiceRoute({ service }: { service: ServicePage }) {
  useEffect(() => applySeoHead(service), [service]);
  return <LandingPage service={service} />;
}

function RequestQuoteRoute() {
  useEffect(() => applySeoHead(undefined, { title: QUOTE_TITLE, meta: QUOTE_META, path: '/request-a-quote' }), []);
  return <RequestQuote />;
}

function NotFoundRoute() {
  const [path] = useLocation();
  useEffect(() => applySeoHead(undefined, {
    title: 'Page not found | Print Garage',
    meta: 'This page could not be found. Explore Print Garage printing and branding services in Kampala.',
    path: path.split('?')[0],
    indexable: false,
  }), [path]);
  return <NotFound />;
}

function PriceListRoute() {
  useEffect(() => applySeoHead(undefined, { title: PRICE_LIST_TITLE, meta: PRICE_LIST_META, path: '/price-list' }), []);
  return <PriceList />;
}

export function Root({ ssrPath, ssrGalleryPage }: { ssrPath?: string; ssrGalleryPage?: ComponentType }) {
  return (
    <ErrorBoundary>
      <Router ssrPath={ssrPath}>
        <Switch>
          <Route path="/" component={HomeRoute} />
          <Route path="/request-a-quote" component={RequestQuoteRoute} />
          <Route path="/price-list" component={PriceListRoute} />
          <Route path="/gallery"><GalleryRoute component={ssrGalleryPage} /></Route>
          <Route path="/admin/views" component={AdminViews} />
          {servicePages.map((service) => (
            <Route path={service.path} key={service.slug}>
              <ServiceRoute service={service} />
            </Route>
          ))}
          <Route component={NotFoundRoute} />
        </Switch>
      </Router>
    </ErrorBoundary>
  );
}