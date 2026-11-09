import { BrandMarquee, Categories, Edit, Faq, Hero, Testimonials, TrustStrip } from '@/components/home/Sections';
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
        <h1 className="sr-only">Al Faiz Electric &amp; Hardware — tools that work as hard as you do. Tools and industrial supplies in Sharjah, UAE</h1>
        <Hero />
        <BrandMarquee />
        <Categories />
        <Edit />
        <Testimonials />
        <TrustStrip />
        <Faq />
      </div>
    </>
  );
}
