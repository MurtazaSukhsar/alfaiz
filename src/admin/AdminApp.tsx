'use client';
// Al Faiz admin panel: sign-in, navigation and page switching (hash routes: #/products, #/section/hero …).

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/Icons';
import { AuthError, auth, isAdmin } from './sb';
import { loadAll, useStore } from './store';
import { sectionByKey } from './sections';
import { Button, Field, Input, Spinner, Toasts, cx } from './ui';
import { Dashboard } from './views/Dashboard';
import { ProductEdit, ProductList } from './views/Products';
import { CollectionEdit, CollectionList } from './views/Collections';
import { SectionEdit } from './views/SectionEdit';
import { Featured } from './views/Featured';
import { PublishView, usePending } from './views/Publish';
import { BlogEdit, BlogList } from './views/Blog';

type Phase = 'start' | 'login' | 'denied' | 'loading' | 'ready' | 'error';

export function AdminApp() {
  const [phase, setPhase] = useState<Phase>('start');
  const [message, setMessage] = useState('');

  const enter = useCallback(async () => {
    if (!auth.signedIn()) return setPhase('login');
    setPhase('loading');
    try {
      if (!(await isAdmin())) return setPhase('denied');
      await loadAll();
      setPhase('ready');
    } catch (e) {
      if (e instanceof AuthError) return setPhase('login');
      setMessage((e as Error).message);
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    enter();
    const lost = () => setPhase('login');
    window.addEventListener('fz-auth-lost', lost);
    return () => window.removeEventListener('fz-auth-lost', lost);
  }, [enter]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      {phase === 'ready' ? (
        <Shell />
      ) : phase === 'login' ? (
        <Login onDone={enter} />
      ) : phase === 'denied' ? (
        <Center>
          <h1 className="text-[20px] font-bold">This account can’t edit the website</h1>
          <p className="text-[14px] text-muted">
            {auth.email()} is signed in, but it isn’t on the admin list. Ask your web developer to add it, or sign in with the admin email.
          </p>
          <Button variant="primary" onClick={() => auth.signOut().then(() => setPhase('login'))}>
            Sign in with another account
          </Button>
        </Center>
      ) : phase === 'error' ? (
        <Center>
          <h1 className="text-[20px] font-bold">Couldn’t load the admin</h1>
          <p className="text-[14px] text-muted">{message || 'Check your internet connection and try again.'}</p>
          <Button variant="primary" onClick={enter}>
            Try again
          </Button>
        </Center>
      ) : (
        <Center>
          <Spinner className="size-6 text-muted" />
        </Center>
      )}
      <Toasts />
    </div>
  );
}

function Center({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-4 text-center">{children}</div>
    </div>
  );
}

function Mark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-accent text-[18px] font-extrabold text-white">F</span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-bold text-ink">Al Faiz</span>
        <span className="text-[11.5px] font-medium text-muted">Website admin</span>
      </span>
    </span>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form
        className="flex w-full max-w-[400px] flex-col gap-5 rounded-2xl bg-white p-6 shadow-[0_30px_60px_-40px_rgba(0,0,0,.4)] ring-1 ring-line-soft sm:p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError('');
          try {
            await auth.signIn(email, password);
            onDone();
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
      >
        <Mark />
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold tracking-[-0.02em]">Sign in</h1>
          <p className="text-[14px] text-muted">Manage products, brands and the home page.</p>
        </div>
        <Field label="Email">
          <Input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password">
          <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {error && <p className="rounded-lg bg-accent-soft px-3 py-2 text-[13.5px] font-medium text-accent">{error}</p>}
        <Button type="submit" variant="primary" busy={busy} className="h-11">
          Sign in
        </Button>
        <a href="/" className="text-center text-[13px] font-medium text-muted hover:text-ink">
          ← Back to the website
        </a>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ routing */

function useRoute() {
  const read = () => {
    const h = typeof window === 'undefined' ? '' : location.hash.replace(/^#/, '') || '/';
    const [path, qs = ''] = h.split('?');
    return { path, query: new URLSearchParams(qs), hash: location.hash || '#/' };
  };
  const [route, setRoute] = useState(read);
  const last = useRef(route.hash);
  useEffect(() => {
    const f = () => {
      const w = window as unknown as { __fzDirty?: boolean };
      if (w.__fzDirty && location.hash !== last.current && !window.confirm('You have unsaved changes. Leave this page without saving?')) {
        history.replaceState(null, '', last.current);
        return;
      }
      w.__fzDirty = false;
      const r = read();
      last.current = r.hash;
      setRoute(r);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return route;
}

type NavItem = { href: string; label: string; icon: IconName; match: (p: string) => boolean };
const sec = (key: string, icon: IconName): NavItem => ({ href: `#/section/${key}`, label: sectionByKey(key)?.title ?? key, icon, match: (p) => p === `/section/${key}` });
const NAV: { group: string; items: NavItem[] }[] = [
  { group: '', items: [{ href: '#/', label: 'Dashboard', icon: 'home', match: (p) => p === '/' }] },
  {
    group: 'Catalogue',
    items: [
      { href: '#/products', label: 'Products', icon: 'box', match: (p) => p.startsWith('/products') },
      { href: '#/collections', label: 'Categories & brands', icon: 'tag', match: (p) => p.startsWith('/collections') },
    ],
  },
  {
    group: 'Home page',
    items: [
      sec('hero', 'quote'),
      sec('trust', 'shield'),
      sec('brands', 'check'),
      sec('categories', 'filter'),
      { href: '#/featured', label: 'Featured products', icon: 'clipboard', match: (p) => p === '/featured' },
      sec('brandEdit', 'tag'),
      sec('industries', 'construction'),
      sec('reviews', 'chat'),
      sec('faqs', 'help'),
    ],
  },
  {
    group: 'Other pages',
    items: [{ href: '#/blog', label: 'Blog', icon: 'quote', match: (p) => p.startsWith('/blog') }, sec('faqGroups', 'help'), sec('footer', 'menu')],
  },
  { group: 'Website', items: [sec('settings', 'phone'), { href: '#/publish', label: 'Publish', icon: 'globe', match: (p) => p === '/publish' }] },
];

function Shell() {
  const route = useRoute();
  const [menu, setMenu] = useState(false);
  const { admin } = useStore();
  const pending = usePending(admin.last_publish);
  const waiting = pending.products + pending.collections + pending.sections + pending.posts;
  useEffect(() => setMenu(false), [route.path]);

  const [, root, id] = route.path.split('/');
  const view =
    root === 'products' && id ? (
      <ProductEdit key={id} handle={decodeURIComponent(id)} />
    ) : root === 'products' ? (
      <ProductList key={route.hash} query={route.query} />
    ) : root === 'collections' && id ? (
      <CollectionEdit key={id} handle={decodeURIComponent(id)} query={route.query} />
    ) : root === 'collections' ? (
      <CollectionList query={route.query} />
    ) : root === 'section' && id ? (
      <SectionEdit key={id} sectionKey={id} />
    ) : root === 'blog' && id ? (
      <BlogEdit key={id} slug={decodeURIComponent(id)} />
    ) : root === 'blog' ? (
      <BlogList />
    ) : root === 'featured' ? (
      <Featured />
    ) : root === 'publish' ? (
      <PublishView />
    ) : (
      <Dashboard />
    );

  const nav = (
    <nav className="flex flex-col gap-5 p-3" aria-label="Admin">
      {NAV.map((g) => (
        <div key={g.group || 'main'} className="flex flex-col gap-0.5">
          {g.group && <span className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{g.group}</span>}
          {g.items.map((it) => {
            const on = it.match(route.path);
            return (
              <a key={it.href} href={it.href} aria-current={on ? 'page' : undefined} className={cx('flex h-9 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium transition', on ? 'bg-ink text-white' : 'text-ink-2 hover:bg-chip hover:text-ink')}>
                <Icon name={it.icon} size={16} />
                <span className="flex-1 truncate">{it.label}</span>
                {it.href === '#/publish' && waiting > 0 && <span className={cx('grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold', on ? 'bg-white text-ink' : 'bg-accent text-white')}>{waiting}</span>}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <div className="lg:grid lg:grid-cols-[256px_minmax(0,1fr)]">
      {/* desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line-soft bg-white lg:flex">
        <div className="flex h-16 items-center px-5">
          <Mark />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
        <Account />
      </aside>

      {/* mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line-soft bg-white px-4 lg:hidden">
        <Mark />
        <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" className="relative grid size-10 place-items-center rounded-lg hover:bg-chip">
          <Icon name="menu" size={20} />
          {waiting > 0 && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-accent" />}
        </button>
      </header>
      {menu && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMenu(false)}>
          <div className="flex h-full w-[86%] max-w-[320px] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-14 items-center justify-between border-b border-line-soft px-4">
              <Mark />
              <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="grid size-10 place-items-center rounded-lg hover:bg-chip">
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{nav}</div>
            <Account />
          </div>
        </div>
      )}

      <main className="min-w-0 px-4 pb-10 pt-5 sm:px-8 sm:pt-8">
        <div className="mx-auto max-w-[1180px]">{view}</div>
      </main>
    </div>
  );
}

function Account() {
  return (
    <div className="flex flex-col gap-2 border-t border-line-soft p-3">
      <a href="/" target="_blank" rel="noopener" className="flex h-9 items-center gap-2.5 rounded-lg px-3 text-[14px] font-medium text-ink-2 hover:bg-chip hover:text-ink">
        <Icon name="globe" size={16} />
        Open website
      </a>
      <div className="flex items-center justify-between gap-2 px-3">
        <span className="truncate text-[12.5px] text-muted">{auth.email()}</span>
        <button
          type="button"
          onClick={() => {
            if ((window as unknown as { __fzDirty?: boolean }).__fzDirty && !window.confirm('Sign out without saving your changes?')) return;
            auth.signOut().then(() => location.reload());
          }}
          className="shrink-0 text-[12.5px] font-semibold text-accent hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
