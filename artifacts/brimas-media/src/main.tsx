import { createRoot, hydrateRoot } from 'react-dom/client';
import { Root } from './routes';

import './index.css';

const container = document.getElementById('root')!;
const options = {
  // Keeps caught errors off reportError(), which would raise the dev overlay.
  onCaughtError: (error: unknown, errorInfo: { componentStack?: string | null }) => {
    console.error(error, errorInfo.componentStack);
  },
};

if (container.hasChildNodes()) {
  hydrateRoot(container, <Root />, options);
} else {
  createRoot(container, options).render(<Root />);
}
