'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { QuoteItem } from '@/lib/types';

const KEY = 'alfaiz-quote-v1';

type QuoteCtx = {
  items: QuoteItem[];
  count: number;
  ready: boolean;
  has: (handle: string) => boolean;
  add: (item: Omit<QuoteItem, 'qty'>, qty?: number) => void;
  setQty: (handle: string, qty: number) => void;
  remove: (handle: string) => void;
  clear: () => void;
};

const Ctx = createContext<QuoteCtx | null>(null);

export function QuoteProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(saved)) setItems(saved.filter((x) => x && typeof x.handle === 'string'));
    } catch {
      /* storage unavailable — the list just lives in memory */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const has = useCallback((handle: string) => items.some((i) => i.handle === handle), [items]);
  const add = useCallback((item: Omit<QuoteItem, 'qty'>, qty = 1) => {
    setItems((list) => {
      const found = list.find((i) => i.handle === item.handle);
      if (found) return list.map((i) => (i.handle === item.handle ? { ...i, qty: i.qty + qty } : i));
      return [...list, { ...item, qty }];
    });
  }, []);
  const setQty = useCallback((handle: string, qty: number) => {
    setItems((list) => list.map((i) => (i.handle === handle ? { ...i, qty: Math.max(1, Math.min(9999, Math.round(qty) || 1)) } : i)));
  }, []);
  const remove = useCallback((handle: string) => setItems((list) => list.filter((i) => i.handle !== handle)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, count: items.length, ready, has, add, setQty, remove, clear }),
    [items, ready, has, add, setQty, remove, clear],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuote() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useQuote must be used inside <QuoteProvider>');
  return ctx;
}
