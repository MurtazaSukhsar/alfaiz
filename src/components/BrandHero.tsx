import Link from 'next/link';
import { site, waLink } from '@/data/site';
import { Icon } from './Icons';

export type HeroTile = { href: string; brand: string; label: string; name: string; image: string };

/**
 * Home hero: headline and buttons on the left, a neat grid of six real products
 * from different brands on the right. Nothing rotates; every tile opens its product.
 */
export function BrandHero({ tiles, badge, title1, title2, text }: { tiles: HeroTile[]; badge: string; title1: string; title2: string; text: string }) {
  return (
    <section aria-labelledby="hero-title" className="pt-4 sm:pt-6">
      <div className="wrap">
        <div className="grid overflow-hidden rounded-[14px] bg-white ring-1 ring-line-soft lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* Words */}
          <div className="flex min-w-0 flex-col justify-center gap-4 px-5 pb-6 pt-5 sm:gap-6 sm:p-10 lg:p-12 lg:pr-6">
            {badge && <span className="hidden w-fit items-center gap-2 rounded-md bg-[#F5F5F3] px-3 py-1.5 text-[12.5px] font-semibold text-ink sm:inline-flex">
              <span className="size-1.5 rounded-full bg-accent" />
              {badge}
            </span>}

            <h2 id="hero-title" className="text-[clamp(34px,4.6vw,64px)] font-bold leading-[0.98] tracking-[-0.045em] text-ink">
              <span className="block">{title1}</span>
              <span className="block text-accent">{title2}</span>
            </h2>

            <p className="max-w-[440px] text-[15px] leading-relaxed text-ink-2 sm:text-[17px]">
              {text}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2.5">
              <Link href="/collections/all/" className="pill pill-lg fx footer-gradient justify-between text-white max-sm:w-full">
                Explore products
                <span className="pill-dot bg-white text-accent">
                  <Icon name="arrow" size={15} strokeWidth={2.4} />
                </span>
              </Link>
              <a
                href={waLink('Hello Al Faiz, I would like a quote for:')}
                target="_blank"
                rel="noopener"
                className="pill pill-lg pill-outline justify-center bg-white max-sm:w-full"
              >
                Get a quote
              </a>
            </div>

            <a href={site.phoneHref} className="hidden w-fit items-center gap-2 border-t border-line-soft pt-5 text-[14px] font-semibold text-ink-2 hover:text-accent sm:inline-flex">
              <Icon name="phone" size={15} />
              {site.phone}
            </a>
          </div>

          {/* Product grid */}
          <ul className="order-first grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-5 lg:order-none lg:p-6 lg:pl-0">
            {tiles.slice(0, 6).map((t, i) => (
              <li key={t.href} className="min-w-0">
                <Link
                  href={t.href}
                  title={t.name}
                  className="group flex h-full flex-col rounded-[10px] bg-[#F4F4F1] p-2 transition duration-300 hover:bg-[#EDEDE9] sm:p-3"
                >
                  <span className="grid aspect-square place-items-center p-1 sm:p-3 lg:aspect-[1/0.92]">
                    <img
                      src={t.image}
                      alt={t.name}
                      loading={i < 3 ? 'eager' : 'lazy'}
                      className="max-h-full max-w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-[1.07]"
                    />
                  </span>
                  <span className="mt-1 flex items-end justify-between gap-2">
                    <span className="flex min-w-0 flex-col leading-tight">
                      <span className="truncate text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted sm:text-[11.5px]">{t.brand}</span>
                      <span className="truncate text-[12.5px] font-semibold text-ink sm:text-[15px]">{t.label}</span>
                    </span>
                    <span className="hidden size-8 shrink-0 place-items-center rounded-full bg-white text-ink transition duration-300 group-hover:-rotate-45 group-hover:bg-accent group-hover:text-white sm:grid">
                      <Icon name="arrow" size={13} strokeWidth={2.2} />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
