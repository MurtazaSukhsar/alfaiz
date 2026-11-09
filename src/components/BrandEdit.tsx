'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Icon } from './Icons';

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

const ROTATE_MS = 8000;
const d = (s: number) => ({ '--d': `${s}s` }) as CSSProperties;

/**
 * "The Brand Edit": a compact two-page magazine spread per brand.
 * Left page introduces the brand, right page indexes its three key tools. Pages turn every 8s while
 * the section is on screen (paused on hover/focus); tabs switch brands directly.
 */
export function BrandEdit({ issues }: { issues: EditIssue[] }) {
  const [index, setIndex] = useState(0);
  const [hold, setHold] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const n = issues.length;
  const issue = issues[index];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (hold || !onScreen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % n), ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [index, hold, onScreen, n]);

  return (
    <section ref={ref} aria-labelledby="edit-title" className="py-12 sm:py-16">
      <div className="wrap">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-8">
          <div className="flex flex-col gap-2">
            <span className="eyebrow text-accent">The Brand Edit</span>
            <h2 id="edit-title" className="text-[clamp(26px,3vw,38px)] font-semibold leading-[1.08] tracking-[-0.025em]">
              Key tools from each brand
            </h2>
          </div>
          <div role="tablist" aria-label="Choose a brand" className="-mx-1 flex max-w-[calc(100%+8px)] gap-0.5 overflow-x-auto rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(21,23,26,.05)] ring-1 ring-line-soft [scrollbar-width:none]">
            {issues.map((it, i) => (
              <button
                key={it.brand}
                type="button"
                role="tab"
                aria-selected={i === index}
                onClick={() => setIndex(i)}
                className={`h-9 shrink-0 rounded-full px-4 text-sm transition ${
                  i === index ? 'bg-ink font-semibold text-white' : 'font-medium text-ink-2 hover:text-ink'
                }`}
              >
                {it.name}
              </button>
            ))}
          </div>
        </div>

        <div
          key={issue.brand}
          className="be-spread relative grid overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(21,23,26,.05),0_24px_48px_-32px_rgba(21,23,26,.35)] ring-1 ring-line-soft lg:grid-cols-[0.82fr_1fr]"
          style={{ '--accent': issue.accent, '--on-accent': issue.onAccent } as CSSProperties}
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocusCapture={() => setHold(true)}
          onBlurCapture={() => setHold(false)}
        >
          {/* spine shadow between the two pages */}
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-[45%] z-10 hidden w-10 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgba(21,23,26,.06)_50%,transparent)] lg:block" />

          {/* Left page: the brand */}
          <div className="footer-gradient-light relative flex min-h-[360px] flex-col justify-between gap-8 overflow-hidden p-6 sm:p-10">
            <span aria-hidden="true" className="be-mark pointer-events-none absolute -bottom-[0.2em] -right-[0.05em] whitespace-nowrap text-[clamp(120px,14vw,200px)] font-extrabold leading-none tracking-[-0.06em] text-accent">
              {issue.name}
            </span>
            <span className="be-in relative flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-2" style={d(0.05)}>
              <span>No. {String(index + 1).padStart(2, '0')} · The Brand Edit</span>
              <span>{issue.count} products</span>
            </span>
            <span className="relative flex flex-col items-start gap-5">
              <Link
                href={`/collections/${issue.brand}/`}
                aria-label={`Shop ${issue.name}`}
                className="be-in flex h-20 items-center rounded-2xl bg-white px-6 shadow-[0_1px_2px_rgba(21,23,26,.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_26px_-14px_rgba(21,23,26,.35)] sm:h-24 sm:px-7"
                style={d(0.1)}
              >
                <img src={`/brands/${issue.brand}.png`} alt={`${issue.name} logo`} className="h-12 w-auto max-w-[220px] object-contain sm:h-14" />
              </Link>
              <span className="be-in text-[clamp(44px,5vw,68px)] font-bold leading-[0.95] tracking-[-0.045em] text-ink" style={d(0.18)}>
                {issue.name}
              </span>
              <span className="be-in max-w-[380px] text-[16px] leading-relaxed text-ink-2" style={d(0.24)}>
                {issue.note}
              </span>
            </span>
            <span className="be-in relative" style={d(0.3)}>
              <Link href={`/collections/${issue.brand}/`} className="pill pill-lg fx bg-[var(--accent)] text-[var(--on-accent)]">
                Shop all {issue.name}
                <span className="pill-dot bg-[var(--on-accent)] text-[var(--accent)]">
                  <Icon name="arrow" size={15} strokeWidth={2.4} />
                </span>
              </Link>
            </span>
          </div>

          {/* Right page: three key tools */}
          <div className="be-turn flex flex-col">
            <div className="flex items-center justify-between border-b border-line-soft px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted sm:px-8">
              <span>Key tools · {issue.name}</span>
              <span>
                {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
              </span>
            </div>
            <ul className="flex flex-1 flex-col">
              {issue.items.map((it, k) => (
                <li key={it.href} className={`be-in flex-1 ${k ? 'border-t border-line-soft' : ''}`} style={d(0.16 + k * 0.1)}>
                  <Link href={it.href} className="group flex h-full items-center gap-3 px-4 py-4 sm:gap-6 sm:px-8 sm:py-5">
                    <span className="hidden w-12 shrink-0 text-[38px] font-light leading-none tracking-[-0.04em] text-ink/25 sm:block">
                      {String(k + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-[112px] w-[128px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F4F4F1] p-2.5 sm:h-[140px] sm:w-[190px] sm:p-3">
                      <img src={it.image} alt={it.name} loading="lazy" className="max-h-full max-w-full scale-[1.12] object-contain mix-blend-multiply transition duration-500 group-hover:scale-[1.22]" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[16px] font-semibold leading-tight text-ink sm:text-lg">{it.label}</span>
                      <span className="text-[13px] text-muted sm:text-sm">{it.spec}</span>
                    </span>
                    <span className="hidden size-10 shrink-0 place-items-center rounded-full border border-line text-ink transition duration-300 group-hover:-rotate-45 group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--on-accent)] sm:grid">
                      <Icon name="arrow" size={15} strokeWidth={2.2} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* page-turn timer */}
          {!hold && onScreen && (
            <span aria-hidden="true" key={`t-${index}`} className="be-timer absolute inset-x-0 bottom-0 z-20 h-[3px] origin-left bg-[var(--accent)]" style={{ animationDuration: `${ROTATE_MS}ms` }} />
          )}
        </div>
      </div>
    </section>
  );
}
