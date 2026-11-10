'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';

type Box = { x: number; w: number; show: boolean };

/**
 * "Limelight" sliding highlight (inspired by 21st.dev's Limelight Nav, written from scratch).
 * Put `data-lime` on each item and `data-lime="on"` on the active one; the pill slides to the
 * active item, and — with `follow` — to whichever item is hovered.
 */
export function useLimelight<T extends HTMLElement>(activeKey: unknown, follow = false) {
  const ref = useRef<T>(null);
  const [box, setBox] = useState<Box>({ x: 0, w: 0, show: false });
  const [hover, setHover] = useState<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const root = ref.current;
    if (!root) return;
    const el = (follow && hover) || root.querySelector<HTMLElement>('[data-lime="on"]');
    if (!el) return setBox((b) => ({ ...b, show: false }));
    const r = root.getBoundingClientRect();
    const e = el.getBoundingClientRect();
    setBox({ x: e.left - r.left + root.scrollLeft, w: e.width, show: true });
  }, [follow, hover]);

  useLayoutEffect(() => {
    measure();
  }, [measure, activeKey]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(root);
    document.fonts?.ready.then(() => measure());
    // enable the slide transition only after the first placement (no slide-in from 0 on load)
    const t = window.setTimeout(() => setReady(true), 60);
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, [measure]);

  const bind = follow
    ? {
        onPointerOver: (e: RPointerEvent) => {
          const t = (e.target as HTMLElement).closest<HTMLElement>('[data-lime]');
          if (t && ref.current?.contains(t)) setHover(t);
        },
        onPointerLeave: () => setHover(null),
      }
    : {};

  return { ref, box, ready, bind };
}

export function LimelightPill({ box, ready, className = '', beam = false }: { box: Box; ready: boolean; className?: string; beam?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`lime-pill pointer-events-none absolute inset-y-1 left-0 rounded-full ${ready ? 'lime-ready' : ''} ${className}`}
      style={{ transform: `translateX(${box.x}px)`, width: box.w, opacity: box.show ? 1 : 0 }}
    >
      {beam && <span className="lime-beam" />}
    </span>
  );
}
