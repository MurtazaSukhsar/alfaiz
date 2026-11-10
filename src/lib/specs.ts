// Pulls specification tables out of a product description so the product page can show them
// as a proper table, and the rest of the description can be collapsed behind "Read more".

export type SpecTable = {
  title: string;
  /** column headings for multi-column tables (sizes, variants); empty for simple label/value tables */
  head: string[];
  rows: string[][];
  /** true when every row is a label + value pair */
  pairs: boolean;
};

const ENT: Record<string, string> = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', ndash: '–', mdash: '—', times: '×', deg: '°', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
const text = (html: string) =>
  html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) =>
      e[0] === '#' ? String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : (ENT[e.toLowerCase()] ?? m),
    )
    .replace(/\s+/g, ' ')
    .trim();

const GENERIC_HEAD = /^(spec(ification)?s?|feature|parameter|item|property|attribute|description|detail(s)?|value|technical (data|spec(ification)?s?))$/i;
const SPEC_HEADING = /(spec|technical|dimension|size|parameter|data)/i;

export function splitSpecs(html: string): { html: string; tables: SpecTable[] } {
  const tables: SpecTable[] = [];
  let out = html;

  for (const m of html.matchAll(/<table[\s\S]*?<\/table>/gi)) {
    const block = m[0];
    const rows = [...block.matchAll(/<tr[\s\S]*?<\/tr>/gi)].map((r) => [...r[0].matchAll(/<t([hd])[^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => ({ th: c[1].toLowerCase() === 'h', v: text(c[2]) })));
    const clean = rows.filter((r) => r.some((c) => c.v));
    if (clean.length < 2) continue;

    let head: string[] = [];
    if (/<thead/i.test(block) || clean[0].every((c) => c.th)) head = clean.shift()!.map((c) => c.v);
    const body = clean.map((r) => r.map((c) => c.v));
    const pairs = body.every((r) => r.length === 2);
    if (pairs && head.length === 2 && head.every((h) => GENERIC_HEAD.test(h) || !h)) head = [];
    if (pairs && head.length === 2 && !head.every((h) => GENERIC_HEAD.test(h))) {
      // a real first row that happened to be in <thead>
      body.unshift(head);
      head = [];
    }

    // the heading right before the table ("Technical Specifications") goes with it
    const before = out.slice(0, out.indexOf(block));
    const hm = before.match(/(?:<h([2-4])[^>]*>((?:[^<]|<(?!\/h[2-4]))*)<\/h\1>|<p>\s*<(strong|b)>([^<]*)<\/\3>\s*<\/p>)\s*(?:<hr\s*\/?>\s*)?$/i);
    const headingText = hm ? text(hm[2] ?? hm[4] ?? '').replace(/[:：]\s*$/, '') : '';
    const useHeading = hm && headingText.length < 60 && SPEC_HEADING.test(headingText);

    tables.push({ title: useHeading ? headingText : pairs ? 'Specifications' : 'Sizes & specifications', head, rows: body, pairs });
    out = useHeading ? before.slice(0, before.length - hm![0].length) + out.slice(before.length + block.length) : out.replace(block, '');
  }

  // tidy what's left: empty paragraphs / list items and trailing rules
  out = out
    .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, '')
    .replace(/(<hr\s*\/?>\s*)+$/i, '')
    .trim();
  return { html: out, tables };
}

/** Short list of headline specs for the top of the page (skips brand — it is already shown). */
export function keySpecs(tables: SpecTable[], n = 6): [string, string][] {
  const t = tables.find((x) => x.pairs);
  if (!t) return [];
  return t.rows
    .filter(([k, v]) => k && v && !/^(brand|manufacturer|ean|barcode|article number|manufacturer part number|sku)$/i.test(k) && v.length <= 40)
    .slice(0, n) as [string, string][];
}
