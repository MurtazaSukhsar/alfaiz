'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/Icons';
import { db, slugify } from '../sb';
import { patchPost, useStore, type PostRow } from '../store';
import { RichText } from '../RichText';
import { Badge, Button, Card, Field, ImageInput, Input, PageHeader, SaveBar, StringList, Textarea, Thumb, Toggle, timeAgo, toast, useLeaveGuard } from '../ui';
import { fail, go, SITE } from '../nav';
import { Loading } from './Products';

const fmt = (iso: string) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

export function BlogList() {
  const { posts } = useStore();
  return (
    <>
      <PageHeader
        title="Blog"
        desc="Articles shown at /blog/ (linked in the footer). Newest first."
        actions={
          <Button variant="primary" icon="plus" onClick={() => go('#/blog/new')}>
            Write an article
          </Button>
        }
      />
      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-line-soft">
        <ul className="divide-y divide-line-soft">
          {posts.map((p) => (
            <li key={p.slug}>
              <a href={`#/blog/${encodeURIComponent(p.slug)}`} className="flex items-center gap-3 px-3 py-3 transition hover:bg-chip/60 sm:px-4">
                <Thumb src={p.cover} size={64} />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink">{p.title}</span>
                  <span className="flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted">
                    {fmt(p.published_at)}
                    {p.published ? <Badge tone="ok">On website</Badge> : <Badge tone="warn">Draft</Badge>}
                  </span>
                </span>
                <Icon name="chev" size={16} className="shrink-0 text-muted" />
              </a>
            </li>
          ))}
          {!posts.length && <li className="px-4 py-12 text-center text-[14px] text-muted">No articles yet.</li>}
        </ul>
      </div>
    </>
  );
}

const blank = (): PostRow => ({
  slug: '',
  title: '',
  excerpt: '',
  cover: '',
  html: '',
  author: 'Al Faiz team',
  tags: [],
  published: false,
  published_at: new Date().toISOString(),
  updated_at: '',
});

export function BlogEdit({ slug }: { slug: string }) {
  const isNew = slug === 'new';
  const [saved, setSaved] = useState<PostRow | null>(null);
  const [p, setP] = useState<PostRow>(blank);
  const [busy, setBusy] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (isNew) {
      const b = blank();
      setSaved(b);
      setP(b);
      return;
    }
    db<PostRow[]>(`posts?slug=eq.${encodeURIComponent(slug)}&select=*`)
      .then((rows) => {
        if (!rows.length) {
          toast('Article not found', 'error');
          go('#/blog');
          return;
        }
        const r = { ...blank(), ...rows[0] };
        setSaved(r);
        setP(r);
      })
      .catch(fail);
  }, [slug, isNew]);

  const dirty = !!saved && JSON.stringify(saved) !== JSON.stringify(p);
  useLeaveGuard(dirty);
  if (!saved) return <Loading />;

  const set = <K extends keyof PostRow>(k: K, v: PostRow[K]) => setP((x) => ({ ...x, [k]: v }));

  const save = async () => {
    const title = p.title.trim();
    if (!title) return toast('Give the article a title.', 'error');
    if (!p.html.replace(/<[^>]+>/g, '').trim()) return toast('Write the article text first.', 'error');
    const s = isNew ? slugify(p.slug || title) : p.slug;
    const body = {
      slug: s,
      title,
      excerpt: p.excerpt.trim(),
      cover: p.cover,
      html: p.html,
      author: p.author.trim() || 'Al Faiz team',
      tags: p.tags.map((t) => t.trim()).filter(Boolean),
      published: p.published,
      published_at: p.published_at || new Date().toISOString(),
    };
    setBusy(true);
    try {
      const rows = isNew ? await db<PostRow[]>('posts', { method: 'POST', body }) : await db<PostRow[]>(`posts?slug=eq.${encodeURIComponent(slug)}`, { method: 'PATCH', body });
      const r = { ...blank(), ...rows[0] };
      setSaved(r);
      setP(r);
      patchPost(r);
      toast(r.published ? 'Saved — press Publish to put it live' : 'Draft saved');
      if (isNew) go(`#/blog/${encodeURIComponent(r.slug)}`, true);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete “${p.title}” for good?\n\nTip: switch off “Show on website” to keep it as a draft instead.`)) return;
    try {
      await db(`posts?slug=eq.${encodeURIComponent(slug)}`, { method: 'DELETE' });
      patchPost(null, slug);
      toast('Article deleted');
      go('#/blog', true);
    } catch (e) {
      fail(e);
    }
  };

  const day = (p.published_at || '').slice(0, 10);

  return (
    <>
      <PageHeader
        back={{ href: '#/blog', label: 'All articles' }}
        title={isNew ? 'Write an article' : p.title || 'Article'}
        desc={!isNew && saved.updated_at ? `Last saved ${timeAgo(saved.updated_at)}` : undefined}
        actions={
          !isNew &&
          saved.published && (
            <a href={`${SITE}/blog/${saved.slug}/`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold text-ink-2 hover:bg-chip">
              View on site
              <Icon name="arrow" size={14} className="-rotate-45" />
            </a>
          )
        }
      />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <div className="flex flex-col gap-4">
              <Field label="Title">
                <Input
                  value={p.title}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (isNew && !slugTouched) set('slug', slugify(e.target.value));
                  }}
                  placeholder="e.g. How to choose the right drill bit for concrete"
                  className="h-12 text-[17px] font-semibold"
                />
              </Field>
              <Field label="Short summary" help="Shown on the blog page and on Google (1–2 sentences).">
                <Textarea value={p.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
              </Field>
              <RichText
                label="Article"
                value={p.html}
                onChange={(v) => set('html', v)}
                imageFolder={`blog/${slugify(p.slug || p.title || 'post')}`}
                help="Use “H” for section headings and “Photo” to add pictures. Pasted text arrives without formatting."
              />
            </div>
          </Card>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="Status">
            <div className="flex flex-col gap-4">
              <Toggle checked={p.published} onChange={(v) => set('published', v)} label="Show on website" help="Off = draft, only visible here." />
              <Field label="Date shown">
                <Input type="date" value={day} onChange={(e) => e.target.value && set('published_at', new Date(`${e.target.value}T08:00:00Z`).toISOString())} />
              </Field>
            </div>
          </Card>
          <Card title="Cover photo">
            <ImageInput label="Photo" folder="blog" value={p.cover} onChange={(v) => set('cover', v)} contain={false} help="Wide photo (16:9), at least 1200 px wide." />
          </Card>
          <Card title="More">
            <div className="flex flex-col gap-4">
              <StringList label="Topics" value={p.tags} onChange={(v) => set('tags', v)} help="The first one is shown as a label, e.g. “Power tools”." />
              <Field label="Written by">
                <Input value={p.author} onChange={(e) => set('author', e.target.value)} />
              </Field>
              <Field label="Web address" help={isNew ? 'Made from the title. Can’t be changed after saving.' : 'Fixed after saving.'}>
                <Input
                  value={p.slug}
                  disabled={!isNew}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', slugify(e.target.value));
                  }}
                  className="font-mono text-[12.5px] disabled:bg-chip disabled:text-muted"
                />
              </Field>
              {!isNew && (
                <Button variant="danger" icon="trash" onClick={remove}>
                  Delete article
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
