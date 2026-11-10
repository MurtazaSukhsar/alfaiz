'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { site, waLink, type FaqGroup, type FaqItem } from '@/data/site';
import { Icon } from './Icons';
import { LimelightPill, useLimelight } from './fx/Limelight';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

type Row = FaqItem & { id: string; topic: string };

/**
 * Compact help desk: topic tabs → question list → answer panel.
 * Desktop shows the answer beside the list; phones open it in place.
 */
export function FaqBrowser({ groups }: { groups: FaqGroup[] }) {
  const [topic, setTopic] = useState(groups[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [current, setCurrent] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const lime = useLimelight<HTMLDivElement>(`${topic}-${!!q}`);

  const all: Row[] = useMemo(() => groups.flatMap((g) => g.items.map((it) => ({ ...it, id: slug(it.q), topic: g.title }))), [groups]);
  const rows: Row[] = useMemo(() => {
    if (q) {
      const words = q.split(/\s+/);
      return all.filter((r) => words.every((w) => `${r.q} ${r.a}`.toLowerCase().includes(w)));
    }
    return all.filter((r) => r.topic === groups.find((g) => g.id === topic)?.title);
  }, [all, groups, q, topic]);

  const selected = rows.find((r) => r.id === current) ?? rows[0];

  // deep link: /pages/faq/#question-slug
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const hit = all.find((r) => r.id === id);
    if (hit) {
      setTopic(groups.find((g) => g.title === hit.topic)!.id);
      setCurrent(hit.id);
    }
  }, [all, groups]);

  const pick = (r: Row) => {
    setCurrent((c) => (c === r.id && window.matchMedia('(max-width: 1023px)').matches ? null : r.id));
    window.history.replaceState(null, '', `#${r.id}`);
  };

  return (
    <div className="overflow-hidden rounded-[14px] bg-white shadow-[0_1px_2px_rgba(21,23,26,.05),0_30px_60px_-40px_rgba(21,23,26,.4)] ring-1 ring-line-soft">
      {/* topic tabs + search */}
      <div className="flex flex-col gap-3 border-b border-line-soft p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div ref={lime.ref} role="tablist" aria-label="FAQ topics" className="relative -mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
          <LimelightPill box={lime.box} ready={lime.ready} className="lime-dark !inset-y-0" />
          {groups.map((g) => {
            const on = !q && topic === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={on}
                data-lime={on ? 'on' : ''}
                onClick={() => {
                  setTopic(g.id);
                  setQuery('');
                  setCurrent(null);
                }}
                className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[14px] transition-colors duration-300 ${
                  on ? 'font-semibold text-white' : 'font-medium text-ink-2 hover:text-ink'
                }`}
              >
                <Icon name={g.icon} size={16} strokeWidth={1.9} className={on ? 'text-white' : 'text-accent'} />
                {g.title}
              </button>
            );
          })}
        </div>
        <div className="flex h-10 items-center gap-2 rounded-full bg-[#F3F3F0] pl-4 pr-1 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-ink/20 lg:w-[260px]">
          <Icon name="search" size={16} strokeWidth={2} className="shrink-0 text-muted" />
          <label htmlFor="faq-search" className="sr-only">
            Search questions
          </label>
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrent(null);
            }}
            placeholder="Search all questions…"
            className="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#7a7f87] [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="grid size-8 place-items-center rounded-full text-muted hover:text-ink">
              <Icon name="x" size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:min-h-[380px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* question list */}
        <ul className="flex flex-col p-2 sm:p-3 lg:border-r lg:border-line-soft" aria-live="polite">
          {q && (
            <li className="px-3 pb-1 pt-2 text-[13px] text-muted">
              {rows.length ? `${rows.length} result${rows.length === 1 ? '' : 's'} for “${query.trim()}”` : `Nothing matches “${query.trim()}” — ask us below.`}
            </li>
          )}
          {rows.map((r, i) => {
            const on = selected?.id === r.id;
            const openMobile = current === r.id;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => pick(r)}
                  aria-expanded={openMobile}
                  className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition sm:px-4 ${
                    on ? 'lg:bg-accent-soft' : 'hover:bg-[#F6F6F3]'
                  }`}
                >
                  <span className={`w-6 shrink-0 text-[13px] font-semibold tabular-nums ${on ? 'lg:text-accent' : 'text-muted'}`}>{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={`text-[15px] leading-snug ${on ? 'font-semibold text-ink' : 'font-medium text-ink-2 group-hover:text-ink'}`}>{r.q}</span>
                    {q && <span className="text-[12px] text-muted">{r.topic}</span>}
                  </span>
                  <Icon
                    name="chev"
                    size={15}
                    strokeWidth={2.2}
                    className={`shrink-0 transition ${on ? 'lg:text-accent' : 'text-muted'} ${openMobile ? 'max-lg:rotate-90' : ''}`}
                  />
                </button>
                {openMobile && (
                  <div className="anim-msg px-4 pb-4 pl-12 lg:hidden">
                    <Answer row={r} compact />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* answer panel (desktop) */}
        <div className="hidden flex-col justify-between gap-8 bg-[#FAFAF8] p-8 lg:flex">
          {selected ? (
            <div key={selected.id} className="anim-msg flex flex-col gap-4">
              <span className="eyebrow text-accent">{selected.topic}</span>
              <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.02em]">{selected.q}</h2>
              <Answer row={selected} />
            </div>
          ) : (
            <p className="text-[15px] text-muted">Pick a question to see the answer.</p>
          )}
          <div className="flex items-center justify-between gap-4 border-t border-line-soft pt-5 text-sm text-ink-2">
            <span>Still unsure? We reply fast.</span>
            <a href={waLink(selected ? `Hello Al Faiz, about “${selected.q}”: ` : undefined)} target="_blank" rel="noopener" className="chat-chip">
              <Icon name="chat" size={13} strokeWidth={2} />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* help strip */}
      <div className="flex flex-col gap-3 border-t border-line-soft bg-ink px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span className="text-[15px] font-medium">
          Can’t find your answer? <span className="text-white/60">Ask us directly.</span>
        </span>
        <span className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('alfaiz:open-chat'))}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-semibold transition hover:brightness-110"
          >
            <Icon name="bot" size={16} strokeWidth={1.9} />
            Ask our assistant
          </button>
          <a href={waLink()} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink transition hover:bg-[#EDEDEA]">
            <Icon name="chat" size={16} />
            WhatsApp
          </a>
          <a href={site.phoneHref} className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold text-white/80 ring-1 ring-white/25 transition hover:text-white hover:ring-white/50">
            <Icon name="phone" size={15} />
            {site.phone}
          </a>
        </span>
      </div>
    </div>
  );
}

function Answer({ row, compact = false }: { row: Row; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <p className={`leading-relaxed text-ink-2 ${compact ? 'text-[14.5px]' : 'text-[16px]'}`}>{row.a}</p>
      {row.links && (
        <div className="flex flex-wrap gap-2">
          {row.links.map((l) =>
            l.external ? (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chat-chip">
                {l.label}
                <Icon name="arrow" size={13} strokeWidth={2.2} />
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="chat-chip">
                {l.label}
                <Icon name="arrow" size={13} strokeWidth={2.2} />
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
