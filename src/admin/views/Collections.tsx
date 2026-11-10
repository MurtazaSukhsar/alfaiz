'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icons';
import { db, slugify } from '../sb';
import { patchCollection, useStore, type CollectionRow } from '../store';
import { RichText } from '../RichText';
import { Badge, Button, Card, Field, ImageInput, Input, PageHeader, SaveBar, Thumb, Toggle, cx, timeAgo, toast, useLeaveGuard } from '../ui';
import { fail, go, SITE } from '../nav';
import { Loading } from './Products';

export function CollectionList({ query }: { query: URLSearchParams }) {
  const { collections, products } = useStore();
  const kind = (query.get('k') === 'brand' ? 'brand' : 'category') as 'brand' | 'category';
  const [q, setQ] = useState('');
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) for (const h of p.collections) m.set(h, (m.get(h) || 0) + 1);
    return m;
  }, [products]);
  const list = collections.filter((c) => c.kind === kind && c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Categories & brands"
        desc="Every brand and category has its own page on the website listing its products."
        actions={
          <Button variant="primary" icon="plus" onClick={() => go(`#/collections/new?k=${kind}`)}>
            Add {kind === 'brand' ? 'brand' : 'category'}
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg bg-white p-1 ring-1 ring-line-soft">
          {(['category', 'brand'] as const).map((k) => (
            <a key={k} href={`#/collections?k=${k}`} className={cx('h-9 rounded-md px-4 text-[14px] font-semibold leading-9', kind === k ? 'bg-ink text-white' : 'text-ink-2 hover:text-ink')}>
              {k === 'brand' ? 'Brands' : 'Categories'} ({collections.filter((c) => c.kind === k).length})
            </a>
          ))}
        </div>
        <Input placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-[280px]" />
      </div>
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-line-soft">
        <ul className="divide-y divide-line-soft">
          {list.map((c) => (
            <li key={c.handle}>
              <a href={`#/collections/${encodeURIComponent(c.handle)}`} className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-chip/60 sm:px-4">
                <Thumb src={c.kind === 'brand' ? `/brands/${c.handle}.png` : c.image || ''} size={48} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[14.5px] font-medium text-ink">{c.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                    {counts.get(c.handle) || 0} products
                    {!c.published && <Badge tone="off">Hidden</Badge>}
                    {!counts.get(c.handle) && c.published && <Badge tone="warn">Empty — not shown</Badge>}
                  </span>
                </span>
                <Icon name="chev" size={16} className="text-muted" />
              </a>
            </li>
          ))}
          {!list.length && <li className="px-4 py-12 text-center text-[14px] text-muted">Nothing here yet.</li>}
        </ul>
      </div>
    </>
  );
}

export function CollectionEdit({ handle, query }: { handle: string; query: URLSearchParams }) {
  const isNew = handle === 'new';
  const { collections, products } = useStore();
  const blank: CollectionRow = { handle: '', title: '', kind: query.get('k') === 'brand' ? 'brand' : 'category', image: '', html: '', sort: collections.length, published: true, updated_at: '' };
  const [saved, setSaved] = useState<CollectionRow | null>(isNew ? blank : null);
  const [c, setC] = useState<CollectionRow>(blank);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isNew) {
      setSaved(blank);
      setC(blank);
      return;
    }
    const found = collections.find((x) => x.handle === handle);
    if (!found) {
      toast('Not found', 'error');
      go('#/collections');
      return;
    }
    const r = { ...found, image: found.image || '', html: found.html || '' };
    setSaved(r);
    setC(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle, isNew]);

  const dirty = !!saved && JSON.stringify(saved) !== JSON.stringify(c);
  useLeaveGuard(dirty);
  if (!saved) return <Loading />;

  const count = products.filter((p) => p.collections.includes(c.handle)).length;
  const word = c.kind === 'brand' ? 'brand' : 'category';
  const set = <K extends keyof CollectionRow>(k: K, v: CollectionRow[K]) => setC((x) => ({ ...x, [k]: v }));

  const save = async () => {
    const title = c.title.trim();
    if (!title) return toast(`Give the ${word} a name.`, 'error');
    const h = isNew ? slugify(c.handle || title) : c.handle;
    const body = { handle: h, title, kind: c.kind, image: c.image || null, html: c.html, sort: Number(c.sort) || 0, published: c.published };
    setBusy(true);
    try {
      const rows = isNew ? await db<CollectionRow[]>('collections', { method: 'POST', body }) : await db<CollectionRow[]>(`collections?handle=eq.${encodeURIComponent(handle)}`, { method: 'PATCH', body });
      const r = { ...rows[0], image: rows[0].image || '', html: rows[0].html || '' };
      setSaved(r);
      setC(r);
      patchCollection(rows[0]);
      toast(isNew ? `${title} added` : 'Saved');
      if (isNew) go(`#/collections/${encodeURIComponent(h)}`, true);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (count) return toast(`Move or remove its ${count} products first, or switch off “Show on website”.`, 'error');
    if (!window.confirm(`Delete “${c.title}” for good?`)) return;
    try {
      await db(`collections?handle=eq.${encodeURIComponent(handle)}`, { method: 'DELETE' });
      patchCollection(null, handle);
      toast('Deleted');
      go(`#/collections?k=${c.kind}`, true);
    } catch (e) {
      fail(e);
    }
  };

  return (
    <>
      <PageHeader
        back={{ href: `#/collections?k=${c.kind}`, label: c.kind === 'brand' ? 'Brands' : 'Categories' }}
        title={isNew ? `Add ${word}` : c.title}
        desc={!isNew ? `${count} products · last saved ${timeAgo(saved.updated_at)}` : undefined}
        actions={
          !isNew && (
            <>
              <Button icon="box" onClick={() => go(`#/products?${c.kind === 'brand' ? 'b' : 'c'}=${encodeURIComponent(c.handle)}`)}>
                See its products
              </Button>
              <a href={`${SITE}/collections/${c.handle}/`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold text-ink-2 hover:bg-chip">
                View on site
                <Icon name="arrow" size={14} className="-rotate-45" />
              </a>
            </>
          )
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name">
                <Input
                  value={c.title}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (isNew) set('handle', slugify(e.target.value));
                  }}
                />
              </Field>
              <Field label="Web address" help={isNew ? 'Made from the name. Can’t be changed later.' : 'Fixed after creating.'}>
                <Input value={c.handle} disabled={!isNew} onChange={(e) => set('handle', slugify(e.target.value))} className="font-mono text-[12.5px] disabled:bg-chip disabled:text-muted" />
              </Field>
              <div className="sm:col-span-2">
                <ImageInput
                  label={c.kind === 'brand' ? 'Banner image' : 'Category image'}
                  folder={c.kind === 'brand' ? 'brands' : 'categories'}
                  value={c.image || ''}
                  onChange={(v) => set('image', v)}
                  help={c.kind === 'brand' ? 'The brand logo in the moving logo strip is set in Home page → Brands strip.' : 'Used when the category is shared on social media and in the menu.'}
                />
              </div>
            </div>
          </Card>
          <Card title="Description" desc={`Shown on the ${word} page above the products.`}>
            <RichText value={c.html} onChange={(v) => set('html', v)} label="Text" />
          </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Status">
            <div className="flex flex-col gap-4">
              <Toggle checked={c.published} onChange={(v) => set('published', v)} label="Show on website" help={`Off = the ${word} page and menu link are hidden. Its products stay visible.`} />
              {!count && <p className="rounded-lg bg-[#fff4d6] p-3 text-[13px] text-[#7a5a00]">A {word} without products isn’t shown on the website. Add products to it from the product pages.</p>}
              <Field label="Order in menus" help="Lower numbers come first.">
                <Input type="number" value={c.sort} onChange={(e) => set('sort', Number(e.target.value) || 0)} />
              </Field>
              {!isNew && (
                <Button variant="danger" icon="trash" onClick={remove}>
                  Delete {word}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
      <SaveBar dirty={dirty || isNew} busy={busy} onSave={save} onDiscard={isNew ? undefined : () => setC(saved)} />
    </>
  );
}
