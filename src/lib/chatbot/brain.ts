// What the assistant says. It only talks about this website: products, brands,
// ordering through the cart, delivery, payment and contact details.
// It never quotes prices — those always come from the sales team.

import { brandStrip, ranges, site, waLink } from '@/data/site';
import type { SearchIndex } from '@/lib/types';
import type { Engine, Intent } from './engine';

export type Hit = SearchIndex['products'][number];

export type Action =
  | { kind: 'link'; label: string; href: string; external?: boolean; icon?: 'chat' | 'phone' | 'mail' | 'cart' | 'pin' | 'arrow' }
  | { kind: 'ask'; label: string; text: string }
  | { kind: 'clear-cart'; label: string };

export type Reply = {
  text: string[];
  list?: { label: string; href?: string }[];
  products?: Hit[];
  more?: { label: string; href: string };
  actions?: Action[];
  showCart?: boolean;
};

export type BrainContext = {
  engine: Engine | null;
  index: SearchIndex | null;
  cartCount: number;
};

/* ------------------------------------------------------------------ shared bits */

const wa = (label = 'Chat on WhatsApp', msg?: string): Action => ({ kind: 'link', label, href: waLink(msg), external: true, icon: 'chat' });
const call: Action = { kind: 'link', label: `Call ${site.phone}`, href: site.phoneHref, icon: 'phone' };
const mail: Action = { kind: 'link', label: 'Email us', href: `mailto:${site.email}`, icon: 'mail' };
const cart: Action = { kind: 'link', label: 'Open cart', href: '/cart/', icon: 'cart' };
const browse: Action = { kind: 'link', label: 'Browse all products', href: '/collections/all/', icon: 'arrow' };
const hoursKnown = !/^\[.*\]$/.test(site.hours.trim());

export const starters: Action[] = [
  { kind: 'ask', label: 'Find a tool', text: 'I need a tool for drilling concrete' },
  { kind: 'ask', label: 'How do I order?', text: 'How do I place an order?' },
  { kind: 'ask', label: 'Brands', text: 'What brands do you have?' },
  { kind: 'ask', label: 'Delivery', text: 'Which areas do you deliver to?' },
  { kind: 'ask', label: 'Contact', text: 'What is your phone number?' },
];

const NO_PRICE: Reply = {
  text: [
    "I can't share prices, discounts or offers here — prices are confirmed by our sales team for your exact quantity and delivery location.",
    'Add the items to your cart and check out on WhatsApp or email, and the team will reply with your prices.',
  ],
  actions: [cart, wa('Ask the sales team', 'Hello Al Faiz, I would like prices for:')],
};

const OFF_TOPIC: Reply = {
  text: [
    'Sorry, I can only help with the Al Faiz website — finding tools, brands, how to order, delivery, payment and contact details.',
  ],
  actions: starters.slice(0, 4),
};

const FALLBACK: Reply = {
  text: [
    "I'm not sure I understood that. Try asking for a tool (for example “Makita grinder” or “cutting metal”), or ask about ordering, delivery or contact details.",
  ],
  actions: [...starters.slice(0, 3), wa('Ask a person')],
};

/* ------------------------------------------------------------------ answers for every "say" intent */

const howToOrder: Reply = {
  text: ['Ordering takes a minute:'],
  list: [
    { label: '1. Open a product and press “Add to cart” (set the quantity first).' },
    { label: '2. Open your cart, check quantities and add a note (delivery location, company name).' },
    { label: '3. Press “Checkout on WhatsApp” or “Checkout by email”.' },
    { label: '4. Our sales team confirms price, stock and delivery, then you pay by cash, card, bank transfer or cheque.' },
  ],
  actions: [cart, browse],
};

const contactUs = (lead: string, msg?: string): Reply => ({
  text: [lead],
  actions: [wa('Chat on WhatsApp', msg), call, mail],
});

const SAY: Record<string, Reply | ((ctx: BrainContext) => Reply)> = {
  'where is my order': contactUs(
    "Orders from this website are confirmed directly by our sales team, so there's no online tracking page. Message them with your name and what you ordered and they'll update you.",
    'Hello Al Faiz, I would like an update on my order. My name is:',
  ),
  'track my order': contactUs(
    "There's no online tracking on this website — our sales team handles every order personally. Send them your name and order details for an update.",
    'Hello Al Faiz, I would like an update on my order. My name is:',
  ),
  'how do i cancel my order': contactUs('To cancel, message our sales team as soon as possible with your name and order details.', 'Hello Al Faiz, I would like to cancel my order. Details:'),
  'i want to change my order': contactUs('No problem — send our sales team the change you need (items, quantities or delivery details) and they will update your order.', 'Hello Al Faiz, I would like to change my order. Details:'),
  'what is your return policy': contactUs('Returns are handled by our sales team case by case. Please contact them with your invoice details and the item you want to return.'),
  'how long does a refund take': contactUs('Refunds are handled by our sales team. Please contact them with your invoice details and they will confirm the timing.'),
  'where is my refund': contactUs('Please contact our sales team with your invoice details — they can check the status of your refund.'),
  'my item arrived damaged': contactUs("Sorry about that! Please send our team a photo of the item and your invoice details on WhatsApp so they can sort it out.", 'Hello Al Faiz, an item in my order arrived damaged. Invoice/order details:'),
  'an item is missing from my parcel': contactUs('Sorry about that! Message our team with your order details and the missing item, and they will look into it.', 'Hello Al Faiz, an item is missing from my order. Details:'),
  'the courier says delivered but i did not get it': contactUs('Please contact our team straight away with your order details and delivery address so they can check with the delivery driver.'),
  'how long does delivery take': {
    text: ['We deliver across the UAE (terms and conditions apply). Delivery time depends on the items and your location — our sales team confirms it when they confirm your order.'],
    actions: [cart, wa()],
  },
  'how much is delivery': {
    text: ["I can't quote delivery charges here. They depend on your order and location, and our sales team confirms them together with your order."],
    actions: [cart, wa()],
  },
  'which areas do you deliver to': {
    text: [
      'We deliver across the UAE (terms and conditions apply).',
      `We also supply customers in ${site.exportCountries.slice(0, -1).join(', ')} and ${site.exportCountries.at(-1)}.`,
    ],
    actions: [cart, wa()],
  },
  'what payment methods do you accept': {
    text: ['We accept cash, credit card, bank transfer, cheque (post delivery) and advance payment before delivery. You pay after our team confirms your order — there is no online card payment on this website.'],
    actions: [{ kind: 'ask', label: 'How do I order?', text: 'How do I place an order?' }],
  },
  'can i pay cash on delivery': {
    text: ['Cash is one of our accepted payment methods. Our sales team confirms how and when to pay when they confirm your order.'],
    actions: [wa()],
  },
  'is it cash only': {
    text: ['No — we accept cash, credit card, bank transfer, cheque (post delivery) and advance payment before delivery.'],
  },
  'my payment failed': contactUs("This website doesn't take online payments — you pay our team after they confirm your order. If you had a problem paying them, please get in touch."),
  'can i get a vat invoice': contactUs('Please ask our sales team for an invoice with your company details when you place your order.'),
  'what is your phone number': {
    text: [`Phone and WhatsApp: ${site.phone}`, `Email: ${site.email}`],
    actions: [call, wa(), mail],
  },
  'what are your opening hours': {
    text: hoursKnown
      ? [`Our showroom hours: ${site.hours}.`, `We're at ${site.street}, ${site.city}.`]
      : [`Please call or WhatsApp ${site.phone} to confirm today's opening hours before you visit.`, `We're at ${site.street}, ${site.city}.`],
    actions: [call, wa(), { kind: 'link', label: 'Open in Maps', href: site.mapsUrl, external: true, icon: 'pin' }],
  },
  'where is your shop located': {
    text: [`Our showroom: ${site.street}, ${site.city}, ${site.country}.`],
    actions: [
      { kind: 'link', label: 'Open in Maps', href: site.mapsUrl, external: true, icon: 'pin' },
      { kind: 'link', label: 'Contact page', href: '/pages/contact/', icon: 'arrow' },
    ],
  },
  'i want to talk to a person': contactUs('Of course — our sales team is on WhatsApp and phone.'),
  'i want to make a complaint': contactUs("I'm sorry to hear that. Please tell our team what happened — WhatsApp or email is best so they have the details in writing.", 'Hello Al Faiz, I would like to make a complaint:'),
  'i want a bulk price': NO_PRICE,
  'can i get a discount': NO_PRICE,
  'what offers do you have': NO_PRICE,
  'is there a warranty': {
    text: ['Products eligible for a manufacturer warranty come with service warranty only. Spare parts are chargeable.', 'For a specific product, ask our team and they will confirm the warranty.'],
    actions: [wa()],
  },
  'are your products genuine': {
    text: [`Yes — we supply branded tools from ${brandStrip.slice(0, 6).map((b) => b.name).join(', ')} and more.`],
    actions: [{ kind: 'ask', label: 'See all brands', text: 'What brands do you have?' }],
  },
  'how do i log in': {
    text: ['You don’t need an account on this website. Just add products to your cart — it is saved on your device — and check out on WhatsApp or email.'],
    actions: [cart],
  },
  'delete my account': {
    text: ["There's no account to delete — this website doesn't store your details. Your cart is saved only on your own device, and you can empty it any time."],
    actions: [{ kind: 'clear-cart', label: 'Empty my cart' }],
  },
  'how do i place an order': howToOrder,
  'how do i checkout': howToOrder,
  'show my cart': (ctx) =>
    ctx.cartCount
      ? { text: [`You have ${ctx.cartCount} product${ctx.cartCount === 1 ? '' : 's'} in your cart:`], showCart: true, actions: [cart] }
      : { text: ['Your cart is empty. Find a product and press “Add to cart”.'], actions: [browse] },
  'empty my cart': (ctx) =>
    ctx.cartCount
      ? { text: [`Empty your cart (${ctx.cartCount} product${ctx.cartCount === 1 ? '' : 's'})? This can't be undone.`], actions: [{ kind: 'clear-cart', label: 'Yes, empty my cart' }, cart] }
      : { text: ['Your cart is already empty.'], actions: [browse] },
  'what do you sell': {
    text: ['Tools, machinery and industrial supplies. Our main categories:'],
    list: ranges.map((r) => ({ label: r.title, href: `/collections/${r.handle}/` })),
    actions: [browse],
  },
  'what brands do you have': {
    text: ['These are the brands we stock — tap one to see its products:'],
    list: brandStrip.map((b) => ({ label: b.name, href: `/collections/${b.handle}/` })),
  },
  'when will it be back in stock': contactUs('Send our team the product name or link and they will tell you the lead time.', 'Hello Al Faiz, when will this be back in stock?'),
  'is there a minimum order': {
    text: ['There is no minimum in the website cart. Our sales team confirms availability for your quantities when you check out.'],
    actions: [cart],
  },
  'do you speak arabic': {
    text: ['I can only chat in English. For help in another language, please message our team on WhatsApp.'],
    actions: [wa()],
  },
  hello: {
    text: ['Hi! I’m the Al Faiz website assistant. I can help you find tools, explain how ordering works and point you to the right page. What are you looking for?'],
    actions: starters,
  },
  'thank you': { text: ['You’re welcome! Anything else I can help you find?'], actions: starters.slice(0, 3) },
  bye: { text: ['Thanks for visiting Al Faiz. Your cart stays saved on this device whenever you come back.'] },
  'who are you': {
    text: ['I’m the Al Faiz website assistant. I help you find products, understand ordering and delivery, and reach our team. I don’t share prices — the sales team confirms those.'],
    actions: starters.slice(0, 3),
  },
  'what can you do': {
    text: ['I can help you:'],
    list: [
      { label: '• Find the right tool for a job (try “cutting metal” or “drilling concrete”)' },
      { label: '• Search products and brands' },
      { label: '• Explain how to order with the cart' },
      { label: '• Answer questions about delivery, payment and warranty' },
      { label: '• Connect you with our sales team' },
    ],
    actions: starters.slice(0, 3),
  },
  'show me around the website': {
    text: ['Here’s a quick tour:'],
    list: [
      { label: 'Home — brands, categories and featured tools', href: '/' },
      { label: 'All products — filter by brand or category', href: '/collections/all/' },
      { label: 'Search — the search bar at the top finds any product', href: '/search/' },
      { label: 'Cart — review items and check out', href: '/cart/' },
      { label: 'About us', href: '/pages/about-us/' },
      { label: 'Contact & map', href: '/pages/contact/' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  'this is useless': {
    text: ['Sorry I couldn’t help with that. You can ask me for a tool by name or by job, or talk to a person on WhatsApp.'],
    actions: [wa('Talk to a person'), ...starters.slice(0, 2)],
  },
  'do you have gift cards': {
    text: ['Gift cards aren’t available on this website.'],
    actions: [browse],
  },
};

/* ------------------------------------------------------------------ tool finder ("use" intents) */

// Extra Al Faiz-specific searches and a category to fall back on for each job.
const USE_EXTRA: Record<string, { find?: string[]; cat?: string }> = {
  'cutting tiles or glass': { find: ['tile', 'diamond'], cat: 'abrasives' },
  'cutting metal and pipe': { find: ['angle grinder', 'chop saw', 'cutting disc'], cat: 'abrasives' },
  'cutting wood': { find: ['circular saw', 'jigsaw', 'mitre saw'], cat: 'wood-works' },
  'cutting thin sheet metal': { find: ['angle grinder'], cat: 'power-tools' },
  'cutting wire and cable': { find: ['plier'] },
  'cutting boxes, paper and carpet': { cat: 'packaging-and-sealing' },
  'drilling concrete and brick': { find: ['rotary hammer', 'percussion drill'], cat: 'drill-bits' },
  'drilling wood': { find: ['drill driver'], cat: 'drill-bits' },
  'drilling metal': { find: ['drill driver'], cat: 'drill-bits' },
  'hanging things on a wall': { find: ['anchor', 'percussion drill'], cat: 'fastners' },
  'breaking concrete and brick': { find: ['demolition hammer', 'breaker'], cat: 'power-tools' },
  'hammering and pulling nails': { cat: 'construction-tools' },
  'tightening and loosening nuts and bolts': { find: ['impact wrench', 'spanner'], cat: 'garage-tools' },
  'plumbing work': { find: ['wrench'], cat: 'garage-tools' },
  'assembling furniture': { find: ['drill driver'], cat: 'garage-tools' },
  'driving screws': { find: ['drill driver', 'impact driver'], cat: 'power-tools' },
  'joining metal sheets': { find: ['rivet'], cat: 'fastners' },
  'smoothing and filing': { find: ['sander', 'file'], cat: 'abrasives' },
  'carving and shaping wood': { find: ['trimmer', 'router'], cat: 'wood-works' },
  'carrying and storing tools': { find: ['tool chest', 'tool box', 'trolley'], cat: 'garage-tools' },
  'gypsum and false ceilings': { find: ['drywall', 'screw'], cat: 'fastners' },
  'fixing roofing and metal sheets': { cat: 'fastners' },
  'hammering without marking the surface': { find: ['mallet'] },
  'welding work': { find: ['welding machine', 'welding'], cat: 'welding' },
  'gas fittings': { cat: 'garage-tools' },
  'fixing wood': { find: ['wood screw'], cat: 'fastners' },
  'filling holes in walls': { find: ['sealant', 'foam', 'adhesive'], cat: 'adhesives-sealants' },
  measuring: { find: ['level'] },
  'electrical work': { find: ['wall chaser', 'plier'], cat: 'construction-tools' },
  'plumbing and pipe fitting kit': { find: ['wrench'], cat: 'garage-tools' },
  carpentry: { find: ['circular saw', 'jigsaw', 'trimmer'], cat: 'wood-works' },
  'masonry and construction': { find: ['rotary hammer', 'demolition hammer', 'mixer'], cat: 'construction-tools' },
  'mechanical repair': { find: ['impact wrench', 'socket'], cat: 'garage-tools' },
  'everyday home repairs': { find: ['drill driver'], cat: 'garage-tools' },
  'a general workshop': { find: ['tool chest', 'air compressor'], cat: 'garage-tools' },
};

const norm = (s: string) => s.toLowerCase().replace(/[-_/|,()]/g, ' ').replace(/\s+/g, ' ').trim();
// Whole-word (prefix) matching: "grind" finds "grinder", but "take" no longer finds "Rotake".
const words = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
const hayCache = new Map<string, string>();
const hay = (p: Hit) => {
  let h = hayCache.get(p.h);
  if (!h) hayCache.set(p.h, (h = words(`${p.n} ${p.b} ${p.s} ${p.c.replace(/-/g, ' ')}`)));
  return h;
};
const hasWord = (h: string, t: string) => h.includes(` ${t}`);

function findPhrase(index: SearchIndex, phrase: string, needs?: RegExp | null, n = 2): Hit[] {
  const terms = norm(phrase).split(' ');
  return index.products.filter((p) => terms.every((t) => hasWord(hay(p), t)) && (!needs || needs.test(p.n.toLowerCase()))).slice(0, n);
}

function toolFinder(intent: Extract<Intent, { k: 'use' }>, index: SearchIndex | null): Reply {
  const extra = USE_EXTRA[intent.label] ?? {};
  const seen = new Set<string>();
  const products: Hit[] = [];
  const add = (list: Hit[]) => list.forEach((p) => !seen.has(p.h) && products.length < 6 && (seen.add(p.h), products.push(p)));
  if (index) {
    const needs = intent.needs ? new RegExp(intent.needs, 'i') : null;
    intent.find.forEach((f) => add(findPhrase(index, f, needs)));
    (extra.find ?? []).forEach((f) => add(findPhrase(index, f, null)));
  }
  const cat = extra.cat ? index?.collections.find((c) => c.h === extra.cat) : undefined;
  if (!products.length && !cat) {
    return contactUs(`We don't list a tool for ${intent.label} on the website yet — ask our team, they may be able to source it for you.`, `Hello Al Faiz, I need tools for ${intent.label}.`);
  }
  return {
    text: [products.length ? `For ${intent.label}, these can help:` : `For ${intent.label}, have a look at our ${cat!.t} range:`],
    products,
    more: cat ? { label: `See all ${cat.t} (${cat.n})`, href: `/collections/${cat.h}/` } : undefined,
    actions: [wa('Not sure? Ask our team', `Hello Al Faiz, I need tools for ${intent.label}.`)],
  };
}

/* ------------------------------------------------------------------ product search */

const STOP = new Set(
  'a an the i im i\'m me my we you your do does did have has had any some is are am was be can could would will please pls need needs want wants looking look for find show give get got sell sells selling buy buying available availability stock in of on to and or with this that it its there here what which who how where when about tell know whats need hi hello hey sir madam bro mam thanks thank help helps with take go open there them these those something some use using item items product products thing things plz kindly also other another like good best new right one ones all every more there'.split(
    ' ',
  ),
);
const QTY = new Set(['pc', 'pcs', 'piece', 'pieces', 'nos', 'no', 'qty', 'quantity', 'unit', 'units', 'x']);
const singular = (t: string) => (t.length > 4 && t.endsWith('es') && /(ches|shes|xes|sses)$/.test(t) ? t.slice(0, -2) : t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t);

export function productSearch(index: SearchIndex, query: string): { hits: Hit[]; total: number; exact: number; terms: string[] } {
  const terms = norm(query)
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(' ')
    .filter((t) => t && !STOP.has(t) && !QTY.has(t) && !/^\d+$/.test(t))
    .map(singular);
  if (!terms.length) return { hits: [], total: 0, exact: 0, terms };
  const scored: { p: Hit; s: number; all: boolean }[] = [];
  for (const p of index.products) {
    const h = hay(p);
    const name = words(p.n);
    let matched = 0;
    let s = 0;
    for (const t of terms) {
      if (!hasWord(h, t)) continue;
      matched++;
      s += hasWord(name, t) ? 2 : 1;
      if (norm(p.b).startsWith(t)) s += 2;
    }
    const all = matched === terms.length;
    if (all || (terms.length >= 3 && matched >= terms.length - 1)) scored.push({ p, s: s + (all ? 10 : 0), all });
  }
  scored.sort((a, b) => b.s - a.s);
  const exact = scored.filter((x) => x.all).length;
  // when some products match every word, only show those (partial matches are noise)
  const pool = exact ? scored.filter((x) => x.all) : scored;
  return { hits: pool.slice(0, 6).map((x) => x.p), total: pool.length, exact, terms };
}

const PRICE = /\b(price|prices|pricing|priced|cost|costs|costing|how much|rate|rates|aed|dhs|dirhams?|discount|discounts|offer|offers|deal|deals|cheap|cheaper|cheapest|expensive|quotation|budget|sale)\b/i;

/* ------------------------------------------------------------------ keyword fallback (while the model loads) */

const KEYWORDS: [RegExp, string][] = [
  [/\b(track|status|where).*\border\b|\border\b.*\b(status|track)/i, 'where is my order'],
  [/\b(cancel)\b/i, 'how do i cancel my order'],
  [/\b(return|refund|exchange)\b/i, 'what is your return policy'],
  [/\b(damaged|broken|missing)\b/i, 'my item arrived damaged'],
  [/\b(deliver|delivery|shipping|ship)\b/i, 'which areas do you deliver to'],
  [/\b(pay|payment|cash|card|cheque|transfer)\b/i, 'what payment methods do you accept'],
  [/\b(phone|call|number|contact|email|whatsapp)\b/i, 'what is your phone number'],
  [/\b(hours|open|opening|close|closing|timing|timings)\b/i, 'what are your opening hours'],
  [/\b(where|location|located|address|map|showroom|shop)\b/i, 'where is your shop located'],
  [/\b(warranty|guarantee)\b/i, 'is there a warranty'],
  [/\b(genuine|original|fake|authentic)\b/i, 'are your products genuine'],
  [/\b(login|log in|sign in|account)\b/i, 'how do i log in'],
  [/\b(empty|clear)\b.*\bcart\b/i, 'empty my cart'],
  [/\bcart\b/i, 'show my cart'],
  [/\b(checkout|place an order|how (do|can) i (order|buy))\b/i, 'how do i place an order'],
  [/\bbrands?\b/i, 'what brands do you have'],
  [/\b(categories|what do you sell|products do you)\b/i, 'what do you sell'],
  [/\b(person|human|agent|staff|someone)\b/i, 'i want to talk to a person'],
  [/\b(complain|complaint)\b/i, 'i want to make a complaint'],
  [/\b(tour|around|navigate|website)\b/i, 'show me around the website'],
  [/\b(who are you|your name)\b/i, 'who are you'],
  [/\b(help|what can you do)\b/i, 'what can you do'],
  [/^(hi|hello|hey|salam|assalam|good (morning|afternoon|evening))\b/i, 'hello'],
  [/\b(thanks|thank you|thx)\b/i, 'thank you'],
  [/\b(bye|goodbye)\b/i, 'bye'],
];

/* ------------------------------------------------------------------ main entry */

const sayReply = (key: string, ctx: BrainContext): Reply | null => {
  const r = SAY[key];
  return r ? (typeof r === 'function' ? r(ctx) : r) : null;
};

export async function respond(query: string, ctx: BrainContext): Promise<Reply> {
  const q = query.trim().slice(0, 300);
  if (!q) return FALLBACK;

  const search = ctx.index ? productSearch(ctx.index, q) : { hits: [] as Hit[], total: 0, exact: 0, terms: [] as string[] };
  // if the words name a category or brand, link to that page instead of a search
  const colMatch = ctx.index && search.terms.length
    ? ctx.index.collections.find((c) => {
        const cw = ` ${c.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
        return search.terms.every((t) => cw.includes(` ${t}`));
      })
    : undefined;
  const moreLink = colMatch
    ? { label: `See all ${colMatch.t} (${colMatch.n})`, href: `/collections/${colMatch.h}/` }
    : search.total > search.hits.length
      ? { label: `See all ${search.total} results`, href: `/search/?q=${encodeURIComponent(search.terms.join(' '))}` }
      : undefined;
  const productReply = (): Reply => ({
    text: [search.total === 1 ? 'I found this:' : `I found ${search.total} matching products:`],
    products: search.hits,
    more: moreLink,
  });
  const withProducts = (r: Reply): Reply =>
    search.hits.length
      ? { ...r, products: search.hits, more: moreLink ?? r.more }
      : r;

  // Prices are never discussed — always hand over to the sales team.
  if (PRICE.test(q)) return withProducts(NO_PRICE);

  let top: { intent: Intent; score: number } | null = null;
  if (ctx.engine) {
    try {
      const ranked = await ctx.engine.classify(q);
      if (ranked.length) top = { intent: ctx.engine.intents[ranked[0].intent], score: ranked[0].score };
    } catch {
      top = null;
    }
  }

  if (top) {
    const { intent, score } = top;
    const confident = score >= 0.62;

    if (intent.k === 'off' && score >= 0.5 && !search.hits.length) return OFF_TOPIC;

    if (intent.k === 'say' && (confident || (score >= 0.52 && !search.hits.length))) {
      const r = sayReply(intent.c, ctx);
      if (r) {
        if (intent.c === 'when will it be back in stock') return withProducts(r);
        const productish = ['what brands do you have', 'what do you sell', 'are your products genuine'].includes(intent.c);
        if (productish && search.hits.length) return productReply();
        // asked for something we don't list ("do you have Hilti?")
        const asked = search.terms.filter((t) => !/^(brand|brands|tool|tools|original|genuine)$/.test(t));
        if (productish && asked.length && !search.hits.length) {
          return { ...r, text: [`Sorry, we don't list “${asked.join(' ')}” on the website.`, ...(intent.c === 'what brands do you have' ? ['These are the brands we stock:'] : r.text)], actions: [wa('Ask if we can source it', `Hello Al Faiz, can you supply ${asked.join(' ')}?`)] };
        }
        return r;
      }
    }

    // a named product beats a loose "job" match ("drill bits", "non sparking spanner")
    if (intent.k === 'use' && search.exact > 0) return productReply();
    if (intent.k === 'use' && (confident || (score >= 0.55 && !search.hits.length))) return toolFinder(intent, ctx.index);
  } else {
    // Model still loading or unavailable: simple keyword rules.
    const hit = KEYWORDS.find(([re]) => re.test(q));
    if (hit && !(search.hits.length && ['where is your shop located', 'what do you sell', 'what brands do you have'].includes(hit[1]))) {
      const r = sayReply(hit[1], ctx);
      if (r) return r;
    }
  }

  if (search.hits.length) return productReply();

  if (top?.intent.k === 'off') return OFF_TOPIC;
  return FALLBACK;
}

export const GREETING: Reply = {
  text: ['Hi! I’m the Al Faiz assistant. Ask me to find a tool, or ask about ordering, delivery and contact details.'],
  actions: starters,
};
