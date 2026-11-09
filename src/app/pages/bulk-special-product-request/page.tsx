import type { Metadata } from 'next';
import { BulkRequestForm } from '@/components/BulkRequestForm';
import { Icon } from '@/components/Icons';
import { Breadcrumbs } from '@/components/Section';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Bulk & Special Product Request',
  description: 'Send your product list or BOQ to Al Faiz Electric & Hardware for one quote — bulk quantities and special items sourced for businesses across the UAE and GCC.',
  alternates: { canonical: '/pages/bulk-special-product-request/' },
};

const points = [
  { icon: 'box', title: 'Bulk quantities', text: 'One quote for your full list or BOQ.' },
  { icon: 'search', title: 'Special items', text: 'Send a model number and we check if we can supply it.' },
  { icon: 'truck', title: 'UAE & export', text: `Delivery across the UAE and supply to ${site.exportCountries.length} more countries.` },
] as const;

export default function BulkRequestPage() {
  return (
    <div className="footer-gradient-light">
      <div className="wrap pb-20 pt-6">
        <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Bulk & Special Product Request' }]} />
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div className="flex flex-col gap-5">
            <span className="eyebrow text-accent">For businesses</span>
            <h1 className="text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.04] tracking-[-0.035em]">Bulk &amp; Special Product Request</h1>
            <p className="max-w-[460px] text-[16px] leading-relaxed text-ink-2">
              Need large quantities, or something you can’t find on the website? Tell us what you need and our sales team will come back with
              availability and prices.
            </p>
            <ul className="mt-2 flex flex-col gap-3">
              {points.map((p) => (
                <li key={p.title} className="flex items-start gap-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-accent ring-1 ring-line-soft">
                    <Icon name={p.icon} size={18} />
                  </span>
                  <span className="flex flex-col pt-0.5">
                    <span className="text-[15px] font-semibold">{p.title}</span>
                    <span className="text-[14px] text-muted">{p.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[14px] text-muted">
              Prefer to talk? Call{' '}
              <a href={site.phoneHref} className="font-semibold text-ink underline underline-offset-2">
                {site.phone}
              </a>
              .
            </p>
          </div>
          <BulkRequestForm />
        </div>
      </div>
    </div>
  );
}
