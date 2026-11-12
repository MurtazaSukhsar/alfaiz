import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs, JsonLd } from '@/components/Section';
import { Icon } from '@/components/Icons';
import { posts } from '@/lib/blog';
import { PostCard, PostMeta } from '@/components/BlogCard';
import { site, waLink } from '@/data/site';

export const metadata: Metadata = {
  title: 'Blog — Tool Guides & Advice',
  description: 'Buying guides and practical advice on power tools, air compressors, non-sparking tools, welding and site equipment from Al Faiz Hardware in the UAE.',
  alternates: { canonical: '/blog/' },
};

export default function BlogPage() {
  const [first, ...rest] = posts;
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: `${site.short} Blog`,
          url: `${site.url}/blog/`,
          blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: `${site.url}/blog/${p.slug}/`, datePublished: p.date })),
        }}
      />
      <div className="footer-gradient-light">
        <div className="wrap pb-16 pt-6 sm:pb-20">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Blog' }]} />
          <div className="mb-8 mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-3 sm:mb-10">
            <div className="flex flex-col gap-2">
              <span className="eyebrow text-accent">Blog</span>
              <h1 className="text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.04] tracking-[-0.035em]">Tool guides &amp; advice</h1>
            </div>
            <p className="max-w-[380px] text-[15px] leading-relaxed text-ink-2">Practical buying guides from our team — so you order the right tool the first time.</p>
          </div>

          {!first ? (
            <div className="rounded-lg bg-white p-10 text-center ring-1 ring-line-soft">
              <p className="text-[17px] font-semibold">New articles are on the way.</p>
              <p className="mt-2 text-[15px] text-muted">Meanwhile, ask us anything about tools on WhatsApp.</p>
              <a href={waLink()} target="_blank" rel="noopener" className="pill pill-lg mt-5 inline-flex bg-ink text-white hover:bg-accent">
                Talk to an expert
              </a>
            </div>
          ) : (
            <>
              <Link href={`/blog/${first.slug}/`} className="group grid overflow-hidden rounded-lg bg-white ring-1 ring-line-soft transition hover:ring-ink/20 lg:grid-cols-[1.15fr_1fr]">
                <span className="relative block aspect-[16/9] overflow-hidden bg-chip lg:aspect-auto lg:min-h-[380px]">
                  {first.cover && <img src={first.cover} alt="" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]" />}
                </span>
                <span className="flex flex-col justify-center gap-3 p-6 sm:p-10">
                  <PostMeta date={first.date} html={first.html} tags={first.tags} />
                  <span className="text-[clamp(24px,2.6vw,34px)] font-bold leading-[1.12] tracking-[-0.025em] text-ink">{first.title}</span>
                  <span className="text-[15.5px] leading-relaxed text-ink-2">{first.excerpt}</span>
                  <span className="nudge-host mt-2 inline-flex items-center gap-2 text-sm font-bold text-accent">
                    Read article
                    <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
                  </span>
                </span>
              </Link>

              {rest.length > 0 && (
                <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((p) => (
                    <li key={p.slug}>
                      <PostCard p={p} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
