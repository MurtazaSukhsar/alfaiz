import type { Metadata } from 'next';
import { QuoteList } from '@/components/QuoteList';
import { Breadcrumbs } from '@/components/Section';

export const metadata: Metadata = {
  title: 'Cart',
  alternates: { canonical: '/cart/' },
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-3 pb-10 pt-6">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Cart' }]} />
          <h1 className="text-[clamp(30px,4vw,46px)] font-semibold leading-[1.05] tracking-[-0.03em]">Your cart</h1>
          <p className="max-w-[640px] text-base leading-relaxed text-muted">
            Review your items and quantities, then check out on WhatsApp or email. We confirm price, stock and delivery before you pay.
          </p>
        </div>
      </section>
      <section className="py-10">
        <div className="wrap">
          <QuoteList />
        </div>
      </section>
    </>
  );
}
