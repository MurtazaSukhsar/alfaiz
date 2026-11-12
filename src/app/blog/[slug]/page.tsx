import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs, JsonLd } from '@/components/Section';
import { Icon } from '@/components/Icons';
import { PostCard, PostMeta } from '@/components/BlogCard';
import { getPost, posts } from '@/lib/blog';
import { site, waLink } from '@/data/site';

export const dynamicParams = false;

export function generateStaticParams() {
  // a static export needs at least one page; with no posts this one renders the 404
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: 'coming-soon' }];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  if (!p) return { title: 'Blog' };
  return {
    title: p.title,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}/` },
    openGraph: { type: 'article', title: p.title, description: p.excerpt, publishedTime: p.date, images: p.cover ? [{ url: p.cover }] : undefined },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  const more = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const abs = (u: string) => (u.startsWith('/') ? `${site.url}${u}` : u);

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.excerpt,
          datePublished: p.date,
          dateModified: p.updatedAt || p.date,
          image: p.cover ? [abs(p.cover)] : undefined,
          author: { '@type': 'Organization', name: site.name },
          publisher: { '@type': 'Organization', name: site.name, url: site.url },
          mainEntityOfPage: `${site.url}/blog/${p.slug}/`,
        }}
      />
      <article>
        <header className="footer-gradient-light">
          <div className="wrap pb-8 pt-6 sm:pb-10">
            <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/blog/', label: 'Blog' }, { label: p.title }]} />
            <div className="mx-auto mt-8 flex max-w-[820px] flex-col gap-4 sm:mt-10">
              <PostMeta date={p.date} html={p.html} tags={p.tags} />
              <h1 className="text-[clamp(30px,4.2vw,50px)] font-bold leading-[1.06] tracking-[-0.035em]">{p.title}</h1>
              {p.excerpt && <p className="text-[17px] leading-relaxed text-ink-2 sm:text-[19px]">{p.excerpt}</p>}
              <span className="text-[13.5px] text-muted">By {p.author}</span>
            </div>
          </div>
        </header>

        {p.cover && (
          <div className="wrap">
            <div className="mx-auto max-w-[1040px] overflow-hidden rounded-lg bg-chip">
              <img src={p.cover} alt="" className="aspect-[16/8] w-full object-cover" />
            </div>
          </div>
        )}

        <div className="wrap py-10 sm:py-14">
          <div className="mx-auto grid max-w-[1040px] gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="prose-af prose-blog min-w-0" dangerouslySetInnerHTML={{ __html: p.html }} />
            <aside className="flex flex-col gap-3 self-start rounded-lg border border-line-soft bg-[#F8F8F6] p-6 lg:sticky lg:top-[140px]">
              <span className="text-base font-semibold">Need the right tool for the job?</span>
              <span className="text-sm leading-relaxed text-muted">Tell us what you’re working on — we’ll suggest the right model and send a quote.</span>
              <a
                href={waLink(`Hello Al Faiz, I read “${p.title}” and need advice:`)}
                target="_blank"
                rel="noopener"
                className="nudge-host inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-accent"
              >
                Talk to an expert
                <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
              </a>
              <a href={site.phoneHref} className="text-sm font-semibold text-ink-2 hover:text-accent">
                Or call {site.phone}
              </a>
            </aside>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-line-soft bg-white py-14">
          <div className="wrap">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-[clamp(22px,2.4vw,30px)] font-bold tracking-[-0.02em]">More from the blog</h2>
              <Link href="/blog/" className="nudge-host inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent">
                All articles
                <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
              </Link>
            </div>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((x) => (
                <li key={x.slug}>
                  <PostCard p={x} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
