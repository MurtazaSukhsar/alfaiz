'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import { waLink } from '@/data/site';
import { Icon, type IconName } from './Icons';

export type IndustryCard = {
  title: string;
  text: string;
  icon: IconName;
  cats: { handle: string; title: string; count: number }[];
  picks: { href: string; name: string; image: string }[];
};

const two = (n: number) => String(n).padStart(2, '0');
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

/**
 * Industries as expanding panels: hover (or tap) a trade to open it and see what that trade
 * buys from Al Faiz, with a quote request ready for that industry. Phones get an accordion.
 */
export function IndustryPanels({ industries }: { industries: IndustryCard[] }) {
  const [active, setActive] = useState(0);
  const n = industries.length;

  return (
    <>
      {/* Desktop: expanding columns */}
      <div className="hidden h-[440px] gap-2 lg:flex" role="tablist" aria-label="Industries">
        {industries.map((it, i) => {
          const on = i === active;
          return (
            <div
              key={it.title}
              role="tab"
              tabIndex={0}
              aria-selected={on}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              style={{ flexGrow: on ? 8 : 1 }}
              className={`relative isolate min-w-0 basis-0 cursor-pointer overflow-hidden rounded-[24px] outline-none transition-[flex-grow,background-color,box-shadow] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] focus-visible:ring-2 focus-visible:ring-accent ${
                on ? 'footer-gradient text-white shadow-[0_30px_60px_-30px_rgba(74,6,16,.7)]' : 'bg-white text-ink ring-1 ring-line-soft hover:ring-accent/40'
              }`}
            >
              {on ? (
                <IndustryOpen it={it} i={i} n={n} />
              ) : (
                <span className="flex h-full flex-col items-center justify-between py-5">
                  <span className="grid size-10 place-items-center rounded-full bg-[#F3F3F0] text-accent">
                    <Icon name={it.icon} size={18} />
                  </span>
                  <span className="rotate-180 whitespace-nowrap text-[15px] font-semibold tracking-[-0.01em] text-ink-2 [writing-mode:vertical-rl]">{it.title}</span>
                  <span className="text-[12px] font-semibold tabular-nums text-muted">{two(i + 1)}</span>
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Phones and tablets: accordion */}
      <ul className="flex flex-col gap-2 lg:hidden">
        {industries.map((it, i) => {
          const on = i === active;
          return (
            <li key={it.title} className={`overflow-hidden rounded-[20px] transition-colors duration-300 ${on ? 'footer-gradient text-white' : 'bg-white ring-1 ring-line-soft'}`}>
              <button type="button" aria-expanded={on} onClick={() => setActive(on ? -1 : i)} className="flex w-full items-center gap-3 p-3 pr-4 text-left">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${on ? 'bg-white text-accent' : 'bg-[#F3F3F0] text-accent'}`}>
                  <Icon name={it.icon} size={18} />
                </span>
                <span className="flex-1 text-[16px] font-semibold">{it.title}</span>
                <span className={`text-[12px] font-semibold tabular-nums ${on ? 'text-white/60' : 'text-muted'}`}>{two(i + 1)}</span>
                <span className={`grid size-7 place-items-center rounded-full transition duration-300 ${on ? 'rotate-45 bg-white/15' : 'bg-[#F3F3F0]'}`}>
                  <Icon name="plus" size={14} strokeWidth={2.2} />
                </span>
              </button>
              {on && (
                <div className="anim-msg flex flex-col gap-4 px-4 pb-5 pt-1">
                  <IndustryBody it={it} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function IndustryOpen({ it, i, n }: { it: IndustryCard; i: number; n: number }) {
  return (
    <div key={it.title} className="flex h-full w-[600px] flex-col justify-between gap-6 p-8">
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-6 -z-10 text-[220px] font-extrabold leading-none tracking-[-0.06em] text-white/[0.05]">
        {two(i + 1)}
      </span>
      <div className="be-in flex items-center justify-between" style={d(0.12)}>
        <span className="grid size-12 place-items-center rounded-full bg-white text-accent">
          <Icon name={it.icon} size={22} />
        </span>
        <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55">
          Industry {two(i + 1)} / {two(n)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="be-in text-[40px] font-bold leading-[1] tracking-[-0.04em]" style={d(0.16)}>
          {it.title}
        </h3>
        <p className="be-in max-w-[460px] text-[16px] leading-relaxed text-white/70" style={d(0.2)}>
          {it.text}
        </p>
      </div>
      <IndustryBody it={it} wide />
    </div>
  );
}

function IndustryBody({ it, wide = false }: { it: IndustryCard; wide?: boolean }) {
  return (
    <>
      {!wide && <p className="text-[14.5px] leading-relaxed text-white/70">{it.text}</p>}
      <div className="be-in flex flex-col gap-2.5" style={d(0.24)}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">What they buy from us</span>
        <div className="flex flex-wrap gap-1.5">
          {it.cats.map((c) => (
            <Link
              key={c.handle}
              href={`/collections/${c.handle}/`}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[13px] font-medium ring-1 ring-white/15 transition hover:bg-white hover:text-ink"
            >
              {c.title}
              <span className="text-[11.5px] opacity-60">{c.count}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="be-in flex flex-wrap items-center justify-between gap-4" style={d(0.3)}>
        <span className="flex gap-2">
          {it.picks.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              title={p.name}
              className="grid size-[60px] place-items-center rounded-2xl bg-white p-1.5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_22px_-10px_rgba(0,0,0,.6)] sm:size-[68px]"
            >
              <img src={p.image} alt={p.name} loading="lazy" className="max-h-full max-w-full object-contain" />
            </Link>
          ))}
        </span>
        <a
          href={waLink(`Hello Al Faiz, I work in ${it.title.toLowerCase()} and would like a quote for:`)}
          target="_blank"
          rel="noopener"
          className="pill pill-white fx"
        >
          Get a quote
          <span className="pill-dot">
            <Icon name="arrow" size={14} strokeWidth={2.4} />
          </span>
        </a>
      </div>
    </>
  );
}
