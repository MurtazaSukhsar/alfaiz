'use client';

import { useState, type ReactNode } from 'react';
import type { Card } from '@/lib/types';
import { ProductCard } from './ProductCard';

export function FeaturedTabs({ tabs, heading }: { tabs: { id: string; label: string; items: Card[] }[]; heading?: ReactNode }) {
  const [current, setCurrent] = useState(tabs[0]?.id);
  const tab = tabs.find((t) => t.id === current) ?? tabs[0];
  if (!tab) return null;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-8">
        {heading}
        <div
          role="tablist"
          aria-label="Featured product groups"
          className="-mx-1 mb-6 flex max-w-[calc(100%+8px)] gap-0.5 overflow-x-auto rounded-full bg-chip p-1 [scrollbar-width:none] sm:mb-10"
        >
          {tabs.map((t) => {
            const on = t.id === tab.id;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls="featured-panel"
                onClick={() => setCurrent(t.id)}
                className={`h-10 shrink-0 rounded-full px-4 text-sm transition ${
                  on ? 'bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(21,23,26,.08),0_0_0_1px_rgba(21,23,26,.04)]' : 'font-medium text-ink-2 hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div id="featured-panel" role="tabpanel" aria-labelledby={`tab-${tab.id}`} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {tab.items.map((p, i) => (
          <div key={tab.id + p.handle} className="anim-fade flex" style={{ animationDelay: `${i * 0.08}s` }}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>
    </>
  );
}
