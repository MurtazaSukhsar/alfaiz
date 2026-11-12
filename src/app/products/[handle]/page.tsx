import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Icon } from '@/components/Icons';
import { Gallery, QuoteBox } from '@/components/ProductBuy';
import { ProductGrid } from '@/components/ProductCard';
import { Breadcrumbs, JsonLd } from '@/components/Section';
import { site, waLink } from '@/data/site';
import { getProduct, primaryCategory, products, related, toCard } from '@/lib/catalog';
import { fullName, imgUrl } from '@/lib/format';
import { keySpecs, splitSpecs } from '@/lib/specs';
import { ReadMore } from '@/components/ReadMore';
import { SpecTables } from '@/components/SpecTables';

type Params = { params: Promise<{ handle: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { handle } = await params;
  const p = getProduct(handle);
  if (!p) return {};
  const title = fullName(p.name, p.brand);
  return {
    title: title.length > 60 ? title.slice(0, 58).replace(/\s+\S*$/, '') + '…' : title,
    description: (p.summary || p.title).slice(0, 160),
    alternates: { canonical: `/products/${p.handle}/` },
    openGraph: { title, images: p.images[0] ? [{ url: imgUrl(p.images[0].src, 1200) }] : undefined },
  };
}

export default async function ProductPage({ params }: Params) {
  const { handle } = await params;
  const p = getProduct(handle);
  if (!p) notFound();

  const cat = primaryCategory(p);
  const rel = related(p, 4).map((r) => toCard(r));
  const title = fullName(p.name, p.brand);
  const { html: description, tables } = splitSpecs(p.html);
  const headline = keySpecs(tables);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: title,
          description: p.summary,
          image: p.images.slice(0, 4).map((i) => imgUrl(i.src, 1200)),
          ...(p.brand ? { brand: { '@type': 'Brand', name: p.brand } } : {}),
          url: `${site.url}/products/${p.handle}/`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
            ...(cat ? [{ '@type': 'ListItem', position: 2, name: cat.title, item: `${site.url}/collections/${cat.handle}/` }] : []),
            { '@type': 'ListItem', position: cat ? 3 : 2, name: title, item: `${site.url}/products/${p.handle}/` },
          ],
        }}
      />

      <div className="wrap pt-6">
        <Breadcrumbs
          items={[{ href: '/', label: 'Home' }, cat ? { href: `/collections/${cat.handle}/`, label: cat.title } : { href: '/collections/all/', label: 'Products' }, { label: p.name }]}
        />
      </div>

      <section className="pb-16 pt-6">
        <div className="wrap grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-14">
          <Gallery images={p.images} name={title} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              {p.brand &&
                (p.brandHandle ? (
                  <Link href={`/collections/${p.brandHandle}/`} className="eyebrow self-start text-accent hover:underline">
                    {p.brand}
                  </Link>
                ) : (
                  <span className="eyebrow text-accent">{p.brand}</span>
                ))}
              <h1 className="text-[clamp(26px,3vw,38px)] font-bold leading-[1.12] tracking-[-0.02em]">{p.name}</h1>
              {p.subtitle && <p className="text-base leading-relaxed text-muted">{p.subtitle}</p>}
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <span className={`size-2 rounded-full ${p.available ? 'bg-[#2F8F4E]' : 'bg-muted'}`} />
                {p.available ? 'In stock' : 'Currently sold out'}
              </span>
            </div>

            {p.variants.length > 1 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-semibold">Available options</span>
                <ul className="flex flex-wrap gap-2">
                  {p.variants.map((v) => (
                    <li
                      key={v.title}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${v.available ? 'border-line bg-white' : 'border-line-soft bg-paper text-muted line-through'}`}
                    >
                      {v.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {headline.length > 0 && (
              <div className="rounded-2xl bg-white p-4 ring-1 ring-line-soft sm:p-5">
                <dl className="grid grid-cols-2 gap-x-5 gap-y-3">
                  {headline.map(([k, v]) => (
                    <div key={k} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="truncate text-[12px] font-medium uppercase tracking-[0.06em] text-muted">{k}</dt>
                      <dd className="text-[15px] font-semibold leading-snug text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
                <a href="#specifications" className="nudge-host mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  All specifications
                  <Icon name="arrow" size={14} strokeWidth={2.2} className="nudge rotate-90" />
                </a>
              </div>
            )}

            <QuoteBox item={{ handle: p.handle, name: p.name, brand: p.brand, image: p.images[0]?.src ?? '' }} price={p.price} available={p.available} />

            <ul className="flex flex-col gap-3.5 text-sm text-ink-2">
              <li className="flex items-start gap-3">
                <Icon name="truck" size={20} className="shrink-0 text-ink" />
                <span>
                  <strong className="font-semibold text-ink">Delivery across the UAE.</strong> Terms and conditions apply.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="shield" size={20} className="shrink-0 text-ink" />
                <span>
                  <strong className="font-semibold text-ink">Manufacturer warranty.</strong> Service warranty on eligible products; spare parts are chargeable.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Icon name="card" size={20} className="shrink-0 text-ink" />
                <span>
                  <strong className="font-semibold text-ink">Flexible payment.</strong> Cash, card, bank transfer, cheque after delivery or advance.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {(description || tables.length > 0) && (
        <section className="border-y border-line bg-white py-14">
          <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-12">
              {description && (
                <div>
                  <h2 className="mb-5 text-2xl font-bold tracking-[-0.02em]">Product details</h2>
                  <ReadMore html={description} />
                </div>
              )}
              {tables.length > 0 && (
                <div id="specifications" className="scroll-mt-32">
                  <SpecTables tables={tables} />
                </div>
              )}
            </div>
            <aside className="flex flex-col gap-3 self-start rounded-2xl border border-line-soft bg-[#F8F8F6] p-6 lg:sticky lg:top-[140px]">
              <span className="text-base font-semibold">Need help choosing?</span>
              <span className="text-sm leading-relaxed text-muted">Tell us the job and we’ll suggest the right model and accessories.</span>
              <a
                href={waLink(`Hello Al Faiz, I need advice about: ${title}`)}
                target="_blank"
                rel="noopener"
                className="nudge-host inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-accent"
              >
                Talk to an expert
                <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
              </a>
            </aside>
          </div>
        </section>
      )}

      {rel.length > 0 && (
        <section className="py-16">
          <div className="wrap">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[clamp(24px,2.6vw,32px)] font-bold tracking-[-0.02em]">You may also need</h2>
              {cat && (
                <Link href={`/collections/${cat.handle}/`} className="nudge-host inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent">
                  More {cat.title}
                  <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
                </Link>
              )}
            </div>
            <ProductGrid items={rel} />
          </div>
        </section>
      )}
    </>
  );
}
