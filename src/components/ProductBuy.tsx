'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site, waLink } from '@/data/site';
import { fullName, imgUrl, priceLabel } from '@/lib/format';
import type { Img } from '@/lib/types';
import { Icon } from './Icons';
import { useQuote } from './QuoteProvider';

export function Gallery({ images, name }: { images: Img[]; name: string }) {
  const [i, setI] = useState(0);
  const cur = images[i];
  return (
    <div className="flex flex-col gap-3">
      <div className="card grid aspect-square place-items-center overflow-hidden p-[clamp(20px,4vw,48px)]">
        {cur ? (
          <img
            key={cur.src}
            src={imgUrl(cur.src, 900)}
            alt={cur.alt || name}
            fetchPriority="high"
            className="anim-fade size-full object-contain [animation-duration:.35s]"
          />
        ) : (
          <Icon name="box" size={48} className="text-muted" />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((im, k) => (
            <button
              key={im.src}
              type="button"
              onClick={() => setI(k)}
              aria-label={`Show image ${k + 1} of ${images.length}`}
              aria-pressed={k === i}
              className={`grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-xl border bg-white p-1.5 transition ${
                k === i ? 'border-ink' : 'border-line hover:border-[#C9CCC7]'
              }`}
            >
              <img src={imgUrl(im.src, 160)} alt="" className="size-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuoteBox({
  item,
  price,
  available,
}: {
  item: { handle: string; name: string; brand: string; image: string };
  price: number;
  available: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useQuote();
  const title = fullName(item.name, item.brand);
  const url = `${site.url}/products/${item.handle}/`;
  const msg = `Hello Al Faiz, I'm interested in ${qty} × ${title}. Please share price and availability.\n${url}`;
  const setSafe = (n: number) => setQty(Math.max(1, Math.min(9999, Math.round(n) || 1)));

  return (
    <div className="card flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <span className="text-[22px] font-bold">{priceLabel(price)}</span>
        <span className="text-sm text-ink-2">
          {price > 0 ? 'Price excludes delivery.' : 'Add to cart and check out — we confirm price and delivery for your order.'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="qty" className="text-sm font-medium">
          Quantity
        </label>
        <div className="inline-flex h-12 items-center overflow-hidden rounded-[10px] border border-line focus-within:border-ink">
          <button type="button" onClick={() => setSafe(qty - 1)} aria-label="Decrease quantity" className="grid h-full w-12 place-items-center hover:bg-paper">
            <Icon name="minus" size={16} strokeWidth={2} />
          </button>
          <input
            id="qty"
            inputMode="numeric"
            value={qty}
            onChange={(e) => setSafe(Number(e.target.value.replace(/\D/g, '')))}
            className="h-full w-14 border-x border-line-soft text-center text-base font-semibold outline-none"
          />
          <button type="button" onClick={() => setSafe(qty + 1)} aria-label="Increase quantity" className="grid h-full w-12 place-items-center hover:bg-paper">
            <Icon name="plus" size={16} strokeWidth={2} />
          </button>
        </div>
        {!available && <span className="rounded-md bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Sold out — ask for lead time</span>}
      </div>

      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => {
            add(item, qty);
            setAdded(true);
          }}
          className={`btn btn-primary justify-between normal-case tracking-normal ${added ? 'anim-pop' : ''}`}
        >
          <span className="flex items-center gap-2.5">
            <Icon name={added ? 'check' : 'cart'} size={18} />
            {added ? `Added ${qty} to cart` : 'Add to cart'}
          </span>
          <span className="btn-chev">
            <Icon name="arrow" size={16} strokeWidth={2.2} />
          </span>
        </button>
        {added && (
          <Link href="/cart/" className="btn btn-dark justify-between normal-case tracking-normal">
            <span className="flex items-center gap-2.5">
              <Icon name="cart" size={18} />
              View cart &amp; checkout
            </span>
            <span className="btn-chev">
              <Icon name="chev" size={16} strokeWidth={2.2} />
            </span>
          </Link>
        )}
        <a href={waLink(msg)} target="_blank" rel="noopener" className="btn btn-light justify-between normal-case tracking-normal">
          <span className="flex items-center gap-2.5">
            <Icon name="chat" size={18} />
            Enquire on WhatsApp
          </span>
          <span className="btn-chev">
            <Icon name="chev" size={16} strokeWidth={2.2} />
          </span>
        </a>
        <span className="text-center text-sm text-ink-2">
          Or call{' '}
          <a href={site.phoneHref} className="font-semibold text-ink underline underline-offset-2">
            {site.phone}
          </a>{' '}
          ·{' '}
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${title}`)}&body=${encodeURIComponent(msg)}`}
            className="font-semibold text-ink underline underline-offset-2"
          >
            email us
          </a>
        </span>
      </div>
    </div>
  );
}
