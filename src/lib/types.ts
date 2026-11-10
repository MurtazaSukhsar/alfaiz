export type Img = { src: string; width: number; height: number; alt: string };

export type Product = {
  handle: string;
  title: string;
  name: string;
  subtitle: string;
  brand: string;
  brandHandle: string | null;
  type: string;
  tags: string[];
  collections: string[];
  images: Img[];
  price: number;
  available: boolean;
  options: { name: string; values: string[] }[];
  variants: { title: string; sku: string; available: boolean }[];
  html: string;
  summary: string;
  updatedAt: string;
  /** shown in the home page "Featured products" section (set in Supabase) */
  featured?: boolean;
  featuredRank?: number;
  /** industry slugs this product is used in (set in Supabase) */
  industries?: string[];
};

export type Collection = {
  handle: string;
  title: string;
  kind: 'brand' | 'category';
  count: number;
  image: string | null;
  html: string;
  products: string[];
};

/** The slim product shape that client components receive. */
export type Card = {
  handle: string;
  name: string;
  subtitle: string;
  brand: string;
  image: string;
  available: boolean;
  price: number;
  tag?: string;
};

export type ListItem = Card & { brandHandle: string | null; cats: string[]; updatedAt: string };

export type Facet = { handle: string; title: string; count: number };

export type QuoteItem = { handle: string; name: string; brand: string; image: string; qty: number };

export type SearchIndex = {
  products: { h: string; n: string; b: string; s: string; c: string; i: string; a?: number; p?: number }[];
  collections: { h: string; t: string; k: string; n: number }[];
};
