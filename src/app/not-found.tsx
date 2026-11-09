import Link from 'next/link';
import { Icon } from '@/components/Icons';
import { waLink } from '@/data/site';

export default function NotFound() {
  return (
    <section className="py-28">
      <div className="wrap flex flex-col items-center gap-4 text-center">
        <span className="eyebrow text-accent">Error 404</span>
        <h1 className="text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.02em]">This page has moved or doesn’t exist</h1>
        <p className="max-w-[520px] text-base leading-relaxed text-muted">
          Try the search bar above, browse the full catalog, or send us the product name and we’ll help.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/collections/all/" className="btn btn-primary">
            Browse products
            <span className="btn-chev">
              <Icon name="chev" size={16} strokeWidth={2.2} />
            </span>
          </Link>
          <a href={waLink()} target="_blank" rel="noopener" className="btn btn-light">
            Ask on WhatsApp
            <span className="btn-chev">
              <Icon name="chev" size={16} strokeWidth={2.2} />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
