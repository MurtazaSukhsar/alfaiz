'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';
import { SectionHead } from './home/SectionHead';

export type EditItem = { href: string; label: string; spec: string; image: string; name: string };
export type EditIssue = {
  brand: string;
  name: string;
  note: string;
  count: number;
  bg: string;
  accent: string;
  onAccent: string;
  items: EditItem[];
};

const ROTATE_MS = 6000;
const two = (n: number) => String(n).padStart(2, '0');

/**
 * "The Brand Edit": one magazine spread per brand in a swipeable strip.
 * Swipe on touch screens, scroll sideways on a trackpad or drag with the mouse.
 * Moves to the next brand every 6s on its own; pauses only while someone is touching or dragging it.
 */
export function BrandEdit({ issues }: { issues: EditIssue[] }) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const n = issues.length;

  const slideAt = (i: number) => track.current?.children[i] as HTMLElement | undefined;
  const go = useCallback((i: number) => {
    const el = track.current;
    const slide = el?.children[i] as HTMLElement | undefined;
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - (el.clientWidth - slide.offsetWidth) / 2, behavior: 'smooth' });
  }, []);

  // which slide is in the middle
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let dist = Infinity;
    for (let i = 0; i < n; i++) {
      const s = slideAt(i);
      if (!s) continue;
      const d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
      if (d < dist) {
        dist = d;
        best = i;
      }
    }
    setIndex(best);
  };

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // auto turn
  useEffect(() => {
    if (hold || !onScreen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => go((index + 1) % n), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [index, hold, onScreen, n, go]);

  // mouse drag (touch and trackpads scroll natively)
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !track.current) return;
    setHold(true);
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = track.current;
    const d = drag.current;
    if (!el || !d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      el.style.scrollSnapType = 'none';
      el.style.scrollBehavior = 'auto';
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = d.left - dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const el = track.current;
    const d = drag.current;
    drag.current = null;
    setHold(false);
    if (!el || !d?.moved) return;
    el.releasePointerCapture(e.pointerId);
    const dx = e.clientX - d.x;
    const next = Math.abs(dx) > 60 ? Math.min(n - 1, Math.max(0, index + (dx < 0 ? 1 : -1))) : index;
    el.style.scrollBehavior = '';
    go(next);
    window.setTimeout(() => el && (el.style.scrollSnapType = ''), 450);
    // swallow the click that ends a drag so links don't open
    const stop = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
    };
    el.addEventListener('click', stop, { capture: true, once: true });
    window.setTimeout(() => el.removeEventListener('click', stop, { capture: true }), 50);
  };

  return (
    <section ref={section} aria-labelledby="edit-title" aria-roledescription="carousel" className="band-tint py-14 sm:py-20">
      <div className="wrap">
        <SectionHead
          num="03"
          label="The Brand Edit"
          id="edit-title"
          title="Key tools from each brand"
          aside={
            <span className="flex items-center gap-2 text-sm font-medium text-muted">
              <Icon name="arrow" size={15} strokeWidth={2.2} className="rotate-180" />
              Swipe to see more brands
              <Icon name="arrow" size={15} strokeWidth={2.2} />
            </span>
          }
        />
      </div>

      <div
        ref={track}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onTouchStart={() => setHold(true)}
        onTouchEnd={() => setHold(false)}
        onFocusCapture={(e) => (e.target as HTMLElement).matches(':focus-visible') && setHold(true)}
        onBlurCapture={() => setHold(false)}
        className="be-track relative flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 pt-1 [scrollbar-width:none] active:cursor-grabbing sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {issues.map((issue, i) => (
          <Spread key={issue.brand} issue={issue} i={i} n={n} active={i === index} />
        ))}
      </div>

      {/* position */}
      <div className="wrap mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
        {issues.map((it, i) => (
          <span key={it.brand} className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-accent/20' : 'w-1.5 bg-ink/20'}`}>
            {i === index && !hold && onScreen && (
              <span key={`t-${index}`} className="be-timer absolute inset-0 origin-left rounded-full bg-accent" style={{ animationDuration: `${ROTATE_MS}ms` }} />
            )}
            {i === index && (hold || !onScreen) && <span className="absolute inset-0 rounded-full bg-accent" />}
          </span>
        ))}
      </div>
    </section>
  );
}

function Spread({ issue, i, n, active }: { issue: EditIssue; i: number; n: number; active: boolean }) {
  return (
    <article
      aria-roledescription="slide"
      aria-label={`${i + 1} of ${n}: ${issue.name}`}
      className={`be-slide relative grid shrink-0 snap-center overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(21,23,26,.05),0_24px_48px_-32px_rgba(21,23,26,.35)] ring-1 ring-line-soft transition duration-500 lg:grid-cols-[0.82fr_1fr] ${
        active ? 'opacity-100' : 'opacity-50 lg:scale-[0.97]'
      }`}
    >
      {/* spine shadow between the two pages */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[45%] z-10 hidden w-10 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(21,23,26,.06)_50%,transparent)] lg:block" />

      {/* Left page: the brand */}
      <div className="footer-gradient-light relative flex min-h-[340px] flex-col justify-between gap-8 overflow-hidden p-6 sm:p-10">
        <span aria-hidden="true" className="pointer-events-none absolute -bottom-[0.2em] -right-[0.05em] select-none whitespace-nowrap text-[clamp(110px,13vw,190px)] font-extrabold leading-none tracking-[-0.06em] text-accent/[0.12]">
          {issue.name}
        </span>
        <span className="relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2">
          <span>No. {two(i + 1)} · The Brand Edit</span>
          <span>{issue.count} products</span>
        </span>
        <span className="relative flex flex-col items-start gap-5">
          <Link
            href={`/collections/${issue.brand}/`}
            aria-label={`Shop ${issue.name}`}
            draggable={false}
            className="flex h-20 items-center rounded-2xl bg-white px-6 shadow-[0_1px_2px_rgba(21,23,26,.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-14px_rgba(21,23,26,.35)] sm:h-24 sm:px-7"
          >
            <img src={`/brands/${issue.brand}.png`} alt={`${issue.name} logo`} draggable={false} className="h-12 w-auto max-w-[220px] object-contain sm:h-14" />
          </Link>
          <span className="text-[clamp(40px,5vw,64px)] font-bold leading-[0.95] tracking-[-0.045em] text-ink">{issue.name}</span>
          <span className="max-w-[380px] text-[16px] leading-relaxed text-ink-2">{issue.note}</span>
        </span>
        <span className="relative">
          <Link href={`/collections/${issue.brand}/`} draggable={false} className="pill pill-lg fx footer-gradient text-white">
            Shop all {issue.name}
            <span className="pill-dot bg-white text-accent">
              <Icon name="arrow" size={15} strokeWidth={2.4} />
            </span>
          </Link>
        </span>
      </div>

      {/* Right page: three key tools */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-line-soft px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:px-8">
          <span>Key tools · {issue.name}</span>
          <span>
            {two(i + 1)} / {two(n)}
          </span>
        </div>
        <ul className="flex flex-1 flex-col">
          {issue.items.map((it, k) => (
            <li key={it.href} className={`flex-1 ${k ? 'border-t border-line-soft' : ''}`}>
              <Link href={it.href} draggable={false} className="spot group flex h-full items-center gap-3 px-4 py-4 sm:gap-6 sm:px-8 sm:py-5">
                <span className="hidden w-12 shrink-0 text-[38px] font-light leading-none tracking-[-0.04em] text-ink/25 sm:block">{two(k + 1)}</span>
                <span className="flex h-[104px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F4F4F1] p-2.5 sm:h-[132px] sm:w-[180px] sm:p-3">
                  <img src={it.image} alt={it.name} loading="lazy" draggable={false} className="max-h-full max-w-full scale-[1.12] object-contain mix-blend-multiply transition duration-500 group-hover:scale-[1.22]" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[16px] font-semibold leading-tight text-ink sm:text-lg">{it.label}</span>
                  <span className="text-[13px] text-muted sm:text-sm">{it.spec}</span>
                </span>
                <span className="hidden size-10 shrink-0 place-items-center rounded-full border border-line text-ink transition duration-300 group-hover:-rotate-45 group-hover:border-transparent group-hover:bg-accent group-hover:text-white sm:grid">
                  <Icon name="arrow" size={15} strokeWidth={2.2} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
