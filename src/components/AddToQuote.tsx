'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuote } from './QuoteProvider';
import { Icon } from './Icons';
import type { QuoteItem } from '@/lib/types';

/** Compact "Add to cart" control used on product cards. */
export function AddToQuote({ item }: { item: Omit<QuoteItem, 'qty'> }) {
  const { add, has, ready } = useQuote();
  const [flash, setFlash] = useState(false);
  const inList = ready && has(item.handle);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 1600);
    return () => clearTimeout(t);
  }, [flash]);

  if (inList && !flash) {
    return (
      <Link
        href="/cart/"
        title="In your cart"
        aria-label={`${item.name} is in your cart`}
        className="fx inline-flex h-9 items-center gap-1.5 rounded-full bg-ink pl-2.5 pr-3 text-[13px] font-semibold text-white hover:bg-accent"
      >
        <Icon name="check" size={14} strokeWidth={2.4} />
        In cart
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        add(item);
        setFlash(true);
      }}
      aria-label={`Add ${item.name} to cart`}
      className={`fx inline-flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-[13px] font-semibold ${
        flash ? 'anim-pop bg-ink text-white' : 'bg-chip text-ink hover:bg-ink hover:text-white'
      }`}
    >
      <Icon name={flash ? 'check' : 'cart'} size={14} strokeWidth={2.2} />
      {flash ? 'Added' : (
        <>
          Add<span className="hidden sm:inline"> to cart</span>
        </>
      )}
    </button>
  );
}
