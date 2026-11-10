'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icons';
import { db } from '../sb';
import { firstImage, loadProducts, useStore } from '../store';
import { Button, Card, IconButton, MoveButtons, PageHeader, ProductPicker, SaveBar, Thumb, move, toast, useLeaveGuard } from '../ui';
import { fail, SITE } from '../nav';

/** Featured products on the home page: which ones, in which order. Stored on the products themselves. */
export function Featured() {
  const { products } = useStore();
  const saved = useMemo(
    () =>
      products
        .filter((p) => p.featured)
        .sort((a, b) => (a.featured_rank || 999) - (b.featured_rank || 999) || a.name.localeCompare(b.name))
        .map((p) => p.handle),
    [products],
  );
  const [list, setList] = useState<string[]>(saved);
  const [picking, setPicking] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => setList(saved), [saved]);
  const dirty = JSON.stringify(list) !== JSON.stringify(saved);
  useLeaveGuard(dirty);

  const byHandle = (h: string) => products.find((p) => p.handle === h);

  const save = async () => {
    setBusy(true);
    try {
      const removed = saved.filter((h) => !list.includes(h));
      for (const h of removed) await db(`products?handle=eq.${encodeURIComponent(h)}`, { method: 'PATCH', body: { featured: false, featured_rank: 0 } });
      for (const [i, h] of list.entries()) {
        const p = byHandle(h);
        if (!p?.featured || p.featured_rank !== i + 1) await db(`products?handle=eq.${encodeURIComponent(h)}`, { method: 'PATCH', body: { featured: true, featured_rank: i + 1 } });
      }
      await loadProducts();
      toast('Featured products saved');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Featured products"
        desc="The “Featured products” row on the home page shows the first 8, in this order. You can also switch “Featured” on inside any product."
        actions={
          <a href={`${SITE}/#featured-title`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold text-ink-2 hover:bg-chip">
            View on site
            <Icon name="arrow" size={14} className="-rotate-45" />
          </a>
        }
      />
      <Card>
        <ol className="flex flex-col gap-2">
          {list.map((h, i) => {
            const p = byHandle(h);
            return (
              <li key={h} className={`flex items-center gap-3 rounded-lg p-2 ring-1 ${i < 8 ? 'ring-line' : 'ring-line-soft opacity-60'}`}>
                <span className="w-5 text-center text-[12px] font-semibold text-muted">{i + 1}</span>
                <Thumb src={firstImage(p)} size={48} />
                <a href={`#/products/${encodeURIComponent(h)}`} className="flex min-w-0 flex-1 flex-col hover:underline">
                  <span className="line-clamp-2 text-[14px] font-medium leading-snug text-ink">{p?.name ?? h}</span>
                  <span className="text-[12.5px] text-muted">
                    {p?.brand}
                    {p && !p.published && <span className="text-accent"> · hidden</span>}
                    {i >= 8 && ' · not shown (only the first 8 are)'}
                  </span>
                </a>
                <MoveButtons i={i} n={list.length} onMove={(to) => setList(move(list, i, to))} />
                <IconButton icon="trash" label="Remove from featured" className="hover:text-accent" onClick={() => setList(list.filter((x) => x !== h))} />
              </li>
            );
          })}
          {!list.length && <li className="rounded-lg bg-chip p-6 text-center text-[14px] text-muted">No featured products — the home page shows the first products of the catalogue instead.</li>}
        </ol>
        <Button icon="plus" className="mt-3" onClick={() => setPicking(true)}>
          Add product
        </Button>
      </Card>
      {picking && <ProductPicker exclude={list} onPick={(p) => setList([...list, p.handle])} onClose={() => setPicking(false)} />}
      <SaveBar dirty={dirty} busy={busy} onSave={save} onDiscard={() => setList(saved)} />
    </>
  );
}
