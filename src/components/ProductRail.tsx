'use client';

import Link from 'next/link';
import { useRef } from 'react';
import type { Card } from '@/lib/types';
import { Icon } from './Icons';
import { ProductCard } from './ProductCard';

/** A titled, horizontally scrolling row of product cards (swipe on phones, arrows on desktop). */
export function ProductRail({ title, href, count, items }: { title: string; href: string; count: number; items: Card[] }) {
  const track = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: 'smooth' });
  };

  return (
    <section aria-label={title} className="py-8 sm:py-10">
      <div className="wrap">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">{title}</h2>
          <div className="flex items-center gap-2">
            <Link href={href} className="nudge-host inline-flex h-10 items-center gap-1.5 px-1 text-sm font-semibold text-accent">
              See all {count}
              <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
            </Link>
            <span className="hidden gap-2 pl-2 md:flex">
              <button type="button" onClick={() => scroll(-1)} aria-label={`Previous ${title}`} className="rail-btn fx">
                <Icon name="arrow" size={16} strokeWidth={2} className="rotate-180" />
              </button>
              <button type="button" onClick={() => scroll(1)} aria-label={`More ${title}`} className="rail-btn fx">
                <Icon name="arrow" size={16} strokeWidth={2} />
              </button>
            </span>
          </div>
        </div>
        <div
          ref={track}
          className="-mx-[clamp(16px,4vw,24px)] flex snap-x snap-mandatory scroll-px-[clamp(16px,4vw,24px)] gap-3 overflow-x-auto px-[clamp(16px,4vw,24px)] pb-2 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
        >
          {items.map((p) => (
            <div key={p.handle} className="flex w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[calc((100%-64px)/5)]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
