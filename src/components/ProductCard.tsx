import Link from 'next/link';
import type { Card } from '@/lib/types';
import { imgUrl, priceLabel, srcSet } from '@/lib/format';
import { AddToQuote } from './AddToQuote';
import { Icon } from './Icons';

export function ProductCard({ p, eager = false, flat = false }: { p: Card; eager?: boolean; flat?: boolean }) {
  const href = `/products/${p.handle}/`;
  return (
    <article
      className={`spot group relative flex h-full w-full flex-col ${
        flat ? '' : 'rounded-3xl bg-white p-2 transition duration-300 hover:shadow-[0_18px_40px_rgba(21,23,26,.08)] sm:p-2.5'
      }`}
    >
      {p.tag && (
        <span
          className={`absolute z-10 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink shadow-[0_1px_2px_rgba(21,23,26,.08)] ${
            flat ? 'left-2.5 top-2.5' : 'left-4 top-4 sm:left-5 sm:top-5'
          }`}
        >
          {p.tag}
        </span>
      )}
      {!p.available && (
        <span className="absolute right-4 top-4 z-10 rounded-md bg-ink px-2.5 py-1 text-[11px] font-semibold text-white sm:right-5 sm:top-5">Sold out</span>
      )}
      <Link href={href} tabIndex={-1} aria-hidden="true" className={`block aspect-square overflow-hidden bg-[#F3F4F1] p-5 sm:p-7 ${flat ? 'rounded-2xl' : 'rounded-[10px]'}`}>
        {p.image ? (
          <img
            src={imgUrl(p.image, 500)}
            srcSet={srcSet(p.image, [300, 500, 700])}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 30vw, 45vw"
            alt=""
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            className="size-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="grid size-full place-items-center text-muted">
            <Icon name="box" size={32} />
          </span>
        )}
      </Link>
      <div className={`flex flex-1 flex-col gap-1 pt-3.5 ${flat ? 'px-0.5' : 'px-2 pb-1.5 sm:px-2.5'}`}>
        {p.brand && <span className="text-[12px] font-medium text-muted">{p.brand}</span>}
        <Link href={href} className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink hover:text-accent">
          {p.name}
        </Link>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-[13px] leading-tight text-muted">
            {p.price > 0 ? (
              priceLabel(p.price)
            ) : (
              <>
                <span className="hidden sm:inline">Price on request</span>
                <span className="sm:hidden">On request</span>
              </>
            )}
          </span>
          <AddToQuote item={{ handle: p.handle, name: p.name, brand: p.brand, image: p.image }} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ items, eagerFirst = 0 }: { items: Card[]; eagerFirst?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((p, i) => (
        <ProductCard key={p.handle} p={p} eager={i < eagerFirst} />
      ))}
    </div>
  );
}
