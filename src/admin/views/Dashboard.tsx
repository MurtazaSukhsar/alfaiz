'use client';

import { Icon, type IconName } from '@/components/Icons';
import { sections } from '../sections';
import { firstImage, reloadEverything, useStore } from '../store';
import { Button, Card, PageHeader, Thumb, timeAgo, toast } from '../ui';
import { useState } from 'react';
import { fail } from '../nav';
import { usePending, usePublish } from './Publish';
import { auth } from '../sb';

export function Dashboard() {
  const { products, collections, contentUpdated } = useStore();
  const { admin, busy, publish } = usePublish();
  const pending = usePending(admin.last_publish);
  const total = pending.products + pending.collections + pending.sections;
  const recent = [...products].sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')).slice(0, 6);
  const stats: { label: string; value: number; href: string; icon: IconName }[] = [
    { label: 'Products on website', value: products.filter((p) => p.published).length, href: '#/products?s=visible', icon: 'box' },
    { label: 'Hidden products', value: products.filter((p) => !p.published).length, href: '#/products?s=hidden', icon: 'x' },
    { label: 'Brands', value: collections.filter((c) => c.kind === 'brand').length, href: '#/collections?k=brand', icon: 'tag' },
    { label: 'Categories', value: collections.filter((c) => c.kind === 'category').length, href: '#/collections?k=category', icon: 'filter' },
  ];
  const name = auth.email().split('@')[0];
  const [reloading, setReloading] = useState(false);

  return (
    <>
      <PageHeader
        title={`Welcome${name ? `, ${name}` : ''}`}
        desc="Edit products, brands, categories and every section of the home page. Save as you go, then press Publish to update the website."
        actions={
          <Button
            size="sm"
            variant="ghost"
            busy={reloading}
            title="Lists are kept in this browser and only changes are downloaded. Use this if something looks out of date."
            onClick={async () => {
              setReloading(true);
              try {
                await reloadEverything();
                toast('Everything reloaded');
              } catch (e) {
                fail(e);
              } finally {
                setReloading(false);
              }
            }}
          >
            Reload all data
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl bg-ink p-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-[16px] font-semibold">{pending.never ? 'Save your changes, then publish to update the website' : total ? `${total} saved change${total > 1 ? 's' : ''} not on the website yet` : 'The website is up to date'}</span>
          <span className="text-[13px] text-white/65">Last published {admin.last_publish ? timeAgo(admin.last_publish) : '— never from the admin'}</span>
        </div>
        <Button variant="outline" icon="arrow" busy={busy} disabled={!total && !pending.never} onClick={publish} className="bg-white">
          Publish to website
        </Button>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <a key={s.label} href={s.href} className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-line-soft transition hover:ring-ink/30">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon name={s.icon} size={18} />
            </span>
            <span className="flex flex-col">
              <span className="text-[22px] font-bold leading-none tracking-[-0.02em]">{s.value}</span>
              <span className="mt-1 text-[12.5px] text-muted">{s.label}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card title="Home page sections" desc="Click a section to change it.">
          <ul className="grid gap-2 sm:grid-cols-2">
            {[...sections.filter((s) => s.key !== 'settings'), { key: 'featured', title: 'Featured products', desc: 'Pick and order the featured products.' }].map((s) => (
              <li key={s.key}>
                <a href={s.key === 'featured' ? '#/featured' : `#/section/${s.key}`} className="flex h-full flex-col gap-0.5 rounded-lg p-3 ring-1 ring-line-soft transition hover:bg-chip/60 hover:ring-ink/20">
                  <span className="flex items-center justify-between gap-2 text-[14px] font-semibold text-ink">
                    {s.title}
                    {contentUpdated[s.key as keyof typeof contentUpdated] && <span className="size-2 rounded-full bg-[#1e9b4a]" title="Edited" />}
                  </span>
                  <span className="line-clamp-2 text-[12.5px] leading-snug text-muted">{s.desc}</span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
        <Card
          title="Recently edited products"
          actions={
            <Button size="sm" icon="plus" onClick={() => (location.hash = '#/products/new')}>
              Add product
            </Button>
          }
        >
          <ul className="flex flex-col divide-y divide-line-soft">
            {recent.map((p) => (
              <li key={p.handle}>
                <a href={`#/products/${encodeURIComponent(p.handle)}`} className="flex items-center gap-3 py-2 hover:underline">
                  <Thumb src={firstImage(p)} size={40} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                    <span className="text-[12px] text-muted">{timeAgo(p.updated_at)}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
