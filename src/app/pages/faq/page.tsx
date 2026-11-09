import type { Metadata } from 'next';
import { FaqBrowser } from '@/components/FaqBrowser';
import { Breadcrumbs, JsonLd } from '@/components/Section';
import { faqGroups, site } from '@/data/site';

export const metadata: Metadata = {
  title: 'FAQ — Ordering, Delivery & Payment',
  description: `Answers about ordering through the cart, delivery across the UAE, payment methods, warranty and our showroom in ${site.city}.`,
  alternates: { canonical: '/pages/faq/' },
};

export default function FaqPage() {
  const count = faqGroups.reduce((n, g) => n + g.items.length, 0);
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqGroups.flatMap((g) =>
            g.items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
          ),
        }}
      />

      <div className="footer-gradient-light">
        <div className="wrap pb-16 pt-6 sm:pb-20">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'FAQ' }]} />
          <div className="mb-8 mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-3 sm:mb-10">
            <div className="flex flex-col gap-2">
              <span className="eyebrow text-accent">Help centre</span>
              <h1 className="text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.04] tracking-[-0.035em]">Questions? Answered.</h1>
            </div>
            <p className="max-w-[360px] text-[15px] leading-relaxed text-ink-2">
              {count} quick answers on ordering, delivery, payment and products — pick a topic below.
            </p>
          </div>
          <FaqBrowser groups={faqGroups} />
        </div>
      </div>
    </>
  );
}
