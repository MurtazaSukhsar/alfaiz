import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { Breadcrumbs, SectionHead } from '@/components/Section';
import { brandStrip, site, waLink } from '@/data/site';
import { collections, products } from '@/lib/catalog';

export const metadata: Metadata = {
  title: 'About Us',
  description: `Since ${site.since}, Al Faiz Electric & Hardware has supplied tools, hardware and materials to construction, marine, oil & gas, fabrication and automotive companies across the UAE and GCC.`,
  alternates: { canonical: '/pages/about-us/' },
};

const focus = [
  { title: 'Air compressors & fittings', text: 'Complete solutions for industrial and commercial use, from Italian ABAC, FIAC and AIRI units to Shamal twin-motor compressors.', href: '/collections/air-compressors/' },
  { title: 'SS & GI mesh', text: 'Strong, long-lasting stainless steel and galvanized iron mesh for construction, marine and oilfield projects.', href: '/collections/mesh/' },
  { title: 'Fasteners', text: 'Bolts, nuts, screws, anchors and washers for heavy-duty applications.', href: '/collections/fastners/' },
  { title: 'Power tools', text: 'Professional-grade tools for contractors, workshops and fabrication companies.', href: '/collections/power-tools/' },
];

const reasons = [
  'Recognised supplier in the UAE and GCC',
  'Strong client base across many industries and countries',
  'Competitive prices with no compromise on quality',
  'Partnerships with trusted international brands',
  'Long-term relationships built on service, trust and reliability',
];

export default function AboutPage() {
  const stats = [
    { n: String(site.since), l: 'Supplying industry since' },
    { n: String(products.length), l: 'Products listed' },
    { n: String(brandStrip.length), l: 'Global brands' },
    { n: String(site.exportCountries.length), l: 'Export countries' },
  ];
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <img src="/images/non-sparking.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-35" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,19,21,.95),rgba(17,19,21,.6))]" />
        <div className="wrap relative flex flex-col gap-5 py-20 sm:py-24">
          <div className="[&_a]:text-[#D5D8DC] [&_span]:text-white [&_nav]:text-[#C9CCD1]">
            <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'About us' }]} />
          </div>
          <span className="eyebrow text-accent-bright">About Al Faiz</span>
          <h1 className="max-w-[820px] text-[clamp(36px,5.4vw,68px)] font-extrabold uppercase leading-[1] tracking-[-0.01em]">
            Trusted industrial supplier in the UAE &amp; GCC
          </h1>
          <p className="max-w-[640px] text-lg leading-relaxed text-[#D5D8DC]">
            Since {site.since}, Al Faiz Electric &amp; Hardware has supported industries across the UAE with reliable tools, hardware and materials —
            earning the trust of companies in construction, contracting, marine, oil &amp; gas, fabrication and automotive.
          </p>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="wrap grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.l} className="flex flex-col gap-1 py-7 pr-4">
              <span className="text-[40px] font-extrabold leading-none tracking-[-0.02em]">{s.n}</span>
              <span className="text-sm text-muted">{s.l}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="reveal flex flex-col gap-5 lg:col-span-5">
            <span className="eyebrow text-accent">Our story</span>
            <h2 className="text-[clamp(28px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.02em]">Quality products, fair pricing, dependable service.</h2>
            <p className="text-[17px] leading-relaxed text-ink-2">
              From our showroom on BMW Road in Sharjah’s Industrial Area 1, we supply contractors, workshops and facilities across the Emirates.
              Our reach goes beyond the UAE, with clients in {site.exportCountries.slice(0, -1).join(', ')} and {site.exportCountries.at(-1)}.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/collections/all/" className="btn btn-primary">
                Browse products
                <span className="btn-chev">
                  <Icon name="chev" size={16} strokeWidth={2.2} />
                </span>
              </Link>
              <a href={waLink()} target="_blank" rel="noopener" className="btn btn-light">
                Talk to sales
                <span className="btn-chev">
                  <Icon name="chev" size={16} strokeWidth={2.2} />
                </span>
              </a>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {focus.map((f) => (
              <Link key={f.title} href={f.href} className="card lift reveal flex flex-col gap-3 p-6 text-ink">
                <span className="text-[15px] font-bold uppercase tracking-[0.04em]">{f.title}</span>
                <span className="text-[15px] leading-relaxed text-muted">{f.text}</span>
                <Icon name="arrow" strokeWidth={2} className="nudge mt-auto text-accent" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-[88px]">
        <div className="wrap">
          <SectionHead title="Why Work With Us" />
          <ul className="mx-auto grid max-w-[980px] gap-4 sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r} className="reveal flex items-start gap-3.5 rounded-2xl border border-line-soft bg-[#F8F8F6] p-5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
                  <Icon name="check" size={16} strokeWidth={2.4} />
                </span>
                <span className="pt-1 text-[15px] font-medium leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-24">
        <div className="wrap">
          <SectionHead title="Brands We Supply" intro={`${collections.filter((c) => c.kind === 'brand').length} brand collections in our catalog.`} />
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
            {brandStrip.map((b) => (
              <li key={b.handle}>
                <Link href={`/collections/${b.handle}/`} className="logo-tile card lift grid h-24 place-items-center p-4" aria-label={`Shop ${b.name} products`}>
                  <img src={`/brands/${b.handle}.png`} alt={b.name} className="max-h-10 w-auto max-w-full object-contain" loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
