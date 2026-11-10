import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import '@fontsource-variable/outfit';
import './globals.css';
import { ChatWidget } from '@/components/ChatWidget';
import { FxRuntime } from '@/components/fx/FxRuntime';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Loader } from '@/components/Loader';
import { QuoteProvider } from '@/components/QuoteProvider';
import { SiteChrome } from '@/components/SiteChrome';
import { menuCollections, products } from '@/lib/catalog';
import { site } from '@/data/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'Al Faiz Electric & Hardware | Tools & Industrial Supplies in the UAE',
    template: '%s | Al Faiz Hardware',
  },
  description:
    'Power tools, air compressors, non-sparking tools, fasteners and safety gear from DeWALT, Makita, Bosch, Milwaukee and more. Supplying businesses across the UAE and GCC from Sharjah since 2019.',
  openGraph: {
    type: 'website',
    siteName: site.short,
    locale: 'en_AE',
    images: [{ url: '/images/hero.jpg', width: 1536, height: 1024, alt: 'Power tools from Al Faiz Hardware' }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#15171A' };

export default function RootLayout({ children }: { children: ReactNode }) {
  const menu = menuCollections();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var d=document.documentElement;d.classList.add('has-js');if(sessionStorage.getItem('fz-splash'))d.classList.add('no-splash');else{sessionStorage.setItem('fz-splash','1');setTimeout(function(){d.classList.add('no-splash')},4500)}}catch(e){}",
          }}
        />
        <SiteChrome>
          <Loader />
          <a
            href="#main"
            className="sr-only z-[60] rounded-md bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
        </SiteChrome>
        <QuoteProvider>
          <SiteChrome>
            <Header categories={menu.categories} brands={menu.brands} total={products.length} />
          </SiteChrome>
          <main id="main">{children}</main>
          <SiteChrome>
            <Footer />
            <ChatWidget />
            <FxRuntime />
          </SiteChrome>
        </QuoteProvider>
      </body>
    </html>
  );
}
