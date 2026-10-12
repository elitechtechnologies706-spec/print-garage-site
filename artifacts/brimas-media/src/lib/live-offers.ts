// Prices and enquiry text supplied by Print Garage. VAT status was not specified.
export const services = [
  { title: "Website Development", price: "From $49.99", wa: "Website Dev $49.99" },
  {
    title: "Auto Content Studio",
    price: "Licensed via BrimasMedia",
    wa: "Auto Studio demo",
    badge: "NEW",
    offering: {
      title: "Social Media Management",
      description: "Our Auto Content Studio handles clients’ social media management across all social media platforms automatically, running on autopilot.",
      price: "From $30 - per platform",
      wa: "Social Mgmt $30",
    },
  },
  {
    title: "Podcast Recording - Videography & Photography",
    price: "From $25",
    description: "Book our team at your location, or come to our studio for your recording session.",
    type: "2-buttons",
    btns: [
      { label: "We come to your location", wa: "Hello Print Garage, I would like to book podcast recording at my location. Please confirm availability and travel costs." },
      { label: "Visit our studio", wa: "Hello Print Garage, I would like to come to your studio for podcast recording. Please confirm your location and available sessions." },
    ],
  },
];

export const textiles: Record<string, { name: string; price: string; note?: string }[]> = {
  "EVERYDAY ESSENTIALS": [
    { name: "Handkerchiefs – Adults & Children (Pack of 5)", price: "UGX 15,000" },
  ],
  "CORE BASICS COLLECTION": [
    { name: "Men's Vests – Premium Quality (Pack of 3, White)", price: "UGX 25,000" },
    { name: "Round Neck T-Shirts – Best Seller (White) – S-L Pack of 3", price: "UGX 29,900" },
    { name: "Round Neck T-Shirts – Best Seller (White) – XL-2XL Pack of 3", price: "UGX 37,500" },
    { name: "V-Neck T-Shirts – S-L Pack of 3", price: "UGX 43,650" },
    { name: "V-Neck T-Shirts – XL-2XL Pack of 3", price: "UGX 48,000" },
  ],
  "WORKWEAR & UNIFORMS": [
    { name: "Two-Piece Overalls – NYTiL Drill + Reflective Tape", price: "UGX 85,000 - 90,000", note: "Branding extra" },
    { name: "Overcoats – PV – M-L", price: "UGX 35,000" },
    { name: "Overcoats – PV – XL-2XL", price: "UGX 45,000" },
    { name: "Maids / Cleaners / Nurses Dresses – PV", price: "UGX 45,000" },
    { name: "Maids Dresses – Gentleman", price: "UGX 55,000" },
    { name: "Medical Scrubs – Gentleman", price: "UGX 51,700" },
    { name: "Coveralls – Short Sleeve PV", price: "UGX 51,400" },
    { name: "Coveralls – Long Sleeve PV", price: "UGX 55,000" },
    { name: "Single-Sided Aprons – PV", price: "UGX 25,000" },
  ],
};
