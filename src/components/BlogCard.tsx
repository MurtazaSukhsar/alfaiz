import Link from 'next/link';
import { formatDate, readingMinutes, type Post } from '@/lib/blog';

export function PostCard({ p }: { p: Post }) {
  return (
    <Link href={`/blog/${p.slug}/`} className="group flex h-full flex-col overflow-hidden rounded-lg bg-white ring-1 ring-line-soft transition hover:ring-ink/20">
      <span className="relative block aspect-[16/10] overflow-hidden bg-chip">
        {p.cover && <img src={p.cover} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]" />}
      </span>
      <span className="flex flex-1 flex-col gap-2.5 p-5">
        <PostMeta date={p.date} html={p.html} tags={p.tags} />
        <span className="text-[18px] font-bold leading-snug tracking-[-0.01em] text-ink">{p.title}</span>
        <span className="line-clamp-3 text-[14.5px] leading-relaxed text-ink-2">{p.excerpt}</span>
      </span>
    </Link>
  );
}

export function PostMeta({ date, html, tags }: { date: string; html: string; tags: string[] }) {
  return (
    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-medium text-muted">
      {tags[0] && <span className="rounded-md bg-accent-soft px-2 py-0.5 font-semibold text-accent">{tags[0]}</span>}
      <span>{formatDate(date)}</span>
      <span aria-hidden="true">·</span>
      <span>{readingMinutes(html)} min read</span>
    </span>
  );
}
