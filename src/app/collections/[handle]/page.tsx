import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CollectionView } from '@/components/CollectionView';
import { Breadcrumbs, JsonLd } from '@/components/Section';
import { brandStrip, site } from '@/data/site';
import { collections, facetsFor, getCollection, productsIn, toListItem } from '@/lib/catalog';

type Params = { params: Promise<{ handle: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ handle: 'all' }, ...collections.map((c) => ({ handle: c.handle }))];
}

function info(handle: string) {
  if (handle === 'all') {
    return {
      title: 'All Products',
      kind: 'all' as const,
      html: '',
      intro: 'Every tool, machine and supply we list — filter by brand or category, or search for a model number.',
    };
  }
  const c = getCollection(handle);
  if (!c) return null;
  const firstPara = c.html.match(/<p>([\s\S]*?)<\/p>/)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? '';
  return {
    title: c.title,
    kind: c.kind,
    html: c.html,
    intro:
      firstPara.length > 40
        ? firstPara
        : c.kind === 'brand'
          ? `Genuine ${c.title} tools and equipment, supplied across the UAE from our Sharjah showroom.`
          : `${c.title} from leading brands, supplied across the UAE from our Sharjah showroom.`,
  };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const i = info(handle);
  if (!i) return {};
  const title = i.kind === 'brand' ? `${i.title} Tools in UAE` : handle === 'all' ? 'All Products' : `${i.title} in UAE`;
  return {
    title,
    description: i.intro.slice(0, 160),
    alternates: { canonical: `/collections/${handle}/` },
  };
}

export default async function CollectionPage({ params }: Params) {
  const { handle } = await params;
  const i = info(handle);
  if (!i) notFound();

  const list = productsIn(handle);
  const facets = facetsFor(list);
  const hasLogo = brandStrip.some((b) => b.handle === handle);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            { '@type': 'ListItem', position: 2, name: i.title, item: `${site.url}/collections/${handle}/` },
          ],
        }}
      />
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-5 pb-10 pt-6">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, ...(handle === 'all' ? [] : [{ href: '/collections/all/', label: 'Products' }]), { label: i.title }]} />
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex max-w-[720px] flex-col gap-3">
              <span className="eyebrow text-accent">{i.kind === 'brand' ? 'Brand' : i.kind === 'all' ? 'Catalog' : 'Category'}</span>
              <h1 className="text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.04] tracking-[-0.02em]">{i.title}</h1>
              <p className="line-clamp-3 text-base leading-relaxed text-muted">{i.intro}</p>
            </div>
            {hasLogo && (
              <span className="grid h-24 w-56 place-items-center rounded-2xl border border-line bg-white p-4">
                <img src={`/brands/${handle}.png`} alt={`${i.title} logo`} className="max-h-14 w-auto object-contain" />
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="wrap">
          <CollectionView items={list.map(toListItem)} brandFacets={facets.brands} categoryFacets={facets.categories} />
        </div>
      </section>

      {i.html && i.html.length > 300 && (
        <section className="border-t border-line bg-white py-14">
          <div className="wrap">
            <details className="group mx-auto max-w-[820px]">
              <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 text-lg font-bold">
                About {i.title}
                <span className="text-sm font-semibold text-accent group-open:hidden">Read more</span>
                <span className="hidden text-sm font-semibold text-accent group-open:inline">Show less</span>
              </summary>
              <div className="prose-af mt-4" dangerouslySetInnerHTML={{ __html: i.html }} />
            </details>
          </div>
        </section>
      )}
    </>
  );
}
