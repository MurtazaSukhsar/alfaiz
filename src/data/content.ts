// Shapes and default values of everything the admin panel can edit (home sections + site settings).
// The admin saves each section to Supabase → site_content (one row per key). Before every dev/build,
// `scripts/supabase-pull.mjs` writes those rows to data/content.json; src/data/site.ts merges them over
// the defaults below. A section that was never edited simply uses its default.
// Safe to import in client components (no catalogue data in here).

export type Settings = {
  name: string;
  short: string;
  legal: string;
  url: string;
  phone: string;
  whatsapp: string;
  email: string;
  email2: string;
  street: string;
  city: string;
  country: string;
  mapsUrl: string;
  mapEmbed: string;
  instagram: string;
  instagramHandle: string;
  hours: string;
  announcements: string[];
  since: number;
  exportCountries: string[];
  popularSearches: string[];
};

/** One full-width slide of the home hero: a background photo that shows the products + the quote text. */
export type HeroSlide = {
  /** small line above the headline, e.g. "Power Tools · DeWALT, Makita, Bosch" */
  label: string;
  title1: string;
  /** second headline line, shown in red */
  title2: string;
  text: string;
  /** background photo (wide; the products should be in the right half) */
  image: string;
  /** which part of the photo stays visible on narrow screens */
  focus: 'left' | 'center' | 'right';
  /** category the “Explore” button opens */
  collection: string;
};
export type HeroContent = { slides: HeroSlide[] };

export type TrustItem = { icon: string; title: string; short: string; text: string };
export type BrandItem = { handle: string; name: string; logo?: string };
export type CategoryTile = { handle: string; title: string; image?: string };
export type EditBrand = { brand: string; name: string; note: string; products: { handle: string; label: string; spec: string }[] };
export type Industry = { slug: string; icon: string; title: string; text: string; image: string; cats: string[] };
export type Review = { name: string; text: string };
export type FaqItem = { q: string; a: string; links?: { label: string; href: string; external?: boolean }[] };
export type FaqGroup = { id: string; title: string; icon: 'cart' | 'truck' | 'card' | 'shield' | 'pin'; items: FaqItem[] };
export type FooterRange = { handle: string; title: string };

export type SiteContent = {
  settings: Settings;
  hero: HeroContent;
  trust: TrustItem[];
  brands: BrandItem[];
  categories: CategoryTile[];
  brandEdit: EditBrand[];
  industries: Industry[];
  reviews: Review[];
  faqs: FaqItem[];
  faqGroups: FaqGroup[];
  footer: FooterRange[];
};
export type ContentKey = keyof SiteContent;

export const defaultSettings: Settings = {
  name: 'Al Faiz Electric & Hardware',
  short: 'Al Faiz Hardware',
  legal: 'Al Faiz Electric & Hardware TR. L.L.C.',
  url: 'https://www.alfaizhardware.com',
  phone: '+971 55 858 4900',
  whatsapp: '971558584900',
  email: 'alfaizinfo@gmail.com',
  email2: 'hasanalfaiztr@gmail.com',
  street: '238 S115, BMW Road, Industrial Area 1',
  city: 'Sharjah',
  country: 'United Arab Emirates',
  mapsUrl: 'https://maps.google.com/?q=8C92%2BM4%20Sharjah',
  mapEmbed: 'https://maps.google.com/maps?q=8C92%2BM4%20Sharjah&z=16&output=embed',
  instagram: 'https://www.instagram.com/alfaiz.tools/',
  instagramHandle: '@alfaiz.tools',
  hours: '[OPENING HOURS]',
  announcements: ['Your one-stop online store for tools and equipment in the UAE', 'Supplying quality tools & equipment to businesses across the GCC'],
  since: 2019,
  exportCountries: ['Oman', 'Saudi Arabia', 'Iraq', 'the Maldives', 'Congo', 'Kenya', 'Mauritius'],
  popularSearches: ['DeWALT', 'Makita', 'Compressor', 'Non-sparking'],
};

const waHref = (s: Pick<Settings, 'whatsapp'>, text: string) => `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(text)}`;

/** Defaults for every section. Some FAQ answers use the current settings (phone, brands…). */
export function makeDefaults(s: Settings, brandNames?: string[]): Omit<SiteContent, 'settings'> {
  const brands: BrandItem[] = [
    { handle: 'dewalt', name: 'DeWALT' },
    { handle: 'makita', name: 'Makita' },
    { handle: 'bosch', name: 'Bosch' },
    { handle: 'milwaukee', name: 'Milwaukee' },
    { handle: 'stanley', name: 'Stanley' },
    { handle: 'black-decker', name: 'Black+Decker' },
    { handle: 'clarke', name: 'Clarke' },
    { handle: 'abac', name: 'ABAC' },
    { handle: 'shamal', name: 'Shamal' },
    { handle: 'sumake', name: 'Sumake' },
    { handle: 'genius-tools', name: 'Genius Tools' },
    { handle: 'edon', name: 'Edon' },
    { handle: 'selpro', name: 'Selpro' },
    { handle: 'vaultex', name: 'Vaultex' },
  ];
  const names = brandNames ?? brands.map((b) => b.name);
  const hoursKnown = !/^\[.*\]$/.test(s.hours.trim());
  const ex = s.exportCountries;

  return {
    hero: {
      slides: [
        {
          label: 'Power Tools · DeWALT, Makita, Bosch, Milwaukee',
          title1: 'Genuine tools,',
          title2: 'quoted fast.',
          text: 'Drills, grinders, saws and breakers for site and workshop. Send us your list — we reply with price, stock and delivery.',
          image: '/images/hero/power-tools.webp',
          focus: 'right',
          collection: 'power-tools',
        },
        {
          label: 'Air Compressors · Shamal, FIAC, ABAC',
          title1: 'Air compressors,',
          title2: 'ready for work.',
          text: 'Belt-drive and direct-drive compressors for workshops, garages and sites. Tell us the air you need and we’ll match the model.',
          image: '/images/hero/air-compressors.webp',
          focus: 'right',
          collection: 'air-compressors',
        },
        {
          label: 'Adhesives & Sealants · Bison, Araldite, Fevicol',
          title1: 'Adhesives & sealants,',
          title2: 'by the tube or drum.',
          text: 'Contact adhesives, epoxy, wood glue, silicone and PU foam — single packs or bulk for contractors.',
          image: '/images/hero/adhesives-sealants.webp',
          focus: 'right',
          collection: 'adhesives-sealants',
        },
        {
          label: 'Non-Sparking Tools · Oil & gas, marine, petrochemical',
          title1: 'Non-sparking tools,',
          title2: 'for hazardous areas.',
          text: 'Spanners, hammers, sockets and pliers in aluminium bronze and beryllium copper — single tools or full kits.',
          image: '/images/hero/non-sparking-tools.webp',
          focus: 'right',
          collection: 'non-sparking-tools',
        },
        {
          label: 'Site Equipment · Clarke, Eagle, Rubi',
          title1: 'Site equipment,',
          title2: 'from one supplier.',
          text: 'Cement mixers, generators, tile cutters, breakers and scaffolding for construction sites across the UAE.',
          image: '/images/hero/site-equipment.webp',
          focus: 'right',
          collection: 'construction-tools',
        },
        {
          label: 'Welding · Edon, Kiswel',
          title1: 'Welding & cutting,',
          title2: 'supplied in bulk.',
          text: 'Welding machines, electrodes and cutting discs for fabrication shops, workshops and shipyards.',
          image: '/images/hero/welding-machines.webp',
          focus: 'right',
          collection: 'welding',
        },
      ],
    },

    trust: [
      { icon: 'shield', title: 'Genuine brands', short: 'DeWALT, Makita, Bosch & more', text: 'DeWALT, Makita, Bosch, Milwaukee and more under one roof.' },
      { icon: 'truck', title: 'UAE-wide delivery', short: 'To your site or workshop', text: 'Delivered to your site or workshop across the Emirates.' },
      { icon: 'globe', title: 'Export ready', short: 'Oman, KSA, Iraq, Africa', text: 'Supplying Oman, Saudi Arabia, Iraq, Africa and beyond.' },
      { icon: 'card', title: 'Flexible payment', short: 'Cash, card, transfer, cheque', text: 'Cash, card, bank transfer or cheque.' },
    ],

    brands,

    categories: [
      { handle: 'power-tools', title: 'Power Tools', image: '/images/ranges/power-tools.jpg' },
      { handle: 'air-compressors', title: 'Air Compressors', image: '/images/ranges/air-compressors.jpg' },
      { handle: 'non-sparking-tools', title: 'Non-Sparking Tools', image: '/images/ranges/non-sparking-tools.jpg' },
      { handle: 'pneumatic-tools', title: 'Pneumatic Tools', image: '/images/ranges/pneumatic-tools.jpg' },
      { handle: 'garage-tools', title: 'Garage Tools', image: '/images/ranges/garage-tools.jpg' },
      { handle: 'fastners', title: 'Fasteners', image: '/images/ranges/fastners.jpg' },
      { handle: 'drill-bits', title: 'Drill Bits', image: '/images/ranges/drill-bits.jpg' },
      { handle: 'abrasives', title: 'Abrasives', image: '/images/ranges/abrasives.jpg' },
      { handle: 'safety-products', title: 'Safety Products', image: '/images/ranges/safety-products.jpg' },
      { handle: 'caster-wheels', title: 'Caster Wheels' },
      { handle: 'pressure-washers', title: 'Pressure Washers' },
      { handle: 'water-pumps', title: 'Water Pumps' },
      { handle: 'generator', title: 'Generators' },
      { handle: 'engines', title: 'Engines' },
      { handle: 'adhesives-sealants', title: 'Adhesives & Sealants' },
      { handle: 'packaging-and-sealing', title: 'Packaging & Sealing' },
      { handle: 'mesh', title: 'Mesh' },
      { handle: 'welding', title: 'Welding' },
      { handle: 'construction-tools', title: 'Construction Tools' },
      { handle: 'wood-works', title: 'Wood Works' },
      { handle: 'scaffolding', title: 'Scaffolding' },
    ],

    brandEdit: [
      {
        brand: 'dewalt',
        name: 'DeWALT',
        note: 'From 18V XR cordless kits to FLEXVOLT saws and SDS-Max breakers.',
        products: [
          { handle: 'dewalt-dck355p2t-qw-18v-xr-3pc-kit-2-5-0ah-batteries', label: '18V XR 3-piece kit', spec: '2 × 5.0Ah batteries · TSTAK case' },
          { handle: 'dewalt-d25966-gb-28mm-hex-18kg-demolition-hammer-1800w-41j-brushless-heavy-duty-concrete-breaker-professional-hex-chipping-hammer-perform-protect-avc-genuine-dewalt-uae-al-faiz-hardware', label: 'Demolition hammer', spec: '18kg · 28mm HEX · 1800W' },
          { handle: 'dewalt-dhs780t2-gb-54v-xr-flexvolt-12-inch-cordless-brushless-mitre-saw-al-faiz-hardware-uae', label: 'FLEXVOLT mitre saw', spec: '54V · 305mm blade' },
        ],
      },
      {
        brand: 'makita',
        name: 'Makita',
        note: 'XGT and LXT cordless power for drilling, breaking and mixing.',
        products: [
          { handle: 'makita-rotary-hammer-lxt-dhr400zkun-36v-brushless-sds-max-al-faiz-electric-and-hardware', label: 'LXT rotary hammer', spec: '36V brushless · SDS-Max' },
          { handle: 'makita-hm004g-xgt-80v-demolition-breaker-72-8j-28-6mm-hex-al-faiz-hardware-uae', label: 'XGT demolition breaker', spec: '80V · 72.8J' },
          { handle: 'makita-angle-grinder-lxt-dga454rfj-18v-cordless-brushless-grinder-115-mm-al-faiz-electric-and-hardware', label: 'LXT angle grinder', spec: '18V brushless · 115mm' },
        ],
      },
      {
        brand: 'bosch',
        name: 'Bosch',
        note: 'Professional tools for drilling, cutting and site levelling.',
        products: [
          { handle: 'bosch-gbh-2-26-dfr-professional-rotary-hammer-26mm-800w-with-quick-release-chuck', label: 'Rotary hammer', spec: 'SDS-plus · 26mm · 800W' },
          { handle: 'bosch-gsb-19-2-re-professional-impact-drill-16mm-850w-2-speed', label: 'Impact drill', spec: '16mm · 850W · 2-speed' },
          { handle: 'bosch-gsa-18v-li-professional-cordless-reciprocating-saw-3ah-battery-18v', label: 'Cordless recip saw', spec: '18V · 3Ah battery' },
        ],
      },
      {
        brand: 'milwaukee',
        name: 'Milwaukee',
        note: 'M18 and M12 FUEL cordless tools for installers and fitters.',
        products: [
          { handle: 'milwaukee-m18fdd2-502x-m18-fuel-18v-cordless-drill-driver-kit-13mm-135nm-2-speed-2-x-5-0ah-batteries-m12-18-fc-charger-hd-box', label: 'M18 FUEL drill driver kit', spec: '135Nm · 2 × 5.0Ah' },
          { handle: 'milwaukee-m18bpd-202c-m18-18v-cordless-percussion-drill-13mm-50nm-2-speed-28-800-bpm-2-x-2-0ah-batteries-m12-18-c-charger', label: 'Percussion drill', spec: '18V · 50Nm' },
          { handle: 'milwaukee-m12-fddxkit-202x-m12-fuel-12v-4-in-1-installation-drill-driver-with-interchangeable-heads-2-x-2-0ah-batteries-charger-hd-box', label: '4-in-1 installation driver', spec: 'M12 FUEL · 12V' },
        ],
      },
      {
        brand: 'clarke',
        name: 'Clarke',
        note: 'Workshop storage, site machines and Clarke Pro cordless tools.',
        products: [
          { handle: 'clarke-tool-chests-3-drawer-7-drawer-heavy-duty-with-ball-bearing-slides', label: 'Tool chests', spec: '3 & 7 drawer · ball-bearing slides' },
          { handle: 'clarke-pro-cp-wc125-wall-chaser-1800w-125mm-diamond-disc-electric-wall-groove-cutter-adjustable-depth-width-for-electricians-plumbers-mep-contractors-uae-al-faiz-hardware', label: 'Wall chaser', spec: '1800W · 125mm' },
          { handle: 'clarke-pro-cp-ds225a-electric-drywall-sander-225mm-800w-long-reach-wall-ceiling-sander-variable-speed-800-1800-rpm-dust-extraction-for-gypsum-board-plasterboard-plaster-walls-uae-al-faiz-hardware', label: 'Drywall sander', spec: '225mm · 800W' },
        ],
      },
    ],

    industries: [
      { slug: 'construction', icon: 'construction', title: 'Construction', text: 'Hardware, power tools, fasteners and site supplies.', image: '/images/industries/construction.webp', cats: ['construction-tools', 'power-tools', 'fastners', 'scaffolding', 'safety-products'] },
      { slug: 'manufacturing', icon: 'factory', title: 'Manufacturing', text: 'Industrial tools, maintenance equipment and consumables.', image: '/images/industries/manufacturing.webp', cats: ['air-compressors', 'pneumatic-tools', 'abrasives', 'welding', 'safety-products'] },
      { slug: 'oil-gas', icon: 'drop', title: 'Oil & Gas', text: 'Heavy-duty hardware, safety equipment and industrial products.', image: '/images/industries/oil-gas.webp', cats: ['non-sparking-tools', 'safety-products', 'air-compressors', 'generator'] },
      { slug: 'marine', icon: 'anchor', title: 'Marine & Shipbuilding', text: 'Corrosion-resistant fasteners, tools and marine hardware.', image: '/images/industries/marine.webp', cats: ['non-sparking-tools', 'welding', 'fastners', 'pressure-washers', 'abrasives'] },
      { slug: 'electrical', icon: 'bolt', title: 'Electrical Contractors', text: 'Electrical tools, accessories and installation supplies.', image: '/images/industries/electrical.webp', cats: ['power-tools', 'drill-bits', 'construction-tools', 'safety-products', 'fastners'] },
      { slug: 'hvac', icon: 'fan', title: 'HVAC', text: 'Installation tools, accessories and maintenance supplies.', image: '/images/industries/hvac.webp', cats: ['drill-bits', 'fastners', 'adhesives-sealants', 'power-tools', 'packaging-and-sealing'] },
      { slug: 'automotive', icon: 'car', title: 'Automotive', text: 'Workshop tools, lubricants and repair equipment.', image: '/images/industries/automotive.webp', cats: ['garage-tools', 'pneumatic-tools', 'air-compressors', 'pressure-washers'] },
      { slug: 'diy', icon: 'home', title: 'DIY & Home Improvement', text: 'Quality tools and hardware for homes and small projects.', image: '/images/industries/diy.webp', cats: ['power-tools', 'drill-bits', 'wood-works', 'garage-tools', 'adhesives-sealants'] },
    ],

    reviews: [
      { name: 'Huzaifa', text: 'Excellent quality products.' },
      { name: 'Mohammad', text: 'A great place to find a wide range of products in one location.' },
      { name: 'Arif', text: 'Widest range of DeWALT products available with them.' },
      { name: 'Diaa Alhalbi', text: 'Good.' },
    ],

    faqs: [
      { q: 'Where do you deliver?', a: 'We deliver across the UAE and export to Oman, Saudi Arabia, Iraq and Africa. Our showroom address and map are on the Contact page.' },
      { q: 'What are the payment terms at Al Faiz Electric & Hardware TR. L.L.C?', a: 'We accept Cash, Credit Card, Bank Transfer, Cheque (Post Delivery), and Advance Payment Before Delivery.' },
      { q: 'Do you offer delivery services across the UAE?', a: 'Yes, Al Faiz Electric & Hardware TR. L.L.C provides delivery service across the UAE. Terms and conditions apply.' },
      { q: 'Do your products come with a warranty?', a: 'Yes, products eligible for a manufacturer warranty come with service warranty only. Spare parts are chargeable.' },
      {
        q: 'What does Al Faiz Electric & Hardware supply?',
        a: 'Power tools, air compressors, non-sparking tools, pneumatic tools, fasteners, welding consumables, mesh, safety products and more — from brands including DeWALT, Makita, Bosch, Milwaukee, ABAC and FIAC.',
      },
      { q: 'Do you supply outside the UAE?', a: `Yes — we supply clients in ${ex.slice(0, -1).join(', ')} and ${ex.at(-1)}.` },
    ],

    faqGroups: [
      {
        id: 'ordering',
        title: 'Ordering & cart',
        icon: 'cart',
        items: [
          {
            q: 'How do I place an order on the website?',
            a: 'Open a product, choose the quantity and press “Add to cart”. When you are ready, open your cart, check the quantities, add a note (delivery location, company name, deadline) and press “Checkout on WhatsApp” or “Checkout by email”. Our sales team confirms price, stock and delivery, and then you pay.',
            links: [{ label: 'Open your cart', href: '/cart/' }],
          },
          {
            q: 'Why don’t I see prices on the website?',
            a: 'Prices are confirmed by our sales team for your exact quantity and delivery location, so products show “Price on request”. Add what you need to your cart and check out — we reply with prices for the whole list.',
          },
          {
            q: 'Do I need to create an account?',
            a: 'No. There is no sign-up. Your cart is saved on your own device until you clear it, and your details are only shared when you send your order on WhatsApp or email.',
          },
          {
            q: 'Can I order in bulk or send a BOQ?',
            a: 'Yes. Add the items to your cart and check out in one go, or send us your full list or BOQ on WhatsApp or email and we will quote everything together.',
            links: [{ label: 'Send a list on WhatsApp', href: waHref(s, 'Hello Al Faiz, please quote for my list:'), external: true }],
          },
          { q: 'Can I change or cancel an order?', a: 'Message our sales team as soon as possible with your name and order details, and they will update or cancel it for you.' },
          { q: 'A product shows “Sold out”. Can I still get it?', a: 'Send us the product name or link and our team will tell you the lead time.' },
        ],
      },
      {
        id: 'delivery',
        title: 'Delivery & export',
        icon: 'truck',
        items: [
          { q: 'Do you offer delivery services across the UAE?', a: 'Yes, Al Faiz Electric & Hardware TR. L.L.C provides delivery service across the UAE. Terms and conditions apply. Delivery time and any delivery charges are confirmed by our sales team together with your order.' },
          { q: 'Do you supply outside the UAE?', a: `Yes — we supply clients in ${ex.slice(0, -1).join(', ')} and ${ex.at(-1)}. Contact us with your list and destination.` },
          { q: 'How do I track my order?', a: 'Orders are handled personally by our sales team rather than through online tracking. Message them with your name and order details for an update.' },
        ],
      },
      {
        id: 'payment',
        title: 'Payment & invoices',
        icon: 'card',
        items: [
          { q: 'What are the payment terms?', a: 'We accept Cash, Credit Card, Bank Transfer, Cheque (Post Delivery), and Advance Payment Before Delivery.' },
          { q: 'Can I pay online on the website?', a: 'No — there is no online card payment on this website. You pay after our sales team has confirmed your order, using one of the methods above.' },
          { q: 'Can I get an invoice for my company?', a: 'Yes, ask our sales team for an invoice with your company details when you place your order.' },
        ],
      },
      {
        id: 'products',
        title: 'Products & warranty',
        icon: 'shield',
        items: [
          {
            q: 'What does Al Faiz Electric & Hardware supply?',
            a: 'Power tools, air compressors, non-sparking tools, pneumatic tools, fasteners, welding consumables, mesh, safety products and more — from brands including DeWALT, Makita, Bosch, Milwaukee, ABAC and FIAC.',
            links: [{ label: 'Browse all products', href: '/collections/all/' }],
          },
          {
            q: 'Which brands do you stock?',
            a: `${names.join(', ')} and more. Each brand has its own page listing everything we carry from them.`,
            links: [{ label: 'See our brands', href: '/#brands' }],
          },
          { q: 'Do your products come with a warranty?', a: 'Yes, products eligible for a manufacturer warranty come with service warranty only. Spare parts are chargeable. Ask our team to confirm the warranty for a specific product.' },
          {
            q: 'What are non-sparking tools?',
            a: 'Hand tools made from brass, aluminium bronze and beryllium copper for hazardous areas such as oil & gas, marine and petrochemical sites, where a stray spark is a real risk.',
            links: [{ label: 'Shop non-sparking tools', href: '/collections/non-sparking-tools/' }],
          },
          { q: 'Can you source a product that isn’t on the website?', a: 'Send us the product name or model number on WhatsApp and our team will check whether we can supply it.' },
        ],
      },
      {
        id: 'company',
        title: 'Showroom & contact',
        icon: 'pin',
        items: [
          {
            q: 'Where do you deliver?',
            a: 'We deliver across the UAE and export to Oman, Saudi Arabia, Iraq and Africa. Our showroom address and map are on the Contact page.',
            links: [{ label: 'Contact page', href: '/pages/contact/' }],
          },
          { q: 'What are your opening hours?', a: hoursKnown ? `${s.hours}.` : `Please call or WhatsApp ${s.phone} to confirm our opening hours before you visit.` },
          {
            q: 'How can I contact you?',
            a: `Call or WhatsApp ${s.phone}, email ${s.email} or ${s.email2}, or follow us on Instagram ${s.instagramHandle}.`,
            links: [{ label: 'Contact page', href: '/pages/contact/' }],
          },
          { q: 'Which industries do you supply?', a: `Construction, manufacturing, oil & gas, marine & shipbuilding, electrical contractors, HVAC, automotive and DIY & home improvement — across the UAE and GCC since ${s.since}.` },
        ],
      },
    ],

    footer: [
      { handle: 'power-tools', title: 'Power Tools' },
      { handle: 'air-compressors', title: 'Air Compressors' },
      { handle: 'non-sparking-tools', title: 'Non-Sparking Tools' },
      { handle: 'pneumatic-tools', title: 'Pneumatic Tools' },
      { handle: 'fastners', title: 'Fasteners' },
      { handle: 'safety-products', title: 'Safety Products' },
      { handle: 'welding', title: 'Welding' },
    ],
  };
}

/** Icons the admin can choose for trust items and industries (names from src/components/Icons.tsx). */
export const iconChoices = ['shield', 'truck', 'globe', 'card', 'construction', 'factory', 'drop', 'anchor', 'bolt', 'fan', 'car', 'home', 'box', 'tag', 'pin', 'clock', 'phone', 'mail', 'chat', 'check', 'help', 'cart'];
