// Small helpers that are safe to use in both server and client components.
import type { QuoteItem } from './types';

/** Shopify CDN images accept ?width= — ask for the size we actually need. */
export function imgUrl(src: string, width: number): string {
  if (!src) return '';
  if (!/cdn\.shopify\.com|\/cdn\/shop\//.test(src)) return src;
  const base = src.replace(/([?&])width=\d+(&|$)/, '$1').replace(/[?&]$/, '');
  return `${base}${base.includes('?') ? '&' : '?'}width=${width}`;
}

export function srcSet(src: string, widths: number[]): string | undefined {
  if (!/cdn\.shopify\.com|\/cdn\/shop\//.test(src)) return undefined;
  return widths.map((w) => `${imgUrl(src, w)} ${w}w`).join(', ');
}

export function priceLabel(price: number): string {
  return price > 0 ? `AED ${price.toLocaleString('en-AE', { maximumFractionDigits: 2 })}` : 'Price on request';
}

/** "DeWALT" + "DeWALT DCK355…" -> "DeWALT DCK355…"; "3M" + "6200 respirator" -> "3M 6200 respirator". */
export function fullName(name: string, brand: string): string {
  if (!brand || name.toLowerCase().includes(brand.toLowerCase())) return name;
  return `${brand} ${name}`;
}

export function quoteMessage(items: QuoteItem[], notes: string, siteUrl: string): string {
  const lines = items.map((it, i) => `${i + 1}. ${fullName(it.name, it.brand)} — Qty ${it.qty}\n   ${siteUrl}/products/${it.handle}/`);
  return ['Hello Al Faiz, I would like to order:', '', ...lines, ...(notes.trim() ? ['', `Notes: ${notes.trim()}`] : [])].join('\n');
}
