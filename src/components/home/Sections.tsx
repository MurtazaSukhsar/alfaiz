import Link from 'next/link';
import { brandEdit, brandStrip, faqs, features, heroSlides, ranges, reviews, site, waLink } from '@/data/site';
import { countIn, getProduct, products } from '@/lib/catalog';
import { imgUrl } from '@/lib/format';
import { Icon, type IconName } from '../Icons';
import { BrandEdit, type EditIssue, type EditItem } from '../BrandEdit';
import { HeroSlider, type HeroSlide } from '../HeroSlider';
import { TestimonialsSection } from '../ui/testimonials-with-marquee';

/* ---------------------------------------------------------------- Brand hero slider */

export function Hero() {
  const slides: HeroSlide[] = heroSlides.map((s) => ({
    brand: s.brand,
    name: s.name,
    tagline: s.tagline,
    count: countIn(s.brand),
    bg: s.bg,
    accent: s.accent,
    onAccent: s.onAccent,
    products: s.products.flatMap(({ handle, label }) => {
      const p = getProduct(handle);
      return p && p.images.length ? [{ name: p.name, label, image: imgUrl(p.images[0].src, 700) }] : [];
    }),
  }));
  return <HeroSlider slides={slides} />;
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

/* ---------------------------------------------------------------- Categories (bento) */

const CAT_LOOK: Record<string, { tint: string; note: string; span: string; img: string }> = {
  'power-tools': { tint: '#FFF3D4', note: 'Drills, saws, breakers & grinders', span: 'col-span-2 row-span-2', img: 'h-[80%] w-[86%]' },
  'air-compressors': { tint: '#E3EFF9', note: 'From 100 to 1,000 litre tanks', span: 'col-span-2', img: 'h-full w-[52%]' },
  'non-sparking-tools': { tint: '#F6EADB', note: 'Brass & bronze safety tools', span: '', img: 'h-[62%] w-[88%]' },
  'pneumatic-tools': { tint: '#ECEBF8', note: 'Air impact wrenches & drills', span: '', img: 'h-[62%] w-[88%]' },
  'garage-tools': { tint: '#FBE6E3', note: 'Jacks, jump starters & tool sets', span: '', img: 'h-[66%] w-[66%]' },
  fastners: { tint: '#E5F1E9', note: 'Bolts, nuts, screws & anchors', span: '', img: 'h-[66%] w-[62%]' },
  'drill-bits': { tint: '#ECEFF3', note: 'SDS, HSS, glass & wood bits', span: '', img: 'h-[78%] w-[44%]' },
  abrasives: { tint: '#F2ECE4', note: 'Cutting, grinding & diamond discs', span: '', img: 'h-[66%] w-[62%]' },
  'safety-products': { tint: '#FFEFDF', note: 'Gloves, masks & workwear', span: 'col-span-2', img: 'h-full w-[46%]' },
};

export function Categories() {
  const lead = getProduct('dewalt-dck355p2t-qw-18v-xr-3pc-kit-2-5-0ah-batteries')?.images[0]?.src;
  return (
    <section aria-labelledby="cats-title" className="pt-12 sm:pt-16">
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 sm:mb-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-accent">Categories</span>
            <h2 id="cats-title" className="text-[clamp(26px,3vw,38px)] font-semibold leading-[1.08] tracking-[-0.025em]">
              Shop by category
            </h2>
          </div>
          <Link href="/collections/all/" className="nudge-host inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-accent">
            View all {products.length} products
            <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
          </Link>
        </div>

        <ul className="grid auto-rows-[172px] grid-cols-2 gap-3 sm:auto-rows-[210px] sm:gap-4 lg:auto-rows-[230px] lg:grid-cols-4">
          {ranges.map((r) => {
            const look = CAT_LOOK[r.handle] ?? { tint: '#EEEFEC', note: '', span: '', img: 'h-[55%] w-[65%]' };
            const big = r.handle === 'power-tools';
            const src = big && lead ? imgUrl(lead, 1000) : r.image;
            return (
              <li key={r.handle} className={`reveal ${look.span}`}>
                <Link
                  href={`/collections/${r.handle}/`}
                  className="group relative isolate flex h-full flex-col overflow-hidden rounded-[22px] p-4 transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_40px_-22px_rgba(21,23,26,.45)] sm:p-5"
                  style={{ background: look.tint }}
                >
                  <span className="relative z-10 flex max-w-[78%] flex-col gap-1">
                    <span className={`font-semibold leading-tight tracking-[-0.02em] text-ink ${big ? 'text-[26px] sm:text-[34px]' : 'text-[16px] sm:text-[19px]'}`}>
                      {r.title}
                    </span>
                    <span className={`leading-snug text-ink-2 ${big ? 'text-[15px]' : 'hidden text-[13px] sm:block'}`}>{look.note}</span>
                    <span className="mt-1.5 w-fit rounded-full bg-white/75 px-2.5 py-0.5 text-[12px] font-semibold text-ink-2 backdrop-blur">
                      {countIn(r.handle)} products
                    </span>
                  </span>

                  <span className={`pointer-events-none absolute bottom-0 right-0 flex items-end justify-end ${look.img} ${big ? 'p-6 sm:p-10' : 'p-3 sm:p-4'}`}>
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-[1.07]"
                    />
                  </span>

                  <span className={`absolute bottom-4 left-4 z-10 grid place-items-center rounded-full bg-white text-ink shadow-[0_1px_2px_rgba(21,23,26,.08)] transition duration-300 group-hover:-rotate-45 group-hover:bg-ink group-hover:text-white sm:bottom-5 sm:left-5 ${big ? 'size-12' : 'size-9'}`}>
                    <Icon name="arrow" size={big ? 18 : 15} strokeWidth={2.2} />
                  </span>
                </Link>
              </li>
            );
          })}
          <li className="reveal col-span-2">
            <Link
              href="/collections/all/"
              className="group relative isolate flex h-full flex-col justify-between overflow-hidden rounded-[22px] bg-ink p-5 text-white transition duration-300 hover:-translate-y-1 hover:bg-accent sm:p-6"
            >
              <span aria-hidden="true" className="absolute -right-6 -top-10 -z-10 text-[160px] font-extrabold leading-none tracking-[-0.06em] text-white/[0.06] sm:text-[200px]">
                {products.length}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[13px] font-semibold uppercase tracking-[0.16em] text-white/60">Everything in one place</span>
                <span className="text-[24px] font-semibold leading-tight tracking-[-0.02em] sm:text-[30px]">All {products.length} products</span>
              </span>
              <span className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/70">Filter by brand or category</span>
                <span className="grid size-11 place-items-center rounded-full bg-white text-ink transition duration-300 group-hover:-rotate-45">
                  <Icon name="arrow" size={17} strokeWidth={2.2} />
                </span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
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
            className="flex h-24 w-[190px] items-center justify-center rounded-2xl border border-line-soft bg-white px-6 shadow-[0_1px_2px_rgba(21,23,26,.04)] transition duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-[0_16px_28px_-14px_rgba(21,23,26,.3)] sm:h-28 sm:w-[230px]"
          >
            <img src={`/brands/${b.handle}.png`} alt={hidden ? '' : b.name} loading="lazy" className="max-h-12 w-auto max-w-full object-contain sm:max-h-[56px]" />
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section id="brands" aria-labelledby="brands-title" className="pt-12 sm:pt-16">
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 sm:mb-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-accent">Our brands</span>
            <h2 id="brands-title" className="text-[clamp(26px,3vw,38px)] font-semibold leading-[1.08] tracking-[-0.025em]">
              Genuine tools from {brandStrip.length} trusted brands
            </h2>
          </div>
          <p className="max-w-[340px] text-[15px] leading-relaxed text-muted">Tap a brand to see everything we stock from them.</p>
        </div>
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
      title="Trusted by contractors and workshops"
      description="What customers say about buying their tools from Al Faiz."
      testimonials={reviews.map((r) => ({ author: { name: r.name, handle: 'Al Faiz customer' }, text: r.text }))}
    />
  );
}

/* ---------------------------------------------------------------- Trust strip */

export function TrustStrip() {
  return (
    <section id="about" aria-label="Why buy from Al Faiz" className="py-8 sm:py-10">
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
    <section id="faq" className="pb-20 pt-10 sm:pb-24 sm:pt-14">
      <div className="wrap grid gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="flex flex-col items-start gap-3 lg:col-span-4">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] sm:text-[32px]">Frequently asked questions</h2>
          <p className="text-[15px] leading-relaxed text-muted">
            Something else? Call {site.phone} or message us on WhatsApp.
          </p>
          <a href={waLink()} target="_blank" rel="noopener" className="pill pill-dark mt-2">
            <Icon name="chat" size={16} />
            Chat with us
          </a>
        </div>
        <div className="border-t border-line lg:col-span-8">
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
