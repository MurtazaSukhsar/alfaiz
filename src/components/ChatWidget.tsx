'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { site, waLink } from '@/data/site';
import { GREETING, respond, type Action, type Memory, type Reply } from '@/lib/chatbot/brain';
import { loadEngine, type Engine } from '@/lib/chatbot/engine';
import { loadIndex } from '@/lib/search';
import type { SearchIndex } from '@/lib/types';
import { Icon } from './Icons';
import { LogoMark } from './Logo';
import { useQuote } from './QuoteProvider';

type Msg = { id: number; from: 'bot' | 'user'; text?: string; reply?: Reply };
type Status = 'idle' | 'loading' | 'ready' | 'basic';

const STORE = 'alfaiz-chat-v1';
let nextId = 1;

/** Floating WhatsApp button + the Al Faiz website assistant. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [nudge, setNudge] = useState(false);
  const engine = useRef<Engine | null>(null);
  const memory = useRef<Memory>({});
  const index = useRef<SearchIndex | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { items, count, add, has, clear } = useQuote();
  const router = useRouter();

  // restore this tab's conversation
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORE) || '[]') as Msg[];
      if (Array.isArray(saved) && saved.length) {
        setMsgs(saved);
        nextId = Math.max(...saved.map((m) => m.id)) + 1;
      }
    } catch {
      /* ignore */
    }
    // one gentle hint per visit
    let shown = false;
    try {
      shown = sessionStorage.getItem(`${STORE}-hint`) === '1';
    } catch {
      /* ignore */
    }
    if (!shown) {
      const t = window.setTimeout(() => setNudge(true), 6000);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-40)));
    } catch {
      /* ignore */
    }
  }, [msgs]);

  // load the model + product index the first time the chat opens
  const warmUp = useCallback(() => {
    if (status !== 'idle') return;
    setStatus('loading');
    loadIndex()
      .then((i) => (index.current = i))
      .catch(() => {});
    loadEngine()
      .then((e) => {
        engine.current = e;
        setStatus('ready');
      })
      .catch(() => setStatus('basic'));
  }, [status]);

  const openChat = useCallback(() => {
    setOpen(true);
    setNudge(false);
    try {
      sessionStorage.setItem(`${STORE}-hint`, '1');
    } catch {
      /* ignore */
    }
    warmUp();
    setMsgs((m) => (m.length ? m : [{ id: nextId++, from: 'bot', reply: GREETING }]));
  }, [warmUp]);

  // other parts of the site can open the assistant: window.dispatchEvent(new Event('alfaiz:open-chat'))
  useEffect(() => {
    const onOpen = () => openChat();
    window.addEventListener('alfaiz:open-chat', onOpen);
    return () => window.removeEventListener('alfaiz:open-chat', onOpen);
  }, [openChat]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, busy, open]);

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput('');
      setMsgs((m) => [...m, { id: nextId++, from: 'user', text: q }]);
      setBusy(true);

      // Navigation: "take me to the cart", "open DeWALT", or "take me there" / "yes" after a suggestion.
      const last = [...msgs].reverse().find((m) => m.from === 'bot')?.reply;
      const navRaw = q.match(/^(?:please\s+|can you\s+|pls\s+)?(?:take me|bring me|go|navigate|open|show me|show)\b(?:\s+(?:to|the|me|my|page|of)\b)*\s*(.*)$/i);
      // “show more” continues the last product list instead of navigating
      const nav = navRaw && memory.current.pool && /^(me\s+)?(some\s+|any\s+)?(more|others?|next|rest)\b/i.test(navRaw[1] ?? '') ? null : navRaw;
      const rest = (nav?.[1] ?? '').replace(/[?.!]/g, '').trim().toLowerCase();
      const yes = /^(yes|yeah|yep|sure|please do|do it|go ahead)\b/i.test(q);
      const lastTarget = last?.more ?? last?.actions?.find((a): a is Extract<Action, { kind: 'link' }> => a.kind === 'link' && !a.external && !/^(tel|mailto):/.test(a.href));
      let dest: { label: string; href: string } | null = null;
      if (nav) dest = !rest || /^(there|it|that|them|this|all|more|page|results?|link)$/.test(rest) ? lastTarget ?? null : findPage(rest, index.current);
      const clearOffer = yes && last?.actions?.find((a) => a.kind === 'clear-cart');
      if (!dest && yes && !clearOffer && lastTarget) dest = lastTarget;
      const vague = !!nav && (!rest || /^(there|it|that|them|this|all|more|page|results?|link)$/.test(rest));
      if (!clearOffer && !dest && vague) {
        window.setTimeout(() => {
          setMsgs((m) => [
            ...m,
            {
              id: nextId++,
              from: 'bot',
              reply: {
                text: ['Where would you like to go? Tell me a page, brand or category — for example “cart”, “contact”, “DeWALT” or “power tools”.'],
                actions: [
                  { kind: 'link', label: 'Cart', href: '/cart/', icon: 'cart' },
                  { kind: 'link', label: 'All products', href: '/collections/all/', icon: 'arrow' },
                  { kind: 'link', label: 'Contact', href: '/pages/contact/', icon: 'pin' },
                ],
              },
            },
          ]);
          setBusy(false);
        }, 350);
        return;
      }
      if (clearOffer || dest) {
        window.setTimeout(() => {
          if (clearOffer) {
            clear();
            setMsgs((m) => [...m, { id: nextId++, from: 'bot', reply: { text: ['Done — your cart is now empty.'] } }]);
          } else if (dest) {
            setMsgs((m) => [...m, { id: nextId++, from: 'bot', reply: { text: [`Opening ${dest.label.replace(/^See all /, '').replace(/\s*\(\d+\)$/, '')}…`], actions: [{ kind: 'link', label: dest.label, href: dest.href, icon: 'arrow' }] } }]);
            router.push(dest.href);
            if (window.matchMedia('(max-width: 639px)').matches) setOpen(false);
          }
          setBusy(false);
        }, 350);
        return;
      }

      // the product index is small — make sure it's there before answering
      if (!index.current) index.current = await loadIndex().catch(() => null);
      const started = Date.now();
      let reply: Reply;
      try {
        reply = await respond(q, { engine: engine.current, index: index.current, cartCount: count, memory: memory.current });
      } catch {
        reply = { text: ['Something went wrong on my side. You can always reach our team on WhatsApp.'], actions: [{ kind: 'link', label: 'Chat on WhatsApp', href: waLink(), external: true, icon: 'chat' }] };
      }
      const wait = Math.max(0, 450 - (Date.now() - started));
      window.setTimeout(() => {
        setMsgs((m) => [...m, { id: nextId++, from: 'bot', reply }]);
        setBusy(false);
      }, wait);
    },
    [busy, count, msgs, clear, router],
  );

  const runAction = (a: Action) => {
    if (a.kind === 'ask') ask(a.text);
    if (a.kind === 'clear-cart') {
      clear();
      setMsgs((m) => [...m, { id: nextId++, from: 'bot', reply: { text: ['Done — your cart is now empty.'] } }]);
    }
  };

  return (
    <>
      {/* Floating buttons */}
      <div className={`fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-5 sm:right-5 ${open ? 'max-sm:hidden' : ''}`}>
        <a
          href={waLink()}
          target="_blank"
          rel="noopener"
          aria-label="Chat with Al Faiz on WhatsApp"
          title="WhatsApp us"
          className={`${open ? 'hidden' : 'grid'} size-[60px] place-items-center rounded-full bg-[#25D366] ring-2 ring-white shadow-[0_10px_24px_-8px_rgba(21,23,26,.45)] transition duration-300 hover:-translate-y-0.5 hover:brightness-105`}
        >
          <span aria-hidden="true" className="size-[34px] bg-white [mask:url(/icons/whatsapp.svg)_center/contain_no-repeat]" />
        </a>

        <div className="relative flex items-center">
          {nudge && !open && (
            <button
              type="button"
              onClick={openChat}
              className="anim-drop absolute bottom-1 right-[72px] w-max max-w-[220px] rounded-2xl rounded-br-md bg-white px-4 py-3 text-left text-sm font-medium text-ink shadow-[0_14px_30px_-12px_rgba(21,23,26,.4)] ring-1 ring-line-soft"
            >
              Need help finding a tool? Ask me 👋
            </button>
          )}
          <button
            type="button"
            onClick={() => (open ? setOpen(false) : openChat())}
            aria-label={open ? 'Close assistant' : 'Open the Al Faiz assistant'}
            aria-expanded={open}
            aria-controls="alfaiz-chat"
            className={`relative grid size-[60px] place-items-center rounded-full bg-accent text-white ring-2 ring-white shadow-[0_14px_30px_-10px_rgba(156,0,21,.6)] transition duration-300 hover:-translate-y-0.5 hover:brightness-110 ${open ? '' : 'anim-pulse'}`}
          >
            <Icon name={open ? 'x' : 'bot'} size={open ? 24 : 27} strokeWidth={1.9} />
            {!open && <span className="absolute right-1 top-1 size-3 rounded-full bg-[#2BB673] ring-2 ring-white" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          id="alfaiz-chat"
          role="dialog"
          aria-label="Al Faiz assistant"
          onClickCapture={(e) => {
            // on phones the chat covers the page — close it when a site link is followed
            const a = (e.target as HTMLElement).closest('a');
            if (a && a.getAttribute('href')?.startsWith('/') && window.matchMedia('(max-width: 639px)').matches) setOpen(false);
          }}
          className="anim-chat fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#F6F6F3] sm:inset-auto sm:bottom-[96px] sm:right-5 sm:h-[min(640px,calc(100svh-130px))] sm:w-[400px] sm:rounded-[10px] sm:shadow-[0_30px_70px_-20px_rgba(21,23,26,.45)] sm:ring-1 sm:ring-line-soft"
        >
          <div className="flex items-center gap-3 bg-ink px-4 py-3.5 text-white">
            <span className="grid size-11 place-items-center rounded-full bg-white">
              <LogoMark className="h-[26px] w-[16px]" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
              <span className="text-[15px] font-semibold">Al Faiz Assistant</span>
              <span className="flex items-center gap-1.5 text-[12px] text-white/65">
                <span className={`size-1.5 rounded-full ${status === 'loading' ? 'animate-pulse bg-[#FEBD17]' : 'bg-[#2BB673]'}`} />
                {status === 'loading' ? 'Getting ready…' : 'Online · help with this website'}
              </span>
            </span>
            <a href={waLink()} target="_blank" rel="noopener" aria-label="Talk to a person on WhatsApp" title="Talk to a person" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-[#25D366]">
              <span aria-hidden="true" className="size-[22px] bg-white [mask:url(/icons/whatsapp.svg)_center/contain_no-repeat]" />
            </a>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              <Icon name="x" size={18} strokeWidth={2} />
            </button>
          </div>

          <div ref={scroller} className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-3.5 py-4" aria-live="polite">
            {msgs.map((m) =>
              m.from === 'user' ? (
                <div key={m.id} className="anim-msg max-w-[82%] self-end rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[14.5px] leading-relaxed text-white">
                  {m.text}
                </div>
              ) : (
                <BotBubble key={m.id} reply={m.reply!} items={items} has={has} onAdd={add} onAction={runAction} />
              ),
            )}
            {busy && (
              <div className="anim-msg flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 ring-1 ring-line-soft" aria-label="Assistant is typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="border-t border-line-soft bg-white p-3"
          >
            <div className="flex items-center gap-2 rounded-lg bg-[#F1F2EF] pl-4 pr-1.5 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-ink/20">
              <label htmlFor="chat-input" className="sr-only">
                Ask the Al Faiz assistant
              </label>
              <input
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={300}
                autoComplete="off"
                placeholder="Ask about a tool, brand or order…"
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#7a7f87]"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                aria-label="Send"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-white transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                <Icon name="send" size={16} strokeWidth={2.2} />
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">
              Answers about this website only · prices are confirmed by our team on{' '}
              <a href={site.phoneHref} className="underline underline-offset-2">
                {site.phone}
              </a>
            </p>
          </form>
        </div>
      )}
    </>
  );
}

/** Button that opens the assistant from anywhere on the site. */
export function AskAssistant({ label = 'Ask our assistant' }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event('alfaiz:open-chat'))} className="pill pill-lg bg-accent text-white">
      <Icon name="bot" size={18} strokeWidth={1.9} />
      {label}
    </button>
  );
}

const PAGES: [RegExp, string, string][] = [
  [/\b(cart|basket|bag|checkout)\b/, 'your cart', '/cart/'],
  [/\b(bulk|boq|special (product|request)|request form)\b/, 'the bulk & special request page', '/pages/bulk-special-product-request/'],
  [/\b(privacy|policy)\b/, 'the privacy policy', '/policies/privacy-policy/'],
  [/\b(contact|map|location|showroom|address)\b/, 'the contact page', '/pages/contact/'],
  [/\babout\b/, 'About us', '/pages/about-us/'],
  [/\b(faq|faqs|questions|help centre|help center)\b/, 'the FAQ page', '/pages/faq/'],
  [/\b(home|homepage|start)\b/, 'the home page', '/'],
  [/\b(all products|catalog|catalogue|shop|store|products)\b/, 'all products', '/collections/all/'],
  [/\bsearch\b/, 'search', '/search/'],
];

/** "cart" -> /cart/, "dewalt" -> /collections/dewalt/, "power tools" -> /collections/power-tools/ */
function findPage(text: string, index: SearchIndex | null): { label: string; href: string } | null {
  const t = text.replace(/\s+/g, ' ').trim();
  if (index) {
    const words = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    const tw = words(t).replace(/s\b/g, '');
    const col = index.collections.find((c) => {
      const cw = words(c.t).replace(/s\b/g, '');
      return cw.length > 2 && (tw === cw || tw.includes(cw) || (tw.length > 3 && cw.includes(tw)));
    });
    if (col) return { label: col.t, href: `/collections/${col.h}/` };
  }
  const page = PAGES.find(([re]) => re.test(t));
  return page ? { label: page[1], href: page[2] } : null;
}

function BotBubble({
  reply,
  items,
  has,
  onAdd,
  onAction,
}: {
  reply: Reply;
  items: { handle: string; name: string; qty: number }[];
  has: (h: string) => boolean;
  onAdd: (item: { handle: string; name: string; brand: string; image: string }) => void;
  onAction: (a: Action) => void;
}) {
  return (
    <div className="anim-msg flex max-w-[92%] flex-col gap-2.5 self-start">
      <div className="flex flex-col gap-2 rounded-2xl rounded-bl-md bg-white px-4 py-3 text-[14.5px] leading-relaxed text-ink ring-1 ring-line-soft">
        {reply.text.map((t, i) => (
          <p key={i}>{t}</p>
        ))}
        {reply.list && (
          <ul className="flex flex-col gap-1">
            {reply.list.map((l) => (
              <li key={l.label}>
                {l.href ? (
                  <Link href={l.href} className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                    {l.label}
                    <Icon name="arrow" size={13} strokeWidth={2.2} />
                  </Link>
                ) : (
                  <span className="text-ink-2">{l.label}</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {reply.showCart && (
          <ul className="flex flex-col divide-y divide-line-soft rounded-xl bg-[#F6F6F3] px-3">
            {items.map((it) => (
              <li key={it.handle} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                <span className="line-clamp-1">{it.name}</span>
                <span className="shrink-0 font-semibold">× {it.qty}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {reply.products && reply.products.length > 0 && (
        <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {reply.products.map((p) => {
            const inCart = has(p.h);
            return (
              <div key={p.h} className="flex w-[152px] shrink-0 snap-start flex-col rounded-2xl bg-white p-2 ring-1 ring-line-soft">
                <Link href={`/products/${p.h}/`} className="flex h-[96px] items-center justify-center rounded-xl bg-[#F4F4F1] p-2">
                  {p.i ? <img src={p.i} alt="" loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <Icon name="box" className="text-muted" />}
                </Link>
                <span className="mt-2 px-1 text-[11px] font-medium text-muted">{p.b}</span>
                <Link href={`/products/${p.h}/`} className="line-clamp-2 px-1 text-[12.5px] font-semibold leading-snug text-ink hover:text-accent">
                  {p.n}
                </Link>
                <span className="mt-auto flex gap-1.5 pt-2">
                  <Link href={`/products/${p.h}/`} className="flex h-8 flex-1 items-center justify-center rounded-md bg-[#F1F2EF] text-[12px] font-semibold text-ink hover:bg-[#E7E8E4]">
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => !inCart && onAdd({ handle: p.h, name: p.n, brand: p.b, image: p.i })}
                    aria-label={inCart ? `${p.n} is in your cart` : `Add ${p.n} to cart`}
                    className={`grid size-8 place-items-center rounded-full transition ${inCart ? 'bg-ink text-white' : 'bg-accent text-white hover:brightness-110'}`}
                  >
                    <Icon name={inCart ? 'check' : 'cart'} size={14} strokeWidth={2.2} />
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {reply.more && (
        <Link href={reply.more.href} className="inline-flex w-fit items-center gap-1.5 px-1 text-[13px] font-semibold text-accent hover:underline">
          {reply.more.label}
          <Icon name="arrow" size={13} strokeWidth={2.2} />
        </Link>
      )}

      {reply.actions && reply.actions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {reply.actions.map((a) =>
            a.kind === 'link' ? (
              a.external || /^(tel|mailto):/.test(a.href) ? (
                <a key={a.label} href={a.href} target={a.external ? '_blank' : undefined} rel={a.external ? 'noopener' : undefined} className="chat-chip">
                  {a.icon && <Icon name={a.icon} size={13} strokeWidth={2} />}
                  {a.label}
                </a>
              ) : (
                <Link key={a.label} href={a.href} className="chat-chip">
                  {a.icon && <Icon name={a.icon} size={13} strokeWidth={2} />}
                  {a.label}
                </Link>
              )
            ) : (
              <button key={a.label} type="button" onClick={() => onAction(a)} className={a.kind === 'clear-cart' ? 'chat-chip chat-chip-danger' : 'chat-chip'}>
                {a.label}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
