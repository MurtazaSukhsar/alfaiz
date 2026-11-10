import Link from 'next/link';
import type { CSSProperties } from 'react';
import { brandEdit, brandStrip, faqs, features, heroSlides, industries, moreCategories, ranges, reviews, site, waLink } from '@/data/site';
import { countIn, getCollection, getProduct, products, productsIn } from '@/lib/catalog';
import { imgUrl } from '@/lib/format';
import { Icon, type IconName } from '../Icons';
import { SectionHead } from './SectionHead';
import { Ticker } from '../fx/Ticker';
import { BrandEdit, type EditIssue, type EditItem } from '../BrandEdit';
import { BrandHero, type HeroBrand } from '../BrandHero';
import { TestimonialsSection } from '../ui/testimonials-with-marquee';

/* ---------------------------------------------------------------- Brand hero */

export function Hero() {
  const brands: HeroBrand[] = heroSlides.map((h) => ({
    brand: h.brand,
    name: h.name,
    tagline: h.tagline,
    count: countIn(h.brand),
    products: h.products.flatMap(({ handle, label }) => {
      const p = getProduct(handle);
      return p?.images.length ? [{ href: `/products/${p.handle}/`, label, name: p.name, image: imgUrl(p.images[0].src, 800) }] : [];
    }),
  }));
  return <BrandHero brands={brands} total={products.length} brandTotal={brandStrip.length} />;
}

/* ---------------------------------------------------------------- The Brand Edit (magazine spread) */

export function Edit() {
  const issues: EditIssue[] = brandEdit.flatMap((e) => {
    const look = heroSlides.find((h) => h.brand === e.brand);
    const items: EditItem[] = e.products.flatMap(({ handle, label, spec }) => {
      const p = getProduct(handle);
      return p && p.images.length ? [{ href: `/products/${p.handle}/`, label, spec, name: p.name, image: imgUrl(p.images[0].src, 600) }] : [];
    });
    if (!look || !items.length) return [];
    return [
      {
        brand: e.brand,
        name: look.name,
        note: e.note,
        count: countIn(e.brand),
        bg: look.bg,
        accent: look.accent,
        onAccent: look.onAccent,
        items: items.slice(0, 3),
      },
    ];
  });
  return <BrandEdit issues={issues} />;
}

/* ---------------------------------------------------------------- All categories (index grid) */

const EXTRA_CATEGORIES = ['construction-tools', 'wood-works', 'scaffolding'];

export function Categories() {
  const tiles = [
    ...ranges.map((r) => ({ handle: r.handle, title: r.title, image: r.image })),
    ...[...moreCategories, ...EXTRA_CATEGORIES].flatMap((h) => {
      const c = getCollection(h);
      const src = productsIn(h).find((p) => p.images.length)?.images[0].src;
      return c && src ? [{ handle: h, title: c.title, image: imgUrl(src, 300) }] : [];
    }),
  ];
  return (
    <section aria-labelledby="cats-title" className="py-14 sm:py-20">
      <div className="wrap">
        <SectionHead
          num="02"
          label="Categories"
          id="cats-title"
          title={`All ${tiles.length} categories`}
          aside={
            <Link href="/collections/all/" className="nudge-host inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-accent">
              View all {products.length} products
              <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
            </Link>
          }
        />

        <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-7">
          {tiles.map((t) => (
            <li key={t.handle} className="reveal">
              <Link
                href={`/collections/${t.handle}/`}
                className="spot group flex h-full flex-col items-center gap-2 rounded-[20px] bg-white p-2.5 pb-3 text-center ring-1 ring-line-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_32px_-20px_rgba(21,23,26,.45)] hover:ring-accent/40 sm:p-3 sm:pb-4"
              >
                <span className="grid aspect-square w-full place-items-center rounded-2xl bg-[#F4F4F1] p-3 transition duration-300 group-hover:bg-accent-soft sm:p-4">
                  <img src={t.image} alt="" loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 ease-out group-hover:scale-110" />
                </span>
                <span className="text-[12.5px] font-semibold leading-tight text-ink sm:text-[14px]">{t.title}</span>
                <span className="-mt-1 text-[11.5px] text-muted sm:text-[12.5px]">
                  <Ticker value={countIn(t.handle)} /> products
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="reveal mt-3 h-[150px] sm:h-[170px]">
          <AllProductsTile />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Industries (one moving row) */

/** What each industry typically buys, as category handles (the first one is where each card links). */
const INDUSTRY_CATS: Record<string, string[]> = {
  Construction: ['construction-tools', 'power-tools', 'fastners', 'scaffolding', 'safety-products'],
  Manufacturing: ['air-compressors', 'pneumatic-tools', 'abrasives', 'welding', 'safety-products'],
  'Oil & Gas': ['non-sparking-tools', 'safety-products', 'air-compressors', 'generator'],
  'Marine & Shipbuilding': ['non-sparking-tools', 'welding', 'fastners', 'pressure-washers', 'abrasives'],
  'Electrical Contractors': ['power-tools', 'drill-bits', 'construction-tools', 'safety-products', 'fastners'],
  HVAC: ['drill-bits', 'fastners', 'adhesives-sealants', 'power-tools', 'packaging-and-sealing'],
  Automotive: ['garage-tools', 'pneumatic-tools', 'air-compressors', 'pressure-washers'],
  'DIY & Home Improvement': ['power-tools', 'drill-bits', 'wood-works', 'garage-tools', 'adhesives-sealants'],
};

function IndustryTrack({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="animate-marquee flex shrink-0 [gap:var(--gap)] group-hover:[animation-play-state:paused]">
      {industries.map((it) => {
        const first = getCollection((INDUSTRY_CATS[it.title] ?? [])[0] ?? '');
        return (
          <li key={it.title}>
            <Link
              href={first ? `/collections/${first.handle}/` : '/collections/all/'}
              tabIndex={hidden ? -1 : undefined}
              className="flex h-full w-[300px] items-center gap-4 rounded-2xl border border-transparent bg-paper p-4 transition hover:border-accent/40 hover:bg-white sm:w-[340px] sm:p-5"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-accent">
                <Icon name={it.icon as IconName} size={21} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[16px] font-semibold leading-tight text-ink">{it.title}</span>
                <span className="text-[13.5px] leading-snug text-muted">{it.text}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Industries() {
  return (
    <section aria-labelledby="ind-title" className="band-white py-14 sm:py-20">
      <div className="wrap">
        <SectionHead
          num="04"
          label="Industries we serve"
          id="ind-title"
          title={`Supplying every trade since ${site.since}`}
          intro="Hardware, tools and industrial supplies for businesses across the UAE and beyond."
          aside={
            <Link href="/pages/bulk-special-product-request/" className="pill pill-dark">
              Bulk &amp; special request
              <span className="pill-dot bg-white/15">
                <Icon name="arrow" size={14} strokeWidth={2.2} />
              </span>
            </Link>
          }
        />

        <div className="group flex overflow-hidden py-1 [--duration:60s] [--gap:12px] [gap:var(--gap)] [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
          <IndustryTrack />
          <IndustryTrack hidden />
        </div>
      </div>
    </section>
  );
}

const ALL_TILE_PICKS = [
  'milwaukee-m18fdd2-502x-m18-fuel-18v-cordless-drill-driver-kit-13mm-135nm-2-speed-2-x-5-0ah-batteries-m12-18-fc-charger-hd-box',
  'airi-500-litre-7-5hp-3-phase-industrial-air-compressor-5-5kw-380v-2-stage-belt-drive-heavy-duty-piston-compressor-827-l-min-11-bar-made-in-italy-for-factory-workshop-industrial-use-uae-al-faiz-hardware',
  'makita-hr002g-xgt-40v-max-sds-plus-28mm-combination-hammer-3-2j-al-faiz-hardware-uae',
  'vaultex-jpy-patch-palm-leather-safety-gloves-uae-industrial-hand-protection-by-al-faiz-hardware',
  'edon-wsme-200-tig-welding-machine-for-aluminum-ac-dc-inverter-welder-al-faiz-electric-and-hardware-uae',
  'bosch-gws-26-230-b-professional-angle-grinder-230mm-2600w-with-vibration-control',
];

/** Closing tile of the category grid: a floating mosaic of real products + one clear call to action. */
function AllProductsTile() {
  const thumbs = ALL_TILE_PICKS.flatMap((h) => {
    const p = getProduct(h);
    return p?.images[0] ? [{ src: imgUrl(p.images[0].src, 200), name: p.name }] : [];
  });
  return (
    <Link
      href="/collections/all/"
      className="group relative isolate flex h-full items-center justify-between gap-4 overflow-hidden rounded-[22px] bg-ink p-5 text-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-20px_rgba(21,23,26,.6)] sm:p-6"
    >
      <span aria-hidden="true" className="absolute -bottom-24 -left-16 -z-10 size-64 rounded-full bg-accent/45 blur-3xl transition duration-500 group-hover:bg-accent/70" />
      <span aria-hidden="true" className="absolute inset-0 -z-10 opacity-[0.07] [background-image:radial-gradient(#fff_1px,transparent_1.2px)] [background-size:18px_18px]" />

      <span className="flex min-w-0 flex-col gap-3">
        <span className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">Can’t see your category?</span>
          <span className="text-[24px] font-semibold leading-[1.1] tracking-[-0.02em] sm:text-[30px]">
            Browse all <Ticker value={products.length} duration={1400} className="text-accent-bright" /> products
          </span>
          <span className="text-[13px] text-white/60 sm:text-sm">
            {brandStrip.length} brands · filter, search &amp; add to cart
          </span>
        </span>
        <span className="mt-1 inline-flex h-10 w-fit items-center gap-2 rounded-full bg-white pl-4 pr-1.5 text-sm font-semibold text-ink transition duration-300 group-hover:bg-accent group-hover:text-white">
          Shop all products
          <span className="grid size-7 place-items-center rounded-full bg-ink text-white transition duration-300 group-hover:-rotate-45 group-hover:bg-white group-hover:text-accent">
            <Icon name="arrow" size={14} strokeWidth={2.2} />
          </span>
        </span>
      </span>

      <span aria-hidden="true" className="hidden shrink-0 grid-cols-3 gap-2 sm:grid">
        {thumbs.map((t, i) => (
          <span
            key={t.src}
            className="all-thumb grid size-[64px] place-items-center rounded-2xl bg-white p-1.5 shadow-[0_8px_18px_-8px_rgba(0,0,0,.5)] lg:size-[72px]"
            style={{ '--i': i } as CSSProperties}
          >
            <img src={t.src} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
          </span>
        ))}
      </span>
    </Link>
  );
}

/* ---------------------------------------------------------------- Brands (moving strip under the hero) */

export function BrandMarquee() {
  const Track = ({ hidden = false }: { hidden?: boolean }) => (
    <ul aria-hidden={hidden || undefined} className="animate-marquee flex shrink-0 [gap:var(--gap)] group-hover:[animation-play-state:paused]">
      {brandStrip.map((b) => (
        <li key={b.handle}>
          <Link
            href={`/collections/${b.handle}/`}
            title={`Shop ${b.name}`}
            tabIndex={hidden ? -1 : undefined}
            className="spot group/logo flex h-24 w-[190px] items-center justify-center rounded-2xl border border-line-soft bg-white px-6 shadow-[0_1px_2px_rgba(21,23,26,.04)] transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_28px_-14px_rgba(21,23,26,.3)] sm:h-28 sm:w-[230px]"
          >
            <img src={`/brands/${b.handle}.png`} alt={hidden ? '' : b.name} loading="lazy" className="max-h-12 w-auto max-w-full object-contain transition duration-300 group-hover/logo:scale-105 sm:max-h-[56px]" />
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section id="brands" aria-labelledby="brands-title" className="band-white py-14 sm:py-20">
      <div className="wrap">
        <SectionHead
          num="01"
          label="Our brands"
          id="brands-title"
          title={`Genuine tools from ${brandStrip.length} trusted brands`}
          aside={<p className="max-w-[260px] text-[15px] leading-relaxed text-muted">Tap a brand to see everything we stock from them.</p>}
        />
        <div className="group flex overflow-hidden py-2 [--duration:55s] [--gap:16px] [gap:var(--gap)] [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]">
          <Track />
          <Track hidden />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Testimonials */

export function Testimonials() {
  return (
    <TestimonialsSection
      title="What Our Clients Say About Us"
      description="Trusted by thousands of customers across the UAE."
      testimonials={reviews.map((r) => ({ author: { name: r.name, handle: 'Al Faiz customer' }, text: r.text }))}
    />
  );
}

/* ---------------------------------------------------------------- Trust strip */

export function TrustStrip() {
  return (
    <section id="about" aria-label="Why buy from Al Faiz" className="pb-14 pt-4 sm:pb-20 sm:pt-5">
      <div className="wrap">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="flex items-center gap-4 bg-white p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#F3F4F1] text-ink">
                <Icon name={f.icon as IconName} size={20} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{f.title}</span>
                <span className="text-[13px] leading-snug text-muted">{f.short}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- FAQ */

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="band-white py-14 sm:py-20">
      <div className="wrap">
        <SectionHead num="05" label="Questions" id="faq-title" title="Frequently asked questions" />
      </div>
      <div className="wrap grid gap-8 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col items-start gap-3 lg:col-span-3">
          <p className="text-[15px] leading-relaxed text-muted">
            Something else? Call {site.phone} or message us on WhatsApp.
          </p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Link href="/pages/faq/" className="pill pill-dark nudge-host">
              All questions
              <span className="pill-dot bg-white/15">
                <Icon name="arrow" size={14} strokeWidth={2.2} />
              </span>
            </Link>
            <a href={waLink()} target="_blank" rel="noopener" className="pill pill-outline">
              <Icon name="chat" size={16} />
              Chat with us
            </a>
          </div>
        </div>
        <div className="border-t border-line lg:col-span-9">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border-b border-line">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-6 py-3.5 text-[16px] font-medium text-ink">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-ink ring-1 ring-line-soft transition duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-white">
                  <Icon name="plus" size={15} strokeWidth={2} />
                </span>
              </summary>
              <p className="max-w-[640px] pb-5 pr-12 text-[15px] leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
