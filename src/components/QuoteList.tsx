'use client';

import Link from 'next/link';
import { useState } from 'react';
import { site, waLink } from '@/data/site';
import { fullName, imgUrl, quoteMessage } from '@/lib/format';
import { Icon } from './Icons';
import { useQuote } from './QuoteProvider';

export function QuoteList() {
  const { items, ready, setQty, remove, clear } = useQuote();
  const [notes, setNotes] = useState('');

  if (!ready) return <div className="py-24 text-center text-muted">Loading your cart…</div>;

  if (!items.length) {
    return (
      <div className="card mx-auto flex max-w-[640px] flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Icon name="cart" size={26} />
        </span>
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="max-w-md text-[15px] leading-relaxed text-muted">
          Add products to your cart, then check out on WhatsApp or email — or send us your BOQ directly.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/collections/all/" className="btn btn-sm btn-primary">
            Browse products
            <span className="btn-chev">
              <Icon name="chev" size={14} strokeWidth={2.2} />
            </span>
          </Link>
          <a href={waLink('Hello Al Faiz, I would like to order:')} target="_blank" rel="noopener" className="btn btn-sm btn-light">
            Send a list on WhatsApp
            <span className="btn-chev">
              <Icon name="chev" size={14} strokeWidth={2.2} />
            </span>
          </a>
        </div>
      </div>
    );
  }

  const message = quoteMessage(items, notes, site.url);
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="card overflow-hidden">
        <ul className="divide-y divide-line-soft">
          {items.map((it) => (
            <li key={it.handle} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap sm:p-5">
              <Link href={`/products/${it.handle}/`} className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line-soft bg-white p-1.5">
                {it.image ? <img src={imgUrl(it.image, 200)} alt="" className="size-full object-contain" /> : <Icon name="box" className="text-muted" />}
              </Link>
              <div className="min-w-0 flex-1 basis-[180px]">
                {it.brand && <span className="eyebrow text-muted">{it.brand}</span>}
                <Link href={`/products/${it.handle}/`} className="line-clamp-2 font-semibold leading-snug hover:text-accent">
                  {it.name}
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex h-11 items-center overflow-hidden rounded-[10px] border border-line">
                  <button type="button" onClick={() => setQty(it.handle, it.qty - 1)} aria-label={`Decrease quantity of ${it.name}`} className="grid h-full w-10 place-items-center hover:bg-paper">
                    <Icon name="minus" size={15} strokeWidth={2} />
                  </button>
                  <label htmlFor={`q-${it.handle}`} className="sr-only">
                    Quantity of {it.name}
                  </label>
                  <input
                    id={`q-${it.handle}`}
                    inputMode="numeric"
                    value={it.qty}
                    onChange={(e) => setQty(it.handle, Number(e.target.value.replace(/\D/g, '')))}
                    className="h-full w-12 border-x border-line-soft text-center font-semibold outline-none"
                  />
                  <button type="button" onClick={() => setQty(it.handle, it.qty + 1)} aria-label={`Increase quantity of ${it.name}`} className="grid h-full w-10 place-items-center hover:bg-paper">
                    <Icon name="plus" size={15} strokeWidth={2} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(it.handle)}
                  aria-label={`Remove ${fullName(it.name, it.brand)} from cart`}
                  className="grid size-11 place-items-center rounded-[10px] text-muted hover:bg-paper hover:text-accent"
                >
                  <Icon name="trash" size={17} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-[#F8F8F6] px-5 py-3 text-sm">
          <span className="text-muted">
            {items.length} product{items.length === 1 ? '' : 's'} · {totalQty} item{totalQty === 1 ? '' : 's'} in total
          </span>
          <button type="button" onClick={clear} className="min-h-11 font-semibold text-ink-2 hover:text-accent">
            Clear cart
          </button>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-6 lg:sticky lg:top-[140px]">
        <h2 className="text-lg font-bold">Checkout</h2>
        <p className="-mt-2 text-[14px] leading-relaxed text-muted">Send your cart to our sales team. We confirm prices, availability and delivery, then you pay by cash, card, transfer or cheque.</p>
        <label htmlFor="notes" className="text-sm font-medium">
          Notes <span className="font-normal text-muted">(delivery location, deadline, company name)</span>
        </label>
        <textarea
          id="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Deliver to Jebel Ali by Thursday"
          className="rounded-[10px] border border-line bg-white p-3 text-[15px] outline-none placeholder:text-[#6b717c] focus:border-ink"
        />
        <a href={waLink(message)} target="_blank" rel="noopener" className="btn btn-primary justify-between normal-case tracking-normal">
          <span className="flex items-center gap-2.5">
            <Icon name="chat" size={18} />
            Checkout on WhatsApp
          </span>
          <span className="btn-chev">
            <Icon name="chev" size={16} strokeWidth={2.2} />
          </span>
        </a>
        <a
          href={`mailto:${site.email}?subject=${encodeURIComponent('Order enquiry — website cart')}&body=${encodeURIComponent(message)}`}
          className="btn btn-light justify-between normal-case tracking-normal"
        >
          <span className="flex items-center gap-2.5">
            <Icon name="mail" size={18} />
            Checkout by email
          </span>
          <span className="btn-chev">
            <Icon name="chev" size={16} strokeWidth={2.2} />
          </span>
        </a>
        <p className="text-[13px] leading-relaxed text-muted">Your cart is saved on this device until you clear it.</p>
      </div>
    </div>
  );
}
