// Cleans up what people actually type in a chat box before the assistant reads it:
// chat shorthand ("do u hve"), spelling slips ("makitta", "compresser", "delivry")
// and split or joined names ("de walt", "nonsparking").
// Corrections only ever move a word towards something that exists on this website.

import type { SearchIndex } from '@/lib/types';

/** Shorthand and very common slips, fixed word for word. */
const SLANG: Record<string, string> = {
  u: 'you', ur: 'your', yr: 'your', r: 'are', n: 'and', b4: 'before', k: 'ok', okk: 'ok', okay: 'ok', y: 'why', v: 'we', d: 'the',
  hv: 'have', hve: 'have', hav: 'have', hvae: 'have', haev: 'have', hae: 'have', hava: 'have', hvng: 'having', gt: 'got', gv: 'give', giv: 'give',
  wat: 'what', wht: 'what', whts: 'what is', wats: 'what is', whats: 'what is', wt: 'what', wer: 'where', whr: 'where', whre: 'where', wen: 'when', whn: 'when', hw: 'how', hows: 'how is',
  abt: 'about', abut: 'about', bcz: 'because', coz: 'because', cuz: 'because', plz: 'please', pls: 'please', plzz: 'please', thx: 'thanks', thnx: 'thanks', tnx: 'thanks', ty: 'thanks', thanx: 'thanks', thnks: 'thanks',
  dnt: "don't", dont: "don't", cant: "can't", wont: "won't", im: 'i am', ive: 'i have', id: 'i would', wanna: 'want to', gonna: 'going to', gimme: 'give me', lemme: 'let me',
  nd: 'and', wid: 'with', wth: 'with', frm: 'from', fr: 'for', bt: 'but', nt: 'not', nw: 'now', tht: 'that', ths: 'this', dis: 'this', dat: 'that', thr: 'there', der: 'there', dere: 'there',
  msg: 'message', num: 'number', no: 'no', nmbr: 'number', nbr: 'number', ph: 'phone', mob: 'mobile', mbl: 'mobile', addr: 'address', loc: 'location', info: 'information', qty: 'quantity', avl: 'available', avail: 'available', availble: 'available', avaliable: 'available', availabe: 'available',
  prod: 'product', prods: 'products', prdct: 'product', prdcts: 'products', produc: 'product', producs: 'products', prodct: 'product', prodcts: 'products', prodcut: 'product', prodcuts: 'products', produts: 'products', produt: 'product', porduct: 'product', porducts: 'products', itm: 'item', itms: 'items',
  tol: 'tool', tols: 'tools', toolz: 'tools', tooles: 'tools', toll: 'tool', tolls: 'tools', mach: 'machine', mchn: 'machine', mchine: 'machine', equip: 'equipment', eqpt: 'equipment',
  dlvry: 'delivery', delvry: 'delivery', dilivery: 'delivery', dilvery: 'delivery', delivry: 'delivery', delevery: 'delivery', delivary: 'delivery', shpng: 'shipping', shiping: 'shipping',
  pymt: 'payment', pymnt: 'payment', paymnt: 'payment', payement: 'payment', paymet: 'payment', cod: 'cash on delivery',
  wrnty: 'warranty', waranty: 'warranty', warrenty: 'warranty', warantee: 'warranty', garanty: 'guarantee', guarantie: 'guarantee', garantee: 'guarantee',
  adress: 'address', adres: 'address', addres: 'address', locaton: 'location', loction: 'location', lokation: 'location',
  ordr: 'order', oder: 'order', odr: 'order', ordering: 'order', crt: 'cart', kart: 'cart', chekout: 'checkout', chkout: 'checkout',
  whatsap: 'whatsapp', watsapp: 'whatsapp', watsap: 'whatsapp', whtsapp: 'whatsapp', wtsapp: 'whatsapp', whatapp: 'whatsapp', wa: 'whatsapp', fone: 'phone', emial: 'email', mail: 'email',
  timings: 'timing', timngs: 'timing', opn: 'open', clsd: 'closed', shp: 'shop', stor: 'store', websit: 'website', web: 'website', site: 'website',
  orignal: 'original', orginal: 'original', genuin: 'genuine', geniune: 'genuine', jenuine: 'genuine', duplicate: 'fake',
  shw: 'show', sho: 'show', srch: 'search', serch: 'search', seach: 'search', luking: 'looking', lukin: 'looking', lookin: 'looking', nid: 'need', ned: 'need', wnt: 'want', wan: 'want', req: 'require', reqd: 'required',
  catagory: 'category', catagories: 'categories', catgory: 'category', categry: 'category', brnd: 'brand', brnds: 'brands', brandz: 'brands', bran: 'brand',
  salam: 'hello', slm: 'hello', hii: 'hi', hiii: 'hi', helo: 'hello', hllo: 'hello', hlo: 'hello', hy: 'hi', hlw: 'hello',
};

/** Names people split, join or shorten. Checked on the whole message. */
const PHRASES: [RegExp, string][] = [
  [/\bde\s+w+alt\b/g, 'dewalt'],
  [/\bdw\b/g, 'dewalt'],
  [/\b(black\s*(and|n|&|\+)?\s*deck?er|b\s*&\s*d|b\s*\+\s*d|bnd)\b/g, 'black decker'],
  [/\bmil+w[a-z]*k[a-z]*\b/g, 'milwaukee'],
  [/\bma[kc]+it+a\b/g, 'makita'],
  [/\bbos+[ch]{1,2}e?\b/g, 'bosch'],
  [/\bstan+l[ey]{1,2}\b/g, 'stanley'],
  [/\bnon\s*spark(ing|s)?\b/g, 'non sparking'],
  [/\b(anti|no)\s*spark(ing)?\b/g, 'non sparking'],
  [/\bair\s*comp(res+[oe]rs?)?\b/g, 'air compressor'],
  [/\bcompres+[oe]r(s)?\b/g, 'compressor$1'],
  [/\bdrill\s*bit(s)?\b/g, 'drill bit$1'],
  [/\bdrill\s*machine(s)?\b/g, 'drill$1'],
  [/\b(grinding|grinder)\s*machine(s)?\b/g, 'grinder$2'],
  [/\bcutting\s*machine(s)?\b/g, 'cutter$1'],
  [/\bcut+ing\s*(disk|disc)(s)?\b/g, 'cutting disc$2'],
  [/\bdisk(s)?\b/g, 'disc$1'],
  [/\bscrew\s*driver(s)?\b/g, 'screwdriver$1'],
  [/\bspan+ers?\b/g, 'spanner'],
  [/\bplyers?\b/g, 'plier'],
  [/\bcaster\s*wheel(s)?\b/g, 'caster wheel$1'],
  [/\bcastor(s)?\b/g, 'caster$1'],
  [/\bpress?ure\s*wash(er|ers|ing)?\b/g, 'pressure washer'],
  [/\bwater\s*pump(s)?\b/g, 'water pump$1'],
  [/\bgen\s*set(s)?\b/g, 'generator'],
  [/\bfasten+ers?\b/g, 'fastener'],
  [/\bsafety\s*(shoe|shoes|boot|boots)\b/g, 'safety shoes'],
  [/\bhand\s*glove(s)?\b/g, 'glove$1'],
  [/\bwhats\s+app\b/g, 'whatsapp'],
  [/\bcheck\s+out\b/g, 'checkout'],
  [/\bcash\s+on\s+del[a-z]*\b/g, 'cash on delivery'],
];

/** Words the assistant understands that are not product words. Never "corrected" away, and used as correction targets. */
const KNOWN = `a an the i me my we us our you your he she they them it its is are am was were be been being do does did done have has had having will would can could should shall may might must
not no yes ok and or but if so then than because as at by for from in into of off on onto out over to up with without about after before again also any all both each every few more most other some such only own same too very just now here there this that these those what which who whom whose when where why how
get got give given go going gone make made take took come came see saw seen look looking find found show tell told know knew need needs want wants like love use used using buy buying bought sell selling sold send sent ask asking help thanks thank please sorry hello hi hey bye goodbye welcome good great nice fine bad best better new old big small large little long short high low
order orders ordering ordered cancel cancelled change changed return returns refund refunds exchange damaged broken missing parcel courier delivered deliver delivers delivery deliveries shipping ship shipped track tracking status
payment payments pay paid paying cash card cards credit debit bank transfer cheque advance invoice vat tax receipt bill failed
phone number mobile call calling contact contacts email mail whatsapp message chat person human agent staff someone team sales manager owner complaint complain
hours hour open opening opened close closing closed timing today tomorrow sunday monday tuesday wednesday thursday friday saturday weekend holiday morning evening night
shop store showroom located location address map direction directions near nearby visit sharjah dubai abu dhabi ajman fujairah uae emirates oman saudi iraq kuwait qatar bahrain africa kenya export international country countries city area areas
warranty guarantee genuine original authentic fake repair service spare parts
account login log sign signup register password delete
checkout cart basket bag empty clear remove add added quantity minimum bulk wholesale special request quote quotation
brand brands category categories product products item items tool tools equipment machine machines machinery range ranges catalogue catalog stock available availability instock website page pages home faq about privacy policy search
price prices pricing cost costs discount discounts offer offers deal deals cheap expensive budget
many much kind type types size sizes model models heavy duty light industrial professional home work job site workshop factory garage
concrete brick wall wood metal steel iron pipe tile tiles glass plastic sheet cable wire nail nails screw screws bolt bolts nut nuts hole holes cutting drilling grinding welding sanding polishing painting measuring tightening breaking fixing hanging
arabic english hindi urdu language speak name weather time date`.split(/\s+/);

function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev2: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1); // swapped letters
      cur[j] = v;
      if (v < best) best = v;
    }
    if (best > max) return max + 1;
    prev2.splice(0, prev2.length, ...prev);
    prev = cur;
  }
  return prev[b.length];
}

export type Speller = { fix: (text: string) => string };

const cache = new WeakMap<SearchIndex, Speller>();
const baseSpeller = makeSpeller(new Map());

/** Speller that knows every word used in product names, brands and categories. */
export function spellerFor(index: SearchIndex | null): Speller {
  if (!index) return baseSpeller;
  let s = cache.get(index);
  if (!s) {
    const freq = new Map<string, number>();
    const add = (text: string, weight: number) => {
      for (const w of text.toLowerCase().split(/[^a-z]+/)) if (w.length >= 3) freq.set(w, (freq.get(w) ?? 0) + weight);
    };
    index.products.forEach((p) => {
      add(p.n, 1);
      add(p.b, 3);
    });
    index.collections.forEach((c) => add(c.t, 25));
    cache.set(index, (s = makeSpeller(freq)));
  }
  return s;
}

function makeSpeller(siteWords: Map<string, number>): Speller {
  const known = new Set(KNOWN);
  // correction targets: website words seen at least twice (or brand / category words), plus the words above
  const targets = new Map<string, number>();
  siteWords.forEach((n, w) => n >= 2 && targets.set(w, n));
  KNOWN.forEach((w) => w.length >= 4 && !targets.has(w) && targets.set(w, 5));
  const byLetter = new Map<string, [string, number][]>();
  targets.forEach((n, w) => {
    const list = byLetter.get(w[0]) ?? [];
    list.push([w, n]);
    byLetter.set(w[0], list);
  });
  const memo = new Map<string, string>();

  const word = (w: string): string => {
    if (SLANG[w]) return SLANG[w];
    if (w.length < 4 || /\d/.test(w) || known.has(w) || siteWords.has(w)) return w;
    // plural / -ing forms of something we know
    if (w.endsWith('s') && (known.has(w.slice(0, -1)) || siteWords.has(w.slice(0, -1)))) return w;
    const hit = memo.get(w);
    if (hit) return hit;
    // squeezed repeats: "drilll" -> "drill"
    const squeezed = w.replace(/(.)\1{2,}/g, '$1$1');
    const max = squeezed.length >= 8 ? 2 : 1;
    let best = w;
    let bestScore = Infinity;
    for (const [cand, n] of byLetter.get(squeezed[0]) ?? []) {
      const dist = distance(squeezed, cand, max);
      if (dist > max) continue;
      const score = dist * 10 - Math.min(Math.log2(n + 1), 6); // closer first, then the more common word
      if (score < bestScore) {
        bestScore = score;
        best = cand;
      }
    }
    memo.set(w, best);
    return best;
  };

  return {
    fix(text) {
      let t = ` ${text.toLowerCase().replace(/[’`]/g, "'")} `;
      for (const [re, to] of PHRASES) t = t.replace(re, to);
      return t
        .split(/(\s+|[^a-z0-9'&+]+)/)
        .map((tok) => (/^[a-z']+$/.test(tok) ? word(tok) : tok))
        .join('')
        .replace(/\s+/g, ' ')
        .trim();
    },
  };
}
