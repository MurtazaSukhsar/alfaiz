import Link from 'next/link';
import { footerRanges, site, waLink } from '@/data/site';
import { Icon } from './Icons';
import { LogoMark } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer id="contact" className="grid-pattern text-[#C9CCD1]">
      <div className="wrap flex flex-wrap items-center justify-between gap-x-10 gap-y-6 py-16">
        <div className="flex max-w-[560px] flex-[1_1_460px] flex-col gap-2.5">
          <h2 className="text-[clamp(30px,3.6vw,48px)] font-semibold leading-[1.05] tracking-[-0.03em] text-white">Need a tool quote today?</h2>
          <p className="text-[17px] leading-relaxed">Tell us the product, model and quantity — we reply by phone, WhatsApp or email.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={waLink()} target="_blank" rel="noopener" className="btn btn-primary normal-case tracking-normal">
            <Icon name="chat" size={17} strokeWidth={2} />
            WhatsApp {site.phone}
            <span className="btn-chev">
              <Icon name="chev" size={15} strokeWidth={2.2} />
            </span>
          </a>
          <a href={`mailto:${site.email}`} className="btn btn-glass normal-case tracking-normal">
            <Icon name="mail" size={17} />
            {site.email}
            <span className="btn-chev">
              <Icon name="chev" size={15} strokeWidth={2.2} />
            </span>
          </a>
        </div>
      </div>

      <div className="wrap pb-7">
        <div className="grid gap-9 border-t border-white/10 pt-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-3 self-start rounded-xl bg-white py-3 pl-3.5 pr-4 text-ink">
              <LogoMark className="h-[42px] w-[26px]" />
              <span className="flex flex-col border-l border-[#E2E3DF] pl-3 leading-tight">
                <span className="text-sm font-bold">Electric &amp; Hardware</span>
                <span className="text-xs text-muted">Sharjah · UAE</span>
              </span>
            </span>
            <p className="text-sm leading-relaxed">
              Sharjah-based supplier of tools, machinery and industrial supplies to businesses across the UAE and GCC since {site.since}.
            </p>
            <a href={site.instagram} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 self-start text-sm text-white hover:underline">
              <Icon name="instagram" />
              {site.instagramHandle}
            </a>
          </div>

          <nav aria-label="Product ranges" className="flex flex-col gap-2.5 text-sm">
            <h3 className="eyebrow mb-1.5 text-white">Product ranges</h3>
            {footerRanges.map((r) => (
              <Link key={r.handle} href={`/collections/${r.handle}/`} className="hover:text-white">
                {r.title}
              </Link>
            ))}
          </nav>

          <nav aria-label="Quick links" className="flex flex-col gap-2.5 text-sm">
            <h3 className="eyebrow mb-1.5 text-white">Quick links</h3>
            <Link href="/pages/about-us/" className="hover:text-white">About Us</Link>
            <Link href="/collections/all/" className="hover:text-white">All Products</Link>
            <Link href="/#brands" className="hover:text-white">Brands</Link>
            <Link href="/#faq" className="hover:text-white">FAQ</Link>
            <Link href="/cart/" className="hover:text-white">Cart</Link>
            <Link href="/pages/contact/" className="hover:text-white">Contact</Link>
          </nav>

          <div className="flex flex-col gap-3 text-sm leading-relaxed">
            <h3 className="eyebrow mb-1 text-white">Contact us</h3>
            <a href={site.phoneHref} className="flex items-center gap-2.5 hover:text-white">
              <Icon name="phone" size={16} className="shrink-0" />
              {site.phone}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 hover:text-white">
              <Icon name="mail" size={16} className="shrink-0" />
              {site.email}
            </a>
            <a href={site.mapsUrl} target="_blank" rel="noopener" className="flex items-start gap-2.5 hover:text-white">
              <Icon name="pin" size={16} className="mt-0.5 shrink-0" />
              <span>
                {site.street}, {site.city}, UAE
              </span>
            </a>
            <span className="flex items-center gap-2.5">
              <Icon name="clock" size={16} className="shrink-0" />
              {site.hours}
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-1.5 border-t border-white/10 pt-6 text-center text-[13px] text-[#9A9FA6]">
          <span>
            © {year} {site.legal} All rights reserved.
          </span>
          <span>
            Developed by{' '}
            <a href={site.credit.url} target="_blank" rel="noopener" className="text-[#C9CCD1] hover:text-white">
              {site.credit.name}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
