// Set this to the generated deployment URL first; a custom domain can be added later.
const configuredOrigin = import.meta.env?.VITE_SITE_URL?.trim();
export const SITE_URL = configuredOrigin ? new URL(configuredOrigin).origin : '';
if (SITE_URL && !/^https?:\/\//.test(SITE_URL)) {
  throw new Error('VITE_SITE_URL must be an http(s) public website URL.');
}
export const SITE = {
  name: 'Print Garage',
  phone: '+256780347272',
  displayPhone: '+256 780 347272',
  whatsapp: 'https://wa.me/256780347272',
  email: 'printgarage101@gmail.com',
  address: 'Peacock Building, 2nd Floor, Kampala, Uganda',
  streetAddress: 'Peacock Building, 2nd Floor',
  primary: '#FF6B00',
  secondary: '#111111',
} as const;
