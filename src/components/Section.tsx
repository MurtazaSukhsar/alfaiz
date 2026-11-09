import Link from 'next/link';
import type { ReactNode } from 'react';

export function SectionHead({ title, intro, upper = false, className = '' }: { title: ReactNode; intro?: ReactNode; upper?: boolean; className?: string }) {
  return (
    <div className={`reveal mb-10 flex flex-col items-center gap-2.5 text-center ${className}`}>
      <h2
        className={`text-[clamp(30px,3.6vw,44px)] leading-[1.1] ${upper ? 'font-extrabold uppercase tracking-[0.01em]' : 'font-bold tracking-[-0.02em]'}`}
      >
        {title}
      </h2>
      {intro && <p className="max-w-[640px] text-[17px] leading-relaxed text-muted">{intro}</p>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {it.href ? (
              <Link href={it.href} className="text-ink-2 hover:text-accent">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="line-clamp-1 text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
