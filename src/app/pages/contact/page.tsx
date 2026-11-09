import type { Metadata } from 'next';
import { Icon, type IconName } from '@/components/Icons';
import { Breadcrumbs } from '@/components/Section';
import { site, waLink } from '@/data/site';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: `Visit Al Faiz Electric & Hardware on BMW Road, Industrial Area 1, Sharjah, or call / WhatsApp ${site.phone} for a quote.`,
  alternates: { canonical: '/pages/contact/' },
};

export default function ContactPage() {
  const cards: { icon: IconName; label: string; lines: { text: string; href?: string }[] }[] = [
    { icon: 'pin', label: 'Showroom', lines: [{ text: site.street }, { text: `${site.city}, ${site.country}` }] },
    { icon: 'phone', label: 'Phone & WhatsApp', lines: [{ text: site.phone, href: site.phoneHref }] },
    {
      icon: 'mail',
      label: 'Email',
      lines: [
        { text: site.email, href: `mailto:${site.email}` },
        { text: site.email2, href: `mailto:${site.email2}` },
      ],
    },
    { icon: 'clock', label: 'Opening hours', lines: [{ text: site.hours }] },
  ];

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="wrap flex flex-col gap-3 pb-10 pt-6">
          <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Contact' }]} />
          <h1 className="text-[clamp(32px,4.4vw,52px)] font-extrabold leading-[1.04] tracking-[-0.02em]">Visit or contact us</h1>
          <p className="max-w-[640px] text-base leading-relaxed text-muted">
            Send a product list, ask about a model or come to the showroom in Sharjah. WhatsApp is the fastest way to get a quote.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="wrap grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            {cards.map((c) => (
              <div key={c.label} className="card flex gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-[10px] bg-accent-soft text-accent">
                  <Icon name={c.icon} size={20} />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="eyebrow text-muted">{c.label}</span>
                  {c.lines.map((l) =>
                    l.href ? (
                      <a key={l.text} href={l.href} className="text-base font-medium hover:text-accent">
                        {l.text}
                      </a>
                    ) : (
                      <span key={l.text} className="text-base">
                        {l.text}
                      </span>
                    ),
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-3 pt-1">
              <a href={waLink()} target="_blank" rel="noopener" className="btn btn-primary">
                WhatsApp us
                <span className="btn-chev">
                  <Icon name="chev" size={16} strokeWidth={2.2} />
                </span>
              </a>
              <a href={site.mapsUrl} target="_blank" rel="noopener" className="btn btn-light">
                Get directions
                <span className="btn-chev">
                  <Icon name="chev" size={16} strokeWidth={2.2} />
                </span>
              </a>
            </div>
          </div>
          <div className="card min-h-[420px] overflow-hidden">
            <iframe
              title="Map showing Al Faiz Electric & Hardware in Industrial Area 1, Sharjah"
              src={site.mapEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="size-full min-h-[420px] border-0"
            />
          </div>
        </div>
      </section>
    </>
  );
}
