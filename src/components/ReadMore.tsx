'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icons';

/**
 * Long product descriptions start collapsed with a fade and a "Read more" button.
 * The full text is always in the page (good for search engines); short ones show in full.
 */
export function ReadMore({ html, collapsed = 300, className = '' }: { html: string; collapsed?: number; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [long, setLong] = useState(true);
  const [full, setFull] = useState<number | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      setFull(el.scrollHeight);
      setLong(el.scrollHeight > collapsed + 90);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.firstElementChild ?? el);
    return () => ro.disconnect();
  }, [collapsed]);

  const toggle = () => {
    if (open) {
      const top = box.current?.getBoundingClientRect().top ?? 0;
      if (top < 0) box.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setOpen((o) => !o);
  };

  const height = !long ? undefined : open ? (full ?? undefined) : collapsed;

  return (
    <div className={className}>
      <div className="relative">
        <div
          ref={box}
          id="product-description"
          className="overflow-hidden scroll-mt-32 transition-[max-height] duration-500 ease-[cubic-bezier(.2,.7,.2,1)]"
          style={{ maxHeight: height }}
        >
          <div className="prose-af" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        {long && !open && <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-white/0 to-white" />}
      </div>
      {long && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="product-description"
          className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition hover:bg-accent"
        >
          {open ? 'Show less' : 'Read more'}
          <Icon name="chev-down" size={15} strokeWidth={2.2} className={`transition duration-300 ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    </div>
  );
}
