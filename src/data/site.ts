// Business details and home-page content. Edit this file to change contact info,
// featured products, brands strip, FAQs and reviews. Safe to import anywhere.

export const site = {
  name: 'Al Faiz Electric & Hardware',
  short: 'Al Faiz Hardware',
  legal: 'Al Faiz Electric & Hardware TR. L.L.C.',
  url: 'https://www.alfaizhardware.com',
  phone: '+971 55 858 4900',
  phoneHref: 'tel:+971558584900',
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
  since: 2019,
  exportCountries: ['Oman', 'Saudi Arabia', 'Iraq', 'the Maldives', 'Congo', 'Kenya', 'Mauritius'],
  credit: { name: 'Farwings', url: 'https://www.farwingstech.com' },
};

export function waLink(text = 'Hello Al Faiz, I would like a quote.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const popularSearches = ['DeWALT', 'Makita', 'Compressor', 'Non-sparking'];

/** "Our Product Ranges" grid on the home page. Images live in public/images/ranges. */
export const ranges = [
  { handle: 'power-tools', title: 'Power Tools', image: '/images/ranges/power-tools.jpg' },
  { handle: 'air-compressors', title: 'Air Compressors', image: '/images/ranges/air-compressors.jpg' },
  { handle: 'non-sparking-tools', title: 'Non-Sparking Tools', image: '/images/ranges/non-sparking-tools.jpg' },
  { handle: 'pneumatic-tools', title: 'Pneumatic Tools', image: '/images/ranges/pneumatic-tools.jpg' },
  { handle: 'garage-tools', title: 'Garage Tools', image: '/images/ranges/garage-tools.jpg' },
  { handle: 'fastners', title: 'Fasteners', image: '/images/ranges/fastners.jpg' },
  { handle: 'drill-bits', title: 'Drill Bits', image: '/images/ranges/drill-bits.jpg' },
  { handle: 'abrasives', title: 'Abrasives', image: '/images/ranges/abrasives.jpg' },
  { handle: 'safety-products', title: 'Safety Products', image: '/images/ranges/safety-products.jpg' },
];

/** Scrolling "Shop by brand" logos. Each links to /collections/<handle>/. Logos live in public/brands. */
export const brandStrip = [
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

/** Home hero slider: one slide per brand. `products` are Shopify handles shown left, centre, right. */
export const heroSlides = [
  {
    brand: 'dewalt',
    name: 'DeWALT',
    tagline: 'Corded and cordless tools built for the job site.',
    bg: '#FFF4D3',
    accent: '#FEBD17',
    onAccent: '#15171A',
    products: [
      { handle: 'dewalt-dwe7492-qs-250mm-table-saw-2000w-professional-portable-table-saw-825mm-rip-capacity-77mm-depth-of-cut-30mm-bore-genuine-dewalt-uae-al-faiz-hardware', label: 'Table saw' },
      { handle: 'dewalt-dwe5615-gb-190mm-circular-saw-1500w-68mm-professional-wood-cutting-circular-saw-5500-rpm-30mm-bore-airlock-compatible-genuine-dewalt-uae-al-faiz-hardware-2-h1-tag', label: 'Circular saw' },
      { handle: 'dewalt-d25810k-lx-110v-sds-max-chipping-hammer-1050w-7-1j-professional-demolition-hammer-5-6kg-lightweight-concrete-breaker-anti-vibration-genuine-dewalt-uae-al-faiz-hardware', label: 'SDS-Max hammer' },
      { handle: 'dewalt-dwe6423-b5-125mm-random-orbital-sander-280w-variable-speed-palm-sander-professional-wood-paint-finishing-sander-hook-loop-sanding-pad-genuine-dewalt-uae-al-faiz-hardware', label: 'Orbital sander' },
      { handle: 'dewalt-dwe349-b5-650w-top-handle-compact-jigsaw-variable-speed-professional-jig-saw-85mm-wood-cutting-capacity-orbital-action-genuine-dewalt-supplier-uae-al-faiz-hardware', label: 'Jigsaw' },
    ],
  },
  {
    brand: 'makita',
    name: 'Makita',
    tagline: 'XGT 40V and LXT 18V cordless tools for heavy work.',
    bg: '#E2F3F4',
    accent: '#00909E',
    onAccent: '#FFFFFF',
    products: [
      { handle: 'makita-slide-compound-miter-saw-ls1019l-1-510-w-260-mm-blade-al-faiz-electric-and-hardware', label: 'Mitre saw' },
      { handle: 'makita-random-orbit-polisher-lxt-dpo600rte-18v-cordless-polisher-150-mm-al-faiz-electric-and-hardware', label: 'Polisher' },
      { handle: 'makita-hr002g-xgt-40v-max-sds-plus-28mm-combination-hammer-3-2j-al-faiz-hardware-uae', label: 'XGT rotary hammer' },
      { handle: 'makita-tw001gz-xgt-40v-max-3-4-impact-wrench-1800nm-al-faiz-hardware-uae', label: 'Impact wrench' },
      { handle: 'makita-reciprocating-saw-lxt-djr360z-36v-brushless-cordless-saw-al-faiz-electric-and-hardware', label: 'Recip saw' },
    ],
  },
  {
    brand: 'bosch',
    name: 'Bosch',
    tagline: 'Professional tools for drilling, cutting and grinding.',
    bg: '#E5EEF7',
    accent: '#005691',
    onAccent: '#FFFFFF',
    products: [
      { handle: 'bosch-gst-650-professional-jigsaw-450w-variable-speed-compact-design', label: 'Jigsaw' },
      { handle: 'bosch-gws-26-230-b-professional-angle-grinder-230mm-2600w-with-vibration-control', label: 'Angle grinder' },
      { handle: 'bosch-gsr-180-li-cordless-drill-driver-18v-x-2ah-compact-powerful', label: 'Cordless drill' },
      { handle: 'bosch-gsh-7-vc-demolition-hammer-sds-max-1500w-13j-7kg', label: 'Demolition hammer' },
      { handle: 'bosch-gpo-14-ce-professional-polisher-1400w-750-3000-rpm-ergonomic-handle', label: 'Polisher' },
    ],
  },
  {
    brand: 'milwaukee',
    name: 'Milwaukee',
    tagline: 'M18 cordless drills, drivers and sanders.',
    bg: '#FBE7E9',
    accent: '#C8102E',
    onAccent: '#FFFFFF',
    products: [
      { handle: 'milwaukee-m18bos125-0-m18-18v-125mm-cordless-random-orbital-sander-12-000-opm-2-4mm-orbit-variable-speed-bare-tool', label: 'Orbital sander' },
      { handle: 'milwaukee-m12-fddxkit-202x-m12-fuel-12v-4-in-1-installation-drill-driver-with-interchangeable-heads-2-x-2-0ah-batteries-charger-hd-box', label: '4-in-1 driver' },
      { handle: 'milwaukee-m18fdd2-502x-m18-fuel-18v-cordless-drill-driver-kit-13mm-135nm-2-speed-2-x-5-0ah-batteries-m12-18-fc-charger-hd-box', label: 'M18 FUEL drill' },
      { handle: 'milwaukee-m18bdd-0-m18-compact-cordless-drill-driver-18v-13mm-chuck-60nm-2-speed-bare-tool', label: 'Compact drill' },
      { handle: 'milwaukee-m18bpd-202c-m18-18v-cordless-percussion-drill-13mm-50nm-2-speed-28-800-bpm-2-x-2-0ah-batteries-m12-18-c-charger', label: 'Percussion drill' },
    ],
  },
  {
    brand: 'clarke',
    name: 'Clarke',
    tagline: 'Clarke Pro cordless and corded power tools.',
    bg: '#FFEFE4',
    accent: '#E8641B',
    onAccent: '#FFFFFF',
    products: [
      { handle: 'clarke-electric-cement-mixer-180l-clecm180-heavy-duty-concrete-mixing-machine-portable-construction-cement-mixer-uae-al-faiz-hardware-sharjah', label: 'Cement mixer' },
      { handle: 'clarke-pro-cp-mcs150-cordless-circular-saw-150mm-6-21v-brushless-multi-cutter-saw-48mm-cut-depth-laser-guide-0-45-bevel-tct-blade-for-wood-plywood-sheet-materials-uae-al-faiz-hardware', label: 'Circular saw' },
      { handle: 'clarke-pro-cp-ciw21-cordless-impact-wrench-21v-800-n-m-high-torque-brushless-1-2-square-drive-lug-nut-remover-for-car-truck-construction-battery-impact-gun-uae-al-faiz-hardware', label: 'Impact wrench' },
      { handle: 'clarke-pro-plus-9-inch-angle-grinder-3000w-cp-ag3000-heavy-duty-industrial-cutting-grinding-machine-230mm-professional-power-tool-uae-al-faiz-hardware-sharjah', label: 'Angle grinder' },
      { handle: 'clarke-table-saw-1800w-254mm-blade-diameter-4200rpm', label: 'Table saw' },
    ],
  },
];

/** "The Brand Edit" magazine section on the home page: three key tools per brand. */
export const brandEdit = [
  {
    brand: 'dewalt',
    note: 'From 18V XR cordless kits to FLEXVOLT saws and SDS-Max breakers.',
    products: [
      { handle: 'dewalt-dck355p2t-qw-18v-xr-3pc-kit-2-5-0ah-batteries', label: '18V XR 3-piece kit', spec: '2 × 5.0Ah batteries · TSTAK case' },
      { handle: 'dewalt-d25966-gb-28mm-hex-18kg-demolition-hammer-1800w-41j-brushless-heavy-duty-concrete-breaker-professional-hex-chipping-hammer-perform-protect-avc-genuine-dewalt-uae-al-faiz-hardware', label: 'Demolition hammer', spec: '18kg · 28mm HEX · 1800W' },
      { handle: 'dewalt-dhs780t2-gb-54v-xr-flexvolt-12-inch-cordless-brushless-mitre-saw-al-faiz-hardware-uae', label: 'FLEXVOLT mitre saw', spec: '54V · 305mm blade' },
    ],
  },
  {
    brand: 'makita',
    note: 'XGT and LXT cordless power for drilling, breaking and mixing.',
    products: [
      { handle: 'makita-rotary-hammer-lxt-dhr400zkun-36v-brushless-sds-max-al-faiz-electric-and-hardware', label: 'LXT rotary hammer', spec: '36V brushless · SDS-Max' },
      { handle: 'makita-hm004g-xgt-80v-demolition-breaker-72-8j-28-6mm-hex-al-faiz-hardware-uae', label: 'XGT demolition breaker', spec: '80V · 72.8J' },
      { handle: 'makita-angle-grinder-lxt-dga454rfj-18v-cordless-brushless-grinder-115-mm-al-faiz-electric-and-hardware', label: 'LXT angle grinder', spec: '18V brushless · 115mm' },
    ],
  },
  {
    brand: 'bosch',
    note: 'Professional tools for drilling, cutting and site levelling.',
    products: [
      { handle: 'bosch-gbh-2-26-dfr-professional-rotary-hammer-26mm-800w-with-quick-release-chuck', label: 'Rotary hammer', spec: 'SDS-plus · 26mm · 800W' },
      { handle: 'bosch-gsb-19-2-re-professional-impact-drill-16mm-850w-2-speed', label: 'Impact drill', spec: '16mm · 850W · 2-speed' },
      { handle: 'bosch-gsa-18v-li-professional-cordless-reciprocating-saw-3ah-battery-18v', label: 'Cordless recip saw', spec: '18V · 3Ah battery' },
    ],
  },
  {
    brand: 'milwaukee',
    note: 'M18 and M12 FUEL cordless tools for installers and fitters.',
    products: [
      { handle: 'milwaukee-m18fdd2-502x-m18-fuel-18v-cordless-drill-driver-kit-13mm-135nm-2-speed-2-x-5-0ah-batteries-m12-18-fc-charger-hd-box', label: 'M18 FUEL drill driver kit', spec: '135Nm · 2 × 5.0Ah' },
      { handle: 'milwaukee-m18bpd-202c-m18-18v-cordless-percussion-drill-13mm-50nm-2-speed-28-800-bpm-2-x-2-0ah-batteries-m12-18-c-charger', label: 'Percussion drill', spec: '18V · 50Nm' },
      { handle: 'milwaukee-m12-fddxkit-202x-m12-fuel-12v-4-in-1-installation-drill-driver-with-interchangeable-heads-2-x-2-0ah-batteries-charger-hd-box', label: '4-in-1 installation driver', spec: 'M12 FUEL · 12V' },
    ],
  },
  {
    brand: 'clarke',
    note: 'Workshop storage, site machines and Clarke Pro cordless tools.',
    products: [
      { handle: 'clarke-tool-chests-3-drawer-7-drawer-heavy-duty-with-ball-bearing-slides', label: 'Tool chests', spec: '3 & 7 drawer · ball-bearing slides' },
      { handle: 'clarke-pro-cp-wc125-wall-chaser-1800w-125mm-diamond-disc-electric-wall-groove-cutter-adjustable-depth-width-for-electricians-plumbers-mep-contractors-uae-al-faiz-hardware', label: 'Wall chaser', spec: '1800W · 125mm' },
      { handle: 'clarke-pro-cp-ds225a-electric-drywall-sander-225mm-800w-long-reach-wall-ceiling-sander-variable-speed-800-1800-rpm-dust-extraction-for-gypsum-board-plasterboard-plaster-walls-uae-al-faiz-hardware', label: 'Drywall sander', spec: '225mm · 800W' },
    ],
  },
];

/** Featured products tabs (product handles from Shopify, with the small label shown on each card). */
export const featuredTabs = [
  {
    id: 'power',
    label: 'Power tools',
    items: [
      { handle: 'dewalt-dck355p2t-qw-18v-xr-3pc-kit-2-5-0ah-batteries', tag: '18V XR' },
      { handle: 'bosch-gbh-2-26-dfr-professional-rotary-hammer-26mm-800w-with-quick-release-chuck', tag: 'SDS-plus' },
      { handle: 'makita-angle-grinder-lxt-dga454rfj-18v-cordless-brushless-grinder-115-mm-al-faiz-electric-and-hardware', tag: '18V LXT' },
      { handle: 'dewalt-dhs780t2-gb-54v-xr-flexvolt-12-inch-cordless-brushless-mitre-saw-al-faiz-hardware-uae', tag: '54V FlexVolt' },
    ],
  },
  {
    id: 'ns',
    label: 'Non-sparking',
    items: [
      { handle: 'brass-non-sparking-combination-pliers-spark-resistant-safety-pliers-explosion-proof-brass-combination-pliers-6-7-8-10-industrial-hand-tools-supplier-uae-al-faiz-hardware', tag: 'Brass' },
      { handle: 'non-sparking-combination-wrench-aluminium-bronze-beryllium-copper-safety-spanner-explosion-proof-combination-spanner-metric-imperial-sizes-industrial-hand-tools-supplier-uae-al-faiz-hardware', tag: 'Al-bronze' },
      { handle: '9-piece-brass-non-sparking-allen-key-set-mm-inch-sizes-explosion-proof-hex-key-set-industrial-safety-tool-uae-al-faiz-hardware-sharjah', tag: 'Brass' },
      { handle: 'brass-non-sparking-hacksaw-frame-300mm-12-inch-explosion-proof-spark-resistant-hacksaw-for-oil-gas-marine-petrochemical-industries-industrial-safety-hand-tools-al-faiz-hardware-uae', tag: 'Brass' },
    ],
  },
  {
    id: 'air',
    label: 'Air compressors',
    items: [
      { handle: 'airi-500-litre-7-5hp-3-phase-industrial-air-compressor-5-5kw-380v-2-stage-belt-drive-heavy-duty-piston-compressor-827-l-min-11-bar-made-in-italy-for-factory-workshop-industrial-use-uae-al-faiz-hardware', tag: 'Made in Italy' },
      { handle: 'airi-1000-litre-tandem-air-compressor-2-7-5hp-15hp-total-3-phase-twin-abac-pump-1654-l-min-11-bar-2-stage-belt-drive-heavy-duty-industrial-grade-made-in-italy-uae-al-faiz-hardware', tag: 'Made in Italy' },
      { handle: 'fiac-ab500-5-hp-500l-air-compressor', tag: 'Made in Italy' },
      { handle: 'shamal-sb5-500td5-5-air-compressor-500l-tank-twin-5-5hp-motors-3ph-11bar-45-2cfm', tag: 'Twin motor' },
    ],
  },
  {
    id: 'site',
    label: 'Site & safety',
    items: [
      { handle: '3m-6200-half-facepiece-reusable-respirator-medium-niosh-approved-half-face-mask-10x-pel-protection-compatible-with-3m-6000-series-cartridges-filters-for-construction-oil-gas-painting-welding-chemical-handling-uae-al-faiz-hardware', tag: 'NIOSH' },
      { handle: 'gi-binding-wire-galvanized-iron-tie-wire-16g-18g-20g-10kg-roll-hot-dip-electro-galvanized-rebar-binding-construction-fencing-industrial-use-uae-al-faiz-hardware', tag: '10kg roll' },
      { handle: 'irwin-10504159-reciprocating-saw-blades-professional-pack', tag: 'Pro pack' },
      { handle: 'dewalt-dce089d1g-qw-12v-xr-3-x-360-green-laser-level-1-x-2ah-battery', tag: '3 × 360°' },
    ],
  },
];

/** "The Range Edit" magazine spread on the home page. */
export const rangeEdit = {
  collection: 'non-sparking-tools',
  issue: 'Issue 01',
  kicker: 'Non-Sparking',
  title: 'Safe tools for hazardous areas.',
  intro: 'Brass, aluminium-bronze and beryllium-copper hand tools for oil & gas, marine and petrochemical sites.',
  image: '/images/non-sparking.jpg',
  imageAlt: 'Brass and bronze non-sparking spanners, pliers, hammers and keys on a steel workbench',
  caption: ['Fig. 01 — The workshop set', 'Spanners, pliers, hammers, files & keys'],
  plates: [
    { handle: 'brass-non-sparking-combination-pliers-spark-resistant-safety-pliers-explosion-proof-brass-combination-pliers-6-7-8-10-industrial-hand-tools-supplier-uae-al-faiz-hardware', metal: 'Brass', name: 'Combination pliers', spec: '6", 7", 8" & 10"' },
    { handle: 'non-sparking-combination-wrench-aluminium-bronze-beryllium-copper-safety-spanner-explosion-proof-combination-spanner-metric-imperial-sizes-industrial-hand-tools-supplier-uae-al-faiz-hardware', metal: 'Al-bronze', name: 'Combination wrench', spec: 'Metric & imperial sizes' },
    { handle: '9-piece-brass-non-sparking-allen-key-set-mm-inch-sizes-explosion-proof-hex-key-set-industrial-safety-tool-uae-al-faiz-hardware-sharjah', metal: 'Brass', name: '9-piece Allen key set', spec: 'MM & inch sizes' },
    { handle: 'brass-non-sparking-hacksaw-frame-300mm-12-inch-explosion-proof-spark-resistant-hacksaw-for-oil-gas-marine-petrochemical-industries-industrial-safety-hand-tools-al-faiz-hardware-uae', metal: 'Brass', name: 'Hacksaw frame', spec: '300mm (12")' },
  ],
  notes: [
    { title: 'Brass', text: 'Pliers, files, hacksaw frames and Allen key sets.' },
    { title: 'Aluminium bronze', text: 'Combination wrenches and crate openers.' },
    { title: 'Beryllium copper', text: 'Combination wrenches in metric and imperial sizes.' },
  ],
};

/** "Why Al Faiz" cards on the home page. Icons come from src/components/Icons.tsx. */
export const features = [
  { icon: 'shield', title: 'Genuine brands', short: 'DeWALT, Makita, Bosch & more', text: 'DeWALT, Makita, Bosch, Milwaukee and more under one roof.' },
  { icon: 'truck', title: 'UAE-wide delivery', short: 'To your site or workshop', text: 'Delivered to your site or workshop across the Emirates.' },
  { icon: 'globe', title: 'Export ready', short: 'Oman, KSA, Iraq, Africa', text: 'Supplying Oman, Saudi Arabia, Iraq, Africa and beyond.' },
  { icon: 'card', title: 'Flexible payment', short: 'Cash, card, transfer, cheque', text: 'Cash, card, bank transfer or cheque.' },
] as const;

export const industries = [
  { icon: 'construction', title: 'Construction', text: 'Hardware, power tools, fasteners and site supplies.' },
  { icon: 'factory', title: 'Manufacturing', text: 'Industrial tools, maintenance equipment and consumables.' },
  { icon: 'drop', title: 'Oil & Gas', text: 'Heavy-duty hardware, safety equipment and industrial products.' },
  { icon: 'anchor', title: 'Marine', text: 'Corrosion-resistant fasteners, tools and marine hardware.' },
  { icon: 'bolt', title: 'Electrical', text: 'Electrical tools, accessories and installation supplies.' },
  { icon: 'fan', title: 'HVAC', text: 'Installation tools, accessories and maintenance supplies.' },
  { icon: 'car', title: 'Automotive', text: 'Workshop tools, lubricants and repair equipment.' },
  { icon: 'home', title: 'DIY & Home', text: 'Quality tools and hardware for homes and small projects.' },
] as const;

export const reviews = [
  { name: 'Arif', text: 'Widest range of DeWALT products available with them.' },
  { name: 'Mohammad', text: 'A great place to find a wide range of products in one location.' },
  { name: 'Huzaifa', text: 'Excellent quality products.' },
];

export const faqs = [
  {
    q: 'What does Al Faiz Electric & Hardware supply?',
    a: 'Power tools, air compressors, non-sparking tools, pneumatic tools, fasteners, welding consumables, mesh, safety products and more — from brands including DeWALT, Makita, Bosch, Milwaukee, ABAC and FIAC.',
  },
  { q: 'Where is your showroom?', a: 'BMW Road, Industrial Area 1, Sharjah, United Arab Emirates.' },
  { q: 'What payment methods do you accept?', a: 'Cash, credit card, bank transfer, cheque (post delivery) and advance payment before delivery.' },
  { q: 'Do you deliver across the UAE?', a: 'Yes, we deliver across the UAE. Terms and conditions apply.' },
  { q: 'Do products come with a warranty?', a: 'Products eligible for a manufacturer warranty come with service warranty only. Spare parts are chargeable.' },
  { q: 'Do you supply outside the UAE?', a: 'Yes — we supply clients in Oman, Saudi Arabia, Iraq, the Maldives, Congo, Kenya and Mauritius.' },
];

export const footerRanges = [
  { handle: 'power-tools', title: 'Power Tools' },
  { handle: 'air-compressors', title: 'Air Compressors' },
  { handle: 'non-sparking-tools', title: 'Non-Sparking Tools' },
  { handle: 'pneumatic-tools', title: 'Pneumatic Tools' },
  { handle: 'fastners', title: 'Fasteners' },
  { handle: 'safety-products', title: 'Safety Products' },
  { handle: 'welding', title: 'Welding' },
];
