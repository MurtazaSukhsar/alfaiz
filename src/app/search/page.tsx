import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/components/SearchResults';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="wrap py-24 text-muted">Loading search…</div>}>
      <SearchResults />
    </Suspense>
  );
}
