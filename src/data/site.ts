// Business details and home-page content.
// Everything here can be edited in the admin panel (/admin/): edits are saved in Supabase, downloaded to
// data/content.json before every dev/build, and merged over the defaults in src/data/content.ts.
// Safe to import anywhere (client components included).

import raw from '../../data/content.json';
import { defaultSettings, makeDefaults, type SiteContent } from './content';

export type { FaqGroup, FaqItem } from './content';

const edited = raw as Partial<Record<keyof SiteContent, unknown>>;
const list = <T,>(v: unknown, d: T[]): T[] => (Array.isArray(v) && v.length ? (v as T[]) : d);
const obj = <T extends object>(v: unknown, d: T): T => (v && typeof v === 'object' && !Array.isArray(v) ? { ...d, ...(v as Partial<T>) } : d);
/** only http(s) links from the admin reach href/src attributes */
const safeUrl = (u: string, d: string) => (/^https:\/\//i.test(u || '') ? u : d);

const settings = obj(edited.settings, defaultSettings);

export const site = {
  ...settings,
  url: safeUrl(settings.url, defaultSettings.url),
  mapsUrl: safeUrl(settings.mapsUrl, defaultSettings.mapsUrl),
  mapEmbed: safeUrl(settings.mapEmbed, defaultSettings.mapEmbed),
  instagram: safeUrl(settings.instagram, defaultSettings.instagram),
  whatsapp: (settings.whatsapp || defaultSettings.whatsapp).replace(/\D/g, ''),
  phoneHref: `tel:+${(settings.phone || defaultSettings.phone).replace(/\D/g, '')}`,
  announcements: list<string>(settings.announcements, defaultSettings.announcements),
  exportCountries: list<string>(settings.exportCountries, defaultSettings.exportCountries),
  since: Number(settings.since) || defaultSettings.since,
  credit: { name: 'Farwings', url: 'https://www.farwingstech.com' },
};

export function waLink(text = 'Hello Al Faiz, I would like a quote.') {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const popularSearches = list<string>(settings.popularSearches, defaultSettings.popularSearches);

/** Scrolling "Our brands" logos. Each links to /collections/<handle>/. Default logos live in public/brands. */
export const brandStrip = list(edited.brands, makeDefaults(site).brands);

const defaults = makeDefaults(site, brandStrip.map((b) => b.name));

/** Brand logo: the one uploaded in the admin, else public/brands/<handle>.png */
export function brandLogo(handle: string): string {
  return brandStrip.find((b) => b.handle === handle)?.logo || `/brands/${handle}.png`;
}

/** Home hero: headline, text and the product tiles on the right. */
export const hero = obj(edited.hero, defaults.hero);
hero.tiles = list(hero.tiles, defaults.hero.tiles);

/** "Shop by category" tiles on the home page, in order. */
export const homeCategories = list(edited.categories, defaults.categories);
/** The main ranges (first nine category tiles), used by the chat assistant. */
export const ranges = homeCategories.slice(0, 9);

/** "The Brand Edit" magazine section on the home page: three key tools per brand. */
export const brandEdit = list(edited.brandEdit, defaults.brandEdit);

/** "Why Al Faiz" strip under the hero. Icons come from src/components/Icons.tsx. */
export const features = list(edited.trust, defaults.trust);

/**
 * Industries we serve. Each one has its own page (/industries/<slug>/) listing the products used in it.
 * Products are tagged in the admin (or Supabase → products → `industries`); until an industry has
 * tagged products, its page shows the categories listed in `cats`.
 */
export const industries = list(edited.industries, defaults.industries).filter((i) => i.slug);

/** Customer reviews (home page testimonials). */
export const reviews = list(edited.reviews, defaults.reviews);

/** Home page FAQ (also used by the chat assistant). */
export const faqs = list(edited.faqs, defaults.faqs);

/** Full FAQ page (/pages/faq/), grouped by topic. */
export const faqGroups = list(edited.faqGroups, defaults.faqGroups);

/** "Product ranges" links in the footer. */
export const footerRanges = list(edited.footer, defaults.footer);
