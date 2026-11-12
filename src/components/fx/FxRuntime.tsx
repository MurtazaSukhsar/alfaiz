'use client';

import { useEffect } from 'react';

/**
 * One small runtime for the page effects:
 *  - Spotlight cards: a soft glow follows the cursor on any `.spot` element (sets --mx / --my).
 *  - Blur reveal: adds `is-in` to `[data-reveal-text]` headings when they scroll into view.
 */
export function FxRuntime() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const el = (e.target as HTMLElement | null)?.closest?.<HTMLElement>('.spot');
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.4 },
    );
    const watch = () => document.querySelectorAll('[data-reveal-text]:not(.is-in)').forEach((el) => (reduce ? el.classList.add('is-in') : io.observe(el)));
    watch();
    // pick up headings on pages opened later (client navigation) — at most once per frame,
    // not on every single DOM change (the hero slider and tickers change the DOM a lot)
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (!queued) queued = requestAnimationFrame(() => ((queued = 0), watch()));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(queued);
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
