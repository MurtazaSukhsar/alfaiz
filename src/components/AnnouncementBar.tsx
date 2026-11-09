'use client';

import { useEffect, useState } from 'react';
import { site, waLink } from '@/data/site';
import { Icon } from './Icons';

/** Slim top bar from the live store: rotating message + WhatsApp and email. */
export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const msgs = site.announcements;

  useEffect(() => {
    if (msgs.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % msgs.length), 4500);
    return () => window.clearInterval(t);
  }, [msgs.length]);

  return (
    <div className="footer-gradient text-white">
      <div className="wrap flex h-9 items-center justify-center gap-6 text-[12.5px] sm:justify-between">
        <p key={i} className="anim-msg truncate font-medium text-white/90" aria-live="polite">
          {msgs[i]}
        </p>
        <span className="hidden shrink-0 items-center gap-5 sm:flex">
          <a href={waLink()} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-white/80 transition hover:text-white">
            <Icon name="chat" size={13} strokeWidth={2} />
            WhatsApp {site.phone}
          </a>
          <a href={`mailto:${site.email}`} className="hidden items-center gap-1.5 text-white/80 transition hover:text-white md:inline-flex">
            <Icon name="mail" size={13} strokeWidth={2} />
            {site.email}
          </a>
        </span>
      </div>
    </div>
  );
}
