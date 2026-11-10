import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CollectionView } from '@/components/CollectionView';
import { Icon } from '@/components/Icons';
import { Breadcrumbs, JsonLd } from '@/components/Section';
import { industries, site, waLink } from '@/data/site';
import { facetsFor, getCollection, products, toListItem } from '@/lib/catalog';

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

const find = (slug: string) => industries.find((i) => i.slug === slug);

/** Products tagged with this industry in Supabase; until some are tagged, products from its usual categories. */
function productsFor(slug: string) {
  const it = find(slug)!;
  const tagged = products.filter((p) => p.industries?.includes(slug));
  if (tagged.length) return tagged;
  const cats: readonly string[] = it.cats;
  return products.filter((p) => p.collections.some((c) => cats.includes(c)));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const it = find(slug);
  if (!it) return {};
  return {
    title: `Tools & Supplies for ${it.title}`,
    description: `${it.text} Genuine brands, supplied across the UAE — send your list for a quote.`,
    alternates: { canonical: `/industries/${slug}/` },
  };
}

export default async function IndustryPage({ params }: Params) {
  const { slug } = await params;
  const it = find(slug);
  if (!it) notFound();

  const list = productsFor(slug);
  const facets = facetsFor(list);
  const others = industries.filter((x) => x.slug !== slug);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: 'Industries', item: `${site.url}/#ind-title` },
            { '@type': 'ListItem', position: 3, name: it.title, item: `${site.url}/industries/${slug}/` },
          ],
        }}
      />

      <section className="relative isolate overflow-hidden bg-ink text-white">
        <img src={it.image} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-45" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(17,19,21,.92)_0%,rgba(17,19,21,.7)_55%,rgba(17,19,21,.35)_100%)]" />
        <div className="wrap flex flex-col gap-5 pb-12 pt-6 sm:pb-16">
          <div className="[&_a]:text-white/75! [&_a:hover]:text-white! [&_li]:text-white/60! [&_span]:text-white!">
            <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/#ind-title', label: 'Industries' }, { label: it.title }]} />
          </div>
          <div className="flex max-w-[680px] flex-col gap-4 pt-4">
            <span className="eyebrow text-white/70">Industry</span>
            <h1 className="text-[clamp(32px,4.4vw,54px)] font-extrabold leading-[1.04] tracking-[-0.02em]">{it.title}</h1>
            <p className="text-[16px] leading-relaxed text-white/80 sm:text-[17px]">
              {it.text} Tell us what your team needs — we reply with price, stock and delivery.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <a href={waLink(`Hello Al Faiz, we work in ${it.title.toLowerCase()} and would like a quote for:`)} target="_blank" rel="noopener" className="pill pill-lg pill-white fx">
                Get a quote
                <span className="pill-dot">
                  <Icon name="arrow" size={15} strokeWidth={2.4} />
                </span>
              </a>
              <Link href="/pages/bulk-special-product-request/" className="pill pill-lg bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20">
                Bulk &amp; special request
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {it.cats.map((h) => {
              const c = getCollection(h);
              return c ? (
                <Link key={h} href={`/collections/${h}/`} className="inline-flex h-9 items-center rounded-md bg-white/10 px-3 text-[13.5px] font-medium ring-1 ring-white/15 transition hover:bg-white hover:text-ink">
                  {c.title}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="wrap">
          <CollectionView items={list.map(toListItem)} brandFacets={facets.brands} categoryFacets={facets.categories} />
        </div>
      </section>

      <section className="border-t border-line bg-white py-12">
        <div className="wrap flex flex-col gap-5">
          <h2 className="text-xl font-bold tracking-[-0.02em]">Other industries we serve</h2>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/industries/${o.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-[10px] ring-1 ring-line-soft transition hover:ring-accent/40">
                  <span className="relative aspect-[4/3] overflow-hidden bg-chip">
                    <img src={o.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" />
                  </span>
                  <span className="p-2.5 text-[13.5px] font-semibold leading-tight text-ink">{o.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
