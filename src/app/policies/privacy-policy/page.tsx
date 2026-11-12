import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Section';
import { site } from '@/data/site';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${site.name} handles your information on this website.`,
  alternates: { canonical: '/policies/privacy-policy/' },
};

const UPDATED = '9 November 2026';

export default function PrivacyPage() {
  return (
    <div className="footer-gradient-light">
      <div className="wrap max-w-[860px] pb-20 pt-6">
        <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Privacy policy' }]} />
        <span className="eyebrow mt-8 block text-accent">Legal</span>
        <h1 className="mt-2 text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.04] tracking-[-0.035em]">Privacy Policy</h1>
        <p className="mt-3 text-sm text-muted">Last updated: {UPDATED}</p>

        <div className="prose-af mt-8 rounded-[10px] bg-white p-6 ring-1 ring-line-soft sm:p-10">
          <p>
            This website is operated by <strong>{site.legal}</strong> (“Al Faiz”, “we”, “us”), {site.country} — our full address is on the Contact page. This policy
            explains what information is involved when you use the website and how we use it.
          </p>

          <h2>Information you send us</h2>
          <p>
            When you check out your cart, send a bulk or special product request, or contact us by WhatsApp, phone or email, you share details such as
            your name, company, phone number, email, delivery location and the products you need. That message goes directly to our sales team through
            WhatsApp or your email app — this website does not collect or store it on its own servers.
          </p>
          <p>We use this information only to answer your enquiry, prepare quotes, process and deliver your order, and keep records of our sales.</p>

          <h2>Your cart</h2>
          <p>
            Your cart is saved in your own browser (local storage) so it is still there when you come back. It never leaves your device unless you send it
            to us at checkout. You can empty it at any time from the cart page.
          </p>

          <h2>Website assistant</h2>
          <p>
            The chat assistant runs entirely in your browser. What you type is not sent to us or to any AI service. If you choose to continue on
            WhatsApp, the message you send there is shared with our team as above.
          </p>

          <h2>No accounts or online payments</h2>
          <p>
            You don’t need an account to use this website, and we don’t take card payments online. Payments are arranged with our sales team after your
            order is confirmed.
          </p>

          <h2>Third-party services</h2>
          <p>
            Product images are served from Shopify’s image network, and the map on our contact page is provided by Google Maps. When you message us, the
            service you use (WhatsApp or your email provider) handles that message under its own privacy policy.
          </p>

          <h2>Sharing your information</h2>
          <p>
            We don’t sell your personal information. We share it only when needed to fulfil your order — for example with a delivery partner — or when
            required by law.
          </p>

          <h2>Your choices</h2>
          <p>
            You can ask us to access, correct or delete the information you have sent us by emailing{' '}
            <a href={`mailto:${site.email}`}>{site.email}</a> or calling <a href={site.phoneHref}>{site.phone}</a>.
          </p>

          <h2>Changes to this policy</h2>
          <p>
            We may update this policy from time to time. The date at the top shows when it was last changed. For questions, see our{' '}
            <Link href="/pages/contact/">contact page</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
