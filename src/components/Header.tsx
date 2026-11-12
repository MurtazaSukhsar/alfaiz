'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { site, waLink } from '@/data/site';
import type { Facet } from '@/lib/types';
import { AnnouncementBar } from './AnnouncementBar';
import { Icon } from './Icons';
import { Logo } from './Logo';
import { useQuote } from './QuoteProvider';
import { SearchBox } from './SearchBox';

const links = [
  { href: '/', label: 'Home' },
  { href: '/collections/all/', label: 'Products', menu: true },
  { href: '/pages/about-us/', label: 'About' },
  { href: '/pages/faq/', label: 'FAQ' },
  { href: '/pages/contact/', label: 'Contact' },
];

export function Header({ categories, brands, total }: { categories: Facet[]; brands: Facet[]; total: number }) {
  const pathname = usePathname() || '/';
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { count, ready } = useQuote();
  const [searchOpen, setSearchOpen] = useState(false); // phones/tablets only
  const [menuOpen, setMenuOpen] = useState(false); // phones/tablets only

  // close the mobile panels when the page changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // "/" jumps to search, like most modern stores
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || t.closest('input, textarea, select, [contenteditable]')) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const isCurrent = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href.includes('#')) return false;
    if (href === '/collections/all/') return pathname.startsWith('/collections') || pathname.startsWith('/products');
    return pathname.startsWith(href.replace(/\/$/, ''));
  };

  const nav = <MainNav isCurrent={isCurrent} categories={categories} brands={brands} total={total} />;

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-40 border-b border-[#E6E7E4] bg-white lg:bg-white/95 lg:backdrop-blur-md">
        <div className="wrap flex flex-wrap items-center gap-x-2 py-2.5 sm:gap-x-4 lg:h-[72px] lg:flex-nowrap lg:py-0">
          <Logo />

          <div className="ml-2 hidden lg:block xl:ml-4">{nav}</div>

          <div className={`${searchOpen ? 'block' : 'hidden'} order-last w-full pb-1 pt-2.5 lg:order-none lg:ml-auto lg:block lg:w-[220px] lg:p-0 xl:w-[260px]`}>
            <SearchBox query={query} setQuery={setQuery} inputRef={inputRef} />
          </div>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5 lg:ml-0">
            <button
              type="button"
              onClick={() => {
                setSearchOpen((v) => !v);
                setMenuOpen(false);
              }}
              aria-label={searchOpen ? 'Close search' : 'Search products'}
              aria-expanded={searchOpen}
              className="icon-btn lg:hidden"
            >
              <Icon name={searchOpen ? 'x' : 'search'} size={19} strokeWidth={1.9} />
            </button>
            <a href={site.phoneHref} aria-label={`Call ${site.phone}`} title={site.phone} className="icon-btn hidden sm:grid">
              <Icon name="phone" size={18} strokeWidth={1.8} />
            </a>
            <Link
              href="/cart/"
              aria-label={`Cart${ready && count ? `, ${count} item${count === 1 ? '' : 's'}` : ''}`}
              className="relative ml-1 inline-flex h-10 items-center gap-2 rounded-lg bg-ink px-3 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-accent hover:shadow-[0_12px_22px_-10px_rgba(21,23,26,.45)] active:scale-95 sm:ml-1.5 sm:pl-3.5 sm:pr-2"
            >
              <Icon name="cart" size={18} strokeWidth={1.9} />
              <span className="hidden sm:inline">Cart</span>
              <span
                className={`grid h-6 min-w-6 place-items-center rounded-md px-1.5 text-[11px] font-bold ${
                  ready && count > 0 ? 'bg-accent text-white' : 'bg-white/15 text-white'
                } max-sm:absolute max-sm:-right-1 max-sm:-top-1 max-sm:h-5 max-sm:min-w-5 max-sm:ring-2 max-sm:ring-white ${ready && count > 0 ? '' : 'max-sm:hidden'}`}
              >
                {ready ? count : 0}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen((v) => !v);
                setSearchOpen(false);
              }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="icon-btn lg:hidden"
            >
              <Icon name={menuOpen ? 'x' : 'menu'} size={20} strokeWidth={1.9} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav id="mobile-menu" aria-label="Main" className="anim-drop border-t border-line-soft lg:hidden">
            <ul className="wrap flex flex-col py-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={isCurrent(l.href) ? 'page' : undefined}
                    className={`flex h-12 items-center justify-between border-b border-line-soft text-[17px] ${
                      isCurrent(l.href) ? 'font-semibold text-ink' : 'font-medium text-ink-2'
                    }`}
                  >
                    {l.label === 'Products' ? 'All products' : l.label}
                    <Icon name="chev" size={16} strokeWidth={2} className="text-muted" />
                  </Link>
                </li>
              ))}
              <li className="flex gap-2 pb-2 pt-4">
                <a href={site.phoneHref} className="pill pill-outline flex-1 justify-center">
                  <Icon name="phone" size={16} />
                  Call
                </a>
                <a href={waLink()} target="_blank" rel="noopener" className="pill pill-dark flex-1 justify-center">
                  <Icon name="chat" size={16} />
                  WhatsApp
                </a>
              </li>
            </ul>
          </nav>
        )}
        <span aria-hidden="true" className="scroll-progress" />
      </header>
    </>
  );
}

function MainNav({
  isCurrent,
  categories,
  brands,
  total,
}: {
  isCurrent: (href: string) => boolean;
  categories: Facet[];
  brands: Facet[];
  total: number;
}) {
  return (
    <nav aria-label="Main" className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none] lg:overflow-visible">
      <ul className="relative inline-flex gap-0.5 rounded-lg bg-chip p-1">
        {links.map((l) => {
          const current = isCurrent(l.href);
          return (
            <li key={l.href} className="group relative shrink-0">
              {/* simple highlight: white on the current page, soft white on hover (no moving effects) */}
              <Link
                href={l.href}
                aria-current={current ? 'page' : undefined}
                className={`inline-flex h-9 items-center gap-1 rounded-md px-3.5 text-[14.5px] transition-colors duration-150 ${
                  current
                    ? 'bg-white font-semibold text-ink shadow-[0_1px_2px_rgba(21,23,26,.08)]'
                    : 'font-medium text-ink-2 hover:bg-white/70 hover:text-ink group-hover:bg-white/70 group-hover:text-ink'
                }`}
              >
                {l.label}
                {l.menu && (
                  <Icon name="chev-down" size={14} strokeWidth={2} className="hidden transition group-hover:rotate-180 lg:block" />
                )}
              </Link>
              {l.menu && <ProductsMenu categories={categories} brands={brands} total={total} />}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ProductsMenu({ categories, brands, total }: { categories: Facet[]; brands: Facet[]; total: number }) {
  return (
    <div className="invisible absolute -left-24 top-full z-50 hidden w-[720px] pt-[22px] opacity-0 transition-opacity duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100 lg:block">
      <div className="grid grid-cols-[2fr_1fr] gap-6 rounded-lg border border-line bg-white p-5 shadow-[0_24px_48px_rgba(21,23,26,.14)]">
        <div>
          <p className="eyebrow mb-3 text-muted">Categories</p>
          <ul className="grid grid-cols-2 gap-x-2">
            {categories.map((c) => (
              <li key={c.handle}>
                <Link href={`/collections/${c.handle}/`} className="-mx-2.5 flex min-h-9 items-center justify-between gap-3 rounded-md px-2.5 text-[14px] text-ink-2 transition-colors duration-150 hover:bg-chip hover:text-ink">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3 text-muted">Brands</p>
          <ul className="grid gap-x-6">
            {brands.slice(0, 12).map((c) => (
              <li key={c.handle}>
                <Link href={`/collections/${c.handle}/`} className="-mx-2.5 flex min-h-9 items-center justify-between gap-3 rounded-md px-2.5 text-[14px] text-ink-2 transition-colors duration-150 hover:bg-chip hover:text-ink">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/collections/all/" className="nudge-host mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-accent">
            Explore all products
            <Icon name="arrow" size={15} strokeWidth={2.2} className="nudge" />
          </Link>
        </div>
      </div>
    </div>
  );
}
