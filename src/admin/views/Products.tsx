'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icons';
import { db, slugify } from '../sb';
import { firstImage, patchProduct, useStore, type Img, type ProductLite, type ProductRow } from '../store';
import { RichText } from '../RichText';
import { Badge, Button, Card, Field, ImageInput, Input, MultiChoice, PageHeader, SaveBar, Select, Spinner, StringList, Textarea, Thumb, Toggle, cx, move, timeAgo, toast, useLeaveGuard, thumb } from '../ui';
import { fail, go, SITE } from '../nav';

const PAGE = 40;

export function ProductList({ query }: { query: URLSearchParams }) {
  const { products, collections, content } = useStore();
  const [q, setQ] = useState(query.get('q') || '');
  const [brand, setBrand] = useState(query.get('b') || '');
  const [cat, setCat] = useState(query.get('c') || '');
  const [status, setStatus] = useState(query.get('s') || '');
  const [shown, setShown] = useState(PAGE);
  const brands = collections.filter((c) => c.kind === 'brand');
  const cats = collections.filter((c) => c.kind === 'category');
  const industries = (content.industries as { slug: string; title: string }[] | undefined) ?? [];

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return products.filter(
      (p) =>
        (!brand || p.brand_handle === brand || p.collections.includes(brand)) &&
        (!cat || p.collections.includes(cat)) &&
        (!status ||
          (status === 'visible' && p.published) ||
          (status === 'hidden' && !p.published) ||
          (status === 'featured' && p.featured) ||
          (status === 'soldout' && !p.available) ||
          (status === 'nophoto' && !p.images?.length) ||
          (status.startsWith('ind:') && p.industries?.includes(status.slice(4)))) &&
        words.every((w) => `${p.name} ${p.brand} ${p.handle}`.toLowerCase().includes(w)),
    );
  }, [products, q, brand, cat, status]);

  useEffect(() => setShown(PAGE), [q, brand, cat, status]);

  return (
    <>
      <PageHeader
        title="Products"
        desc={`${products.length} products · ${products.filter((p) => !p.published).length} hidden`}
        actions={
          <Button variant="primary" icon="plus" onClick={() => go('#/products/new')}>
            Add product
          </Button>
        }
      />
      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]">
        <div className="relative col-span-2 lg:col-span-1">
          <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Search name, model or brand…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={brand} onChange={(e) => setBrand(e.target.value)} options={[{ value: '', label: 'All brands' }, ...brands.map((b) => ({ value: b.handle, label: b.title }))]} />
        <Select value={cat} onChange={(e) => setCat(e.target.value)} options={[{ value: '', label: 'All categories' }, ...cats.map((b) => ({ value: b.handle, label: b.title }))]} />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="col-span-2 lg:col-span-1"
          options={[
            { value: '', label: 'Any status' },
            { value: 'visible', label: 'Shown on website' },
            { value: 'hidden', label: 'Hidden' },
            { value: 'featured', label: 'Featured' },
            { value: 'soldout', label: 'Sold out' },
            { value: 'nophoto', label: 'No photo' },
            ...industries.map((i) => ({ value: `ind:${i.slug}`, label: `Industry: ${i.title}` })),
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-line-soft">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5 text-[12.5px] font-semibold text-muted">
          <span>{list.length === products.length ? 'All products' : `${list.length} found`}</span>
          <span className="hidden sm:block">Last edited</span>
        </div>
        <ul className="divide-y divide-line-soft">
          {list.slice(0, shown).map((p) => (
            <li key={p.handle}>
              <a href={`#/products/${encodeURIComponent(p.handle)}`} className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-chip/60 sm:px-4">
                <Thumb src={firstImage(p)} size={52} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="line-clamp-2 text-[14px] font-medium leading-snug text-ink">{p.name}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                    {p.brand || 'No brand'}
                    {!p.published && <Badge tone="off">Hidden</Badge>}
                    {p.featured && <Badge tone="ok">Featured</Badge>}
                    {!p.available && <Badge tone="warn">Sold out</Badge>}
                    {!p.images?.length && <Badge tone="warn">No photo</Badge>}
                  </span>
                </span>
                <span className="hidden shrink-0 text-[12.5px] text-muted sm:block">{timeAgo(p.updated_at)}</span>
                <Icon name="chev" size={16} className="shrink-0 text-muted" />
              </a>
            </li>
          ))}
          {!list.length && <li className="px-4 py-12 text-center text-[14px] text-muted">No products match these filters.</li>}
        </ul>
        {list.length > shown && (
          <div className="border-t border-line-soft p-3 text-center">
            <Button onClick={() => setShown((n) => n + PAGE)}>Show more ({list.length - shown} left)</Button>
          </div>
        )}
      </div>
    </>
  );
}

const blank: ProductRow = {
  handle: '',
  title: '',
  name: '',
  subtitle: '',
  brand: '',
  brand_handle: null,
  type: '',
  tags: [],
  collections: [],
  images: [],
  price: 0,
  available: true,
  html: '',
  summary: '',
  sort: 0,
  published: true,
  featured: false,
  featured_rank: 0,
  industries: [],
  updated_at: '',
};

export function ProductEdit({ handle }: { handle: string }) {
  const isNew = handle === 'new';
  const { collections, content } = useStore();
  const [saved, setSaved] = useState<ProductRow | null>(isNew ? blank : null);
  const [p, setP] = useState<ProductRow>(blank);
  const [busy, setBusy] = useState(false);
  const [handleTouched, setHandleTouched] = useState(false);

  useEffect(() => {
    if (isNew) {
      setSaved(blank);
      setP(blank);
      return;
    }
    db<ProductRow[]>(`products?handle=eq.${encodeURIComponent(handle)}&select=*`)
      .then((rows) => {
        if (!rows.length) {
          toast('Product not found', 'error');
          go('#/products');
          return;
        }
        const r = { ...blank, ...rows[0], images: (rows[0].images || []).map((i: Img | string) => (typeof i === 'string' ? { src: i } : i)) };
        setSaved(r);
        setP(r);
      })
      .catch(fail);
  }, [handle, isNew]);

  const dirty = !!saved && JSON.stringify(saved) !== JSON.stringify(p);
  useLeaveGuard(dirty);

  if (!saved) return <Loading />;

  const set = <K extends keyof ProductRow>(k: K, v: ProductRow[K]) => setP((x) => ({ ...x, [k]: v }));
  const brands = collections.filter((c) => c.kind === 'brand');
  const cats = collections.filter((c) => c.kind === 'category');
  const industries = ((content.industries as { slug: string; title: string }[] | undefined) ?? defaultIndustries).map((i) => ({ value: i.slug, label: i.title }));
  const catSel = p.collections.filter((h) => cats.some((c) => c.handle === h) || !brands.some((b) => b.handle === h));

  const save = async () => {
    const name = p.name.trim();
    if (!name) return toast('Give the product a name.', 'error');
    const h = isNew ? slugify(p.handle || name) : p.handle;
    if (!h) return toast('The web address can’t be empty.', 'error');
    const brandCol = brands.find((b) => b.handle === p.brand_handle);
    const row = {
      ...p,
      handle: h,
      name,
      title: p.title.trim() || name,
      brand: brandCol?.title ?? '',
      brand_handle: brandCol?.handle ?? null,
      collections: [...new Set([...(brandCol ? [brandCol.handle] : []), ...catSel])],
      images: p.images.filter((i) => i.src),
      price: Number(p.price) || 0,
      sort: Number(p.sort) || 0,
      featured_rank: Number(p.featured_rank) || 0,
      tags: p.tags.map((t) => t.trim()).filter(Boolean),
    };
    const { updated_at: _u, ...body } = row;
    void _u;
    setBusy(true);
    try {
      const rows = isNew
        ? await db<ProductRow[]>('products', { method: 'POST', body })
        : await db<ProductRow[]>(`products?handle=eq.${encodeURIComponent(handle)}`, { method: 'PATCH', body });
      const r = { ...blank, ...rows[0] };
      setSaved(r);
      setP(r);
      patchProduct(toLite(r));
      toast(isNew ? 'Product added' : 'Product saved');
      if (isNew) go(`#/products/${encodeURIComponent(r.handle)}`, true);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${p.name}” for good?\n\nTip: switch off “Show on website” instead if you might sell it again.`)) return;
    setBusy(true);
    try {
      await db(`products?handle=eq.${encodeURIComponent(handle)}`, { method: 'DELETE' });
      patchProduct(null, handle);
      toast('Product deleted');
      go('#/products', true);
    } catch (e) {
      fail(e);
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        back={{ href: '#/products', label: 'All products' }}
        title={isNew ? 'Add product' : p.name || 'Product'}
        desc={!isNew && saved.updated_at ? `Last saved ${timeAgo(saved.updated_at)}` : undefined}
        actions={
          !isNew && (
            <a href={`${SITE}/products/${saved.handle}/`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold text-ink-2 hover:bg-chip">
              View on site
              <Icon name="arrow" size={14} className="-rotate-45" />
            </a>
          )
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Product name" className="sm:col-span-2" help="Shown on the product page, in search and on cards.">
                <Input
                  value={p.name}
                  onChange={(e) => {
                    set('name', e.target.value);
                    if (isNew && !handleTouched) set('handle', slugify(e.target.value));
                  }}
                  placeholder="e.g. DeWALT DCD796 18V brushless combi drill"
                />
              </Field>
              <Field label="Subtitle" className="sm:col-span-2" help="Optional short line under the name (e.g. model number or pack size).">
                <Input value={p.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
              </Field>
              <Field label="Brand">
                <Select value={p.brand_handle ?? ''} onChange={(e) => set('brand_handle', e.target.value || null)} options={[{ value: '', label: 'No brand' }, ...brands.map((b) => ({ value: b.handle, label: b.title }))]} />
              </Field>
              <Field label="Page title for Google" help="Leave empty to use the name.">
                <Input value={p.title === p.name ? '' : p.title} placeholder={p.name} onChange={(e) => set('title', e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <MultiChoice
                  label="Categories"
                  value={catSel}
                  onChange={(v) => set('collections', [...(p.brand_handle ? [p.brand_handle] : []), ...v])}
                  options={cats.map((c) => ({ value: c.handle, label: c.title }))}
                  help="The product shows in each category you add."
                />
              </div>
            </div>
          </Card>

          <Card title="Photos" desc="The first photo is the main one. Square photos on a white background look best.">
            <Photos images={p.images} onChange={(v) => set('images', v)} folder={`products/${slugify(p.handle || p.name || 'new')}`} />
          </Card>

          <Card title="Description">
            <div className="flex flex-col gap-4">
              <RichText value={p.html} onChange={(v) => set('html', v)} help="Spec tables in the description are shown as the product’s specifications. Pasted text arrives without formatting — use HTML to paste a table." />
              <Field label="Short summary" help="Used in search results and on Google. Leave empty to use the start of the description.">
                <Textarea value={p.summary} onChange={(e) => set('summary', e.target.value)} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Status">
            <div className="flex flex-col gap-4">
              <Toggle checked={p.published} onChange={(v) => set('published', v)} label="Show on website" help="Off = hidden everywhere, but kept here." />
              <Toggle checked={p.available} onChange={(v) => set('available', v)} label="In stock" help="Off = shows “Sold out” (customers can still ask)." />
              <Toggle checked={p.featured} onChange={(v) => set('featured', v)} label="Featured on home page" help="Order featured products in Home page → Featured products." />
            </div>
          </Card>
          <Card title="Industries">
            <MultiChoice label="Used in" value={p.industries || []} onChange={(v) => set('industries', v)} options={industries} help="The product appears on these industry pages." />
          </Card>
          <Card title="More">
            <div className="flex flex-col gap-4">
              <Field label="Web address" help={isNew ? 'Made from the name. Can’t be changed after saving.' : 'Fixed — links from Google and WhatsApp use it.'}>
                <Input
                  value={p.handle}
                  disabled={!isNew}
                  onChange={(e) => {
                    setHandleTouched(true);
                    set('handle', slugify(e.target.value));
                  }}
                  className="font-mono text-[12.5px] disabled:bg-chip disabled:text-muted"
                />
              </Field>
              <Field label="Price (AED, internal)" help="Never shown on the website — prices are given on request.">
                <Input type="number" min={0} value={p.price || ''} onChange={(e) => set('price', Number(e.target.value) || 0)} />
              </Field>
              <StringList label="Search tags" value={p.tags || []} onChange={(v) => set('tags', v)} help="Extra words people may search for (e.g. “drill machine”)." />
              {!isNew && (
                <Button variant="danger" icon="trash" onClick={remove} disabled={busy} className="mt-2">
                  Delete product
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <SaveBar dirty={dirty || isNew} busy={busy} onSave={save} onDiscard={isNew ? undefined : () => setP(saved)} />
    </>
  );
}

const defaultIndustries = [
  { slug: 'construction', title: 'Construction' },
  { slug: 'manufacturing', title: 'Manufacturing' },
  { slug: 'oil-gas', title: 'Oil & Gas' },
  { slug: 'marine', title: 'Marine & Shipbuilding' },
  { slug: 'electrical', title: 'Electrical Contractors' },
  { slug: 'hvac', title: 'HVAC' },
  { slug: 'automotive', title: 'Automotive' },
  { slug: 'diy', title: 'DIY & Home Improvement' },
];

export const toLite = (r: ProductRow): ProductLite => ({
  handle: r.handle,
  name: r.name,
  brand: r.brand,
  brand_handle: r.brand_handle,
  collections: r.collections,
  images: r.images,
  published: r.published,
  available: r.available,
  featured: r.featured,
  featured_rank: r.featured_rank,
  industries: r.industries,
  updated_at: r.updated_at,
});

function Photos({ images, onChange, folder }: { images: Img[]; onChange: (v: Img[]) => void; folder: string }) {
  const [adding, setAdding] = useState('');
  return (
    <div className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.src + i} className={cx('group relative flex flex-col overflow-hidden rounded-lg bg-white ring-1', i === 0 ? 'ring-ink/50' : 'ring-line')}>
            <span className="grid aspect-square place-items-center bg-chip p-2">
              <img src={thumb(img.src, 400)} alt="" className="max-h-full max-w-full object-contain mix-blend-multiply" />
            </span>
            {i === 0 && <span className="absolute left-2 top-2 rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">Main</span>}
            <span className="flex items-center justify-between gap-1 border-t border-line-soft p-1">
              <span className="flex">
                <button type="button" aria-label="Move left" disabled={i === 0} onClick={() => onChange(move(images, i, i - 1))} className="grid size-8 place-items-center rounded text-muted hover:bg-chip hover:text-ink disabled:opacity-30">
                  <Icon name="arrow" size={14} className="rotate-180" />
                </button>
                <button type="button" aria-label="Move right" disabled={i === images.length - 1} onClick={() => onChange(move(images, i, i + 1))} className="grid size-8 place-items-center rounded text-muted hover:bg-chip hover:text-ink disabled:opacity-30">
                  <Icon name="arrow" size={14} />
                </button>
              </span>
              <button type="button" aria-label="Remove photo" onClick={() => onChange(images.filter((_, k) => k !== i))} className="grid size-8 place-items-center rounded text-muted hover:bg-accent-soft hover:text-accent">
                <Icon name="trash" size={14} />
              </button>
            </span>
          </li>
        ))}
      </ul>
      <ImageInput
        label={images.length ? 'Add another photo' : 'Add a photo'}
        folder={folder}
        value={adding}
        onChange={(src) => {
          if (src) onChange([...images, { src, alt: '' }]);
          setAdding('');
        }}
        help="Upload, drag a file here, or paste a link. Big photos are resized automatically."
      />
    </div>
  );
}

export function Loading() {
  return (
    <div className="grid min-h-[40vh] place-items-center text-muted">
      <Spinner className="size-6" />
    </div>
  );
}
