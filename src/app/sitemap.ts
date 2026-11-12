import type { MetadataRoute } from 'next';
import { collections, products, syncedAt } from '@/lib/catalog';
import { industries, site } from '@/data/site';
import { posts } from '@/lib/blog';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => `${site.url}${path}`;
  return [
    { url: u('/'), lastModified: syncedAt, changeFrequency: 'weekly', priority: 1 },
    { url: u('/collections/all/'), lastModified: syncedAt, changeFrequency: 'weekly', priority: 0.8 },
    { url: u('/pages/about-us/'), changeFrequency: 'monthly', priority: 0.5 },
    { url: u('/pages/contact/'), changeFrequency: 'monthly', priority: 0.5 },
    { url: u('/pages/faq/'), changeFrequency: 'monthly', priority: 0.5 },
    { url: u('/pages/bulk-special-product-request/'), changeFrequency: 'monthly', priority: 0.5 },
    { url: u('/policies/privacy-policy/'), changeFrequency: 'yearly', priority: 0.2 },
    { url: u('/blog/'), lastModified: posts[0]?.date, changeFrequency: 'weekly', priority: 0.6 },
    ...posts.map((p) => ({ url: u(`/blog/${p.slug}/`), lastModified: p.updatedAt || p.date, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...industries.map((i) => ({ url: u(`/industries/${i.slug}/`), lastModified: syncedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...collections.map((c) => ({ url: u(`/collections/${c.handle}/`), lastModified: syncedAt, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...products.map((p) => ({ url: u(`/products/${p.handle}/`), lastModified: p.updatedAt, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
