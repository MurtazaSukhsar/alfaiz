import { BrandMarquee, Categories, Edit, Faq, Featured, Hero, Industries, Testimonials, TrustStrip } from '@/components/home/Sections';
import { JsonLd } from '@/components/Section';
import { site } from '@/data/site';

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'HardwareStore',
          name: site.name,
          url: site.url,
          image: `${site.url}/images/hero.jpg`,
          telephone: site.phone,
          email: site.email,
          foundingDate: String(site.since),
          address: {
            '@type': 'PostalAddress',
            streetAddress: site.street,
            addressLocality: site.city,
            addressCountry: 'AE',
          },
          areaServed: ['AE', 'OM', 'SA', 'IQ', 'MV', 'CD', 'KE', 'MU'],
          sameAs: [site.instagram],
        }}
      />
      <div className="home-canvas">
        <h1 className="sr-only">Al Faiz Electric &amp; Hardware — tools that work as hard as you do. Tools and industrial supplies across the UAE</h1>
        <Hero />
        <TrustStrip />
        {/* below the fold: rendered lazily by the browser (see .cv-auto) */}
        {[BrandMarquee, Categories, Featured, Edit, Industries, Testimonials, Faq].map((S, i) => (
          <div key={i} className="cv-auto">
            <S />
          </div>
        ))}
      </div>
    </>
  );
}
