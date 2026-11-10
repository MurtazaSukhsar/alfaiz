'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { site, waLink } from '@/data/site';
import { Icon } from './Icons';
import { LogoMark } from './Logo';

export type QuoteCategory = { handle: string; title: string; image: string; count: number };

const EXAMPLES = ['10 × DeWALT DCD996 hammer drill', '5 boxes 9" cutting discs', '1 × ABAC 500 L air compressor', '50 pairs safety gloves'];
const STEPS = [
  ['Tick what you need', 'Pick one or more categories.'],
  ['Write your list', 'Items, models and quantities.'],
  ['Get your quote', 'Price, stock and delivery from our sales team.'],
];

/**
 * Quote-first hero: a request pad instead of a shop banner. Visitors tick categories, write
 * their list and send it straight to the sales team on WhatsApp or email.
 */
export function QuoteHero({ categories, total }: { categories: QuoteCategory[]; total: number }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [items, setItems] = useState('');
  const [place, setPlace] = useState('');
  const [hint, setHint] = useState(0);

  useEffect(() => {
    if (items || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setHint((h) => (h + 1) % EXAMPLES.length), 2600);
    return () => window.clearInterval(t);
  }, [items]);

  const toggle = (h: string) => setPicked((p) => (p.includes(h) ? p.filter((x) => x !== h) : [...p, h]));
  const names = categories.filter((c) => picked.includes(c.handle)).map((c) => c.title);
  const lines = ['Hello Al Faiz, I would like a quote.', names.length ? `Categories: ${names.join(', ')}` : '', items.trim() ? `Items:\n${items.trim()}` : '', place.trim() ? `Deliver to: ${place.trim()}` : ''].filter(Boolean);
  const message = lines.join('\n');
  const filled = picked.length + (items.trim() ? 1 : 0) + (place.trim() ? 1 : 0);

  return (
    <section aria-labelledby="hero-title" className="pt-4 sm:pt-6">
      <div className="wrap">
        <div className="footer-gradient relative isolate grid gap-8 overflow-hidden rounded-[28px] p-5 text-white sm:p-9 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:items-center lg:gap-10 lg:p-12 xl:gap-16">
          <span aria-hidden="true" className="qh-mark pointer-events-none absolute -bottom-[0.24em] -left-[0.04em] -z-10 select-none whitespace-nowrap text-[clamp(120px,19vw,280px)] font-extrabold leading-none tracking-[-0.06em] text-white/[0.035]">
            QUOTE
          </span>

          {/* The pitch */}
          <div className="flex flex-col items-start gap-6">
            <span className="be-in inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold ring-1 ring-white/15">
              <span className="relative grid size-2 place-items-center">
                <span className="absolute size-2 animate-ping rounded-full bg-accent-bright opacity-70" />
                <span className="size-2 rounded-full bg-accent-bright" />
              </span>
              Quotation desk · Sharjah, UAE
            </span>

            <h2 id="hero-title" className="text-[clamp(40px,5vw,68px)] font-bold leading-[0.96] tracking-[-0.045em]">
              <span className="be-in block" style={{ ['--d' as string]: '.06s' }}>
                Send your list.
              </span>
              <span className="be-in block" style={{ ['--d' as string]: '.14s' }}>
                Get your <span className="qh-underline text-white">quote.</span>
              </span>
            </h2>

            <p className="be-in max-w-[440px] text-[16px] leading-relaxed text-white/70 sm:text-[17.5px]" style={{ ['--d' as string]: '.22s' }}>
              Tools, machinery and site supplies for contractors, workshops and factories. Tell us what you need and our sales team replies with your price.
            </p>

            <ol className="be-in hidden w-full max-w-[520px] gap-2 sm:grid sm:grid-cols-3" style={{ ['--d' as string]: '.3s' }}>
              {STEPS.map(([t, d], i) => (
                <li key={t} className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10 sm:flex-col sm:gap-2 sm:p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-[12px] font-bold text-accent">{i + 1}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14.5px] font-semibold leading-tight">{t}</span>
                    <span className="text-[12.5px] leading-snug text-white/55">{d}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="be-in flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-white/70" style={{ ['--d' as string]: '.38s' }}>
              <a href={site.phoneHref} className="inline-flex items-center gap-2 font-semibold text-white hover:underline">
                <Icon name="phone" size={15} />
                {site.phone}
              </a>
              <Link href="/collections/all/" className="nudge-host inline-flex items-center gap-1.5 hover:text-white">
                or browse all {total} products
                <Icon name="arrow" size={14} strokeWidth={2.2} className="nudge" />
              </Link>
            </div>
          </div>

          {/* The request pad */}
          <div className="qh-pad relative">
            <span aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 rotate-[2.2deg] rounded-[22px] bg-white/25" />
            <span aria-hidden="true" className="absolute inset-0 translate-x-1 translate-y-1 rotate-[1.1deg] rounded-[22px] bg-white/55" />
            <form
              onSubmit={(e) => e.preventDefault()}
              aria-label="Quote request"
              className="relative flex flex-col rounded-[22px] bg-white text-ink shadow-[0_40px_70px_-30px_rgba(0,0,0,.7)]"
            >
              {/* binding holes */}
              <span aria-hidden="true" className="flex justify-between px-9 pt-3">
                {Array.from({ length: 9 }, (_, i) => (
                  <span key={i} className="size-2.5 rounded-full bg-[#1b1114]/85 shadow-[inset_0_1px_2px_rgba(0,0,0,.6)]" />
                ))}
              </span>

              <div className="flex items-center justify-between gap-3 border-b-2 border-dashed border-line px-5 pb-4 pt-3 sm:px-7">
                <span className="flex items-center gap-3">
                  <LogoMark className="h-10 w-[25px] shrink-0" />
                  <span className="flex flex-col">
                    <span className="text-[19px] font-bold leading-none tracking-[-0.02em]">Quote request</span>
                    <span className="mt-1 text-[12px] text-muted">{site.name}</span>
                  </span>
                </span>
                <span className="qh-stamp grid size-[62px] shrink-0 place-items-center rounded-full border-2 border-accent text-center text-[9.5px] font-extrabold uppercase leading-[1.15] tracking-[0.08em] text-accent">
                  Free
                  <br />
                  quote
                </span>
              </div>

              <div className="flex flex-col gap-5 px-5 py-5 sm:px-7">
                <fieldset className="flex flex-col gap-2.5">
                  <legend className="mb-2.5 flex w-full items-center justify-between text-[11.5px] font-bold uppercase tracking-[0.14em] text-muted">
                    <span>1 · I need</span>
                    {picked.length > 0 && <span className="normal-case tracking-normal text-accent">{picked.length} selected</span>}
                  </legend>
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((c) => {
                      const on = picked.includes(c.handle);
                      return (
                        <button
                          key={c.handle}
                          type="button"
                          aria-pressed={on}
                          onClick={() => toggle(c.handle)}
                          className={`inline-flex h-9 items-center gap-1.5 rounded-full pl-1 pr-3 text-[13px] font-medium ring-1 transition duration-200 active:scale-95 ${
                            on ? 'bg-ink text-white ring-ink' : 'bg-white text-ink-2 ring-line hover:text-ink hover:ring-ink/40'
                          }`}
                        >
                          <span className={`grid size-7 place-items-center overflow-hidden rounded-full ${on ? 'bg-accent text-white' : 'bg-[#F4F4F1]'}`}>
                            {on ? <Icon name="check" size={14} strokeWidth={2.6} /> : <img src={c.image} alt="" className="size-6 object-contain mix-blend-multiply" />}
                          </span>
                          {c.title}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <label className="flex flex-col gap-2">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-muted">2 · Items &amp; quantities</span>
                  <textarea
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                    rows={3}
                    placeholder={`e.g. ${EXAMPLES[hint]}`}
                    className="qh-lines w-full resize-none bg-transparent px-1 text-[15px] leading-[32px] text-ink outline-none placeholder:text-[#8a8f97]"
                  />
                </label>

                <label className="flex items-center gap-3 border-b border-line pb-2 focus-within:border-ink">
                  <span className="shrink-0 text-[11.5px] font-bold uppercase tracking-[0.14em] text-muted">3 · Deliver to</span>
                  <input
                    value={place}
                    onChange={(e) => setPlace(e.target.value)}
                    placeholder="City or site (optional)"
                    className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#8a8f97]"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-3 rounded-b-[22px] border-t border-line-soft bg-[#FAFAF8] px-5 py-4 sm:px-7">
                <div className="flex flex-wrap gap-2">
                  <a href={waLink(message)} target="_blank" rel="noopener" className="pill pill-lg fx flex-1 justify-center whitespace-nowrap bg-accent text-white">
                    <img src="/icons/whatsapp.svg" alt="" className="size-5 brightness-0 invert" />
                    Send for quote
                    <span className="pill-dot bg-white text-accent">
                      <Icon name="arrow" size={15} strokeWidth={2.4} />
                    </span>
                  </a>
                  <a
                    href={`mailto:${site.email}?subject=${encodeURIComponent('Quote request')}&body=${encodeURIComponent(message)}`}
                    className="pill pill-lg pill-outline bg-white"
                  >
                    <Icon name="mail" size={16} />
                    Email
                  </a>
                </div>
                <p className="text-[12.5px] leading-snug text-muted">
                  {filled ? 'Opens WhatsApp with your list ready to send.' : 'Nothing to fill in? Just tap send and tell us on WhatsApp.'} Prices are confirmed by our sales team.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
