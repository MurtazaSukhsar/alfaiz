// Blog posts written in the admin panel (Supabase → posts), downloaded to data/posts.json before every dev/build.
import raw from '../../data/posts.json';

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  html: string;
  author: string;
  tags: string[];
  date: string;
  updatedAt: string;
};

export const posts: Post[] = (raw as Post[]).filter((p) => p && p.slug && p.title).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
export const getPost = (slug: string) => posts.find((p) => p.slug === slug);

export const readingMinutes = (html: string) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));
export const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dubai' });
