'use client';

import { useState } from 'react';
import { Icon } from '@/components/Icons';
import { saveAdmin, useStore } from '../store';
import { Button, Card, Field, Input, PageHeader, timeAgo, toast } from '../ui';
import { fail } from '../nav';

const HOOK = /^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/[A-Za-z0-9_/-]+$/;

/** How many things were saved since the last publish (nothing is counted before the first publish). */
export function usePending(lastPublish?: string) {
  const { products, collections, contentUpdated } = useStore();
  if (!lastPublish) return { products: 0, collections: 0, sections: 0, never: true };
  const since = new Date(lastPublish).getTime();
  const newer = (t?: string) => !!t && new Date(t).getTime() > since;
  return {
    products: products.filter((p) => newer(p.updated_at)).length,
    collections: collections.filter((c) => newer(c.updated_at)).length,
    sections: Object.values(contentUpdated).filter((t) => newer(t)).length,
    never: false,
  };
}

export function usePublish() {
  const { admin } = useStore();
  const [busy, setBusy] = useState(false);
  const publish = async () => {
    const hook = admin.vercel_deploy_hook;
    if (!hook) {
      toast('Connect Vercel first (Publish page).', 'error');
      location.hash = '#/publish';
      return;
    }
    setBusy(true);
    try {
      // the hook answers without CORS headers, so the browser can't read the reply — sending is enough
      await fetch(hook, { method: 'POST', mode: 'no-cors' });
      await saveAdmin('last_publish', new Date().toISOString());
      toast('Publishing… the website updates in about 1–2 minutes');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  return { admin, busy, publish };
}

export function PublishView() {
  const { admin: settings, busy, publish } = usePublish();
  const pending = usePending(settings.last_publish);
  const [hook, setHook] = useState(settings.vercel_deploy_hook || '');
  const [savingHook, setSavingHook] = useState(false);

  const total = pending.products + pending.collections + pending.sections;
  const saveHook = async () => {
    const v = hook.trim();
    if (v && !HOOK.test(v)) return toast('That doesn’t look like a Vercel deploy hook (it starts with https://api.vercel.com/v1/integrations/deploy/).', 'error');
    setSavingHook(true);
    try {
      await saveAdmin('vercel_deploy_hook', v);
      toast(v ? 'Deploy hook saved' : 'Deploy hook removed');
    } catch (e) {
      fail(e);
    } finally {
      setSavingHook(false);
    }
  };

  return (
    <>
      <PageHeader title="Publish" desc="Saving keeps your changes safe here. Publishing rebuilds the website so visitors see them." />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title="Put changes live">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-chip p-4">
              {pending.never ? (
                <p className="text-[15px] font-semibold text-ink">
                  Not published from the admin yet
                  <span className="mt-1 block text-[13px] font-normal text-muted">Publish once after connecting Vercel; from then on this shows what’s waiting.</span>
                </p>
              ) : total ? (
                <p className="text-[15px] font-semibold text-ink">
                  {total} saved change{total > 1 ? 's' : ''} waiting
                  <span className="mt-1 block text-[13px] font-normal text-muted">
                    {[pending.products && `${pending.products} product${pending.products > 1 ? 's' : ''}`, pending.collections && `${pending.collections} brand/category`, pending.sections && `${pending.sections} home section${pending.sections > 1 ? 's' : ''}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </p>
              ) : (
                <p className="text-[15px] font-semibold text-ink">Everything is live</p>
              )}
              <p className="mt-2 text-[13px] text-muted">Last published: {settings.last_publish ? timeAgo(settings.last_publish) : 'never from the admin'}</p>
            </div>
            <Button variant="primary" icon="arrow" busy={busy} disabled={!settings.vercel_deploy_hook} onClick={publish} className="h-12 text-[15px]">
              Publish to website
            </Button>
            {!settings.vercel_deploy_hook && <p className="text-[13px] text-accent">Add the Vercel deploy hook (right) to switch on publishing.</p>}
            <p className="text-[13px] leading-relaxed text-muted">The website is rebuilt with everything saved here (products, brands, categories and home sections). It takes about 1–2 minutes; refresh the website after that.</p>
          </div>
        </Card>
        <Card title="Connection to Vercel" desc="One-time setup, usually done by your web developer.">
          <div className="flex flex-col gap-3">
            <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-2">
              <li>Open the project on vercel.com → Settings → Git.</li>
              <li>
                Under <b>Deploy Hooks</b>, name it “Admin publish”, choose the <b>main</b> branch and press Create.
              </li>
              <li>Copy the link it shows and paste it below.</li>
            </ol>
            <Field label="Vercel deploy hook" help="Kept private: only signed-in admins can read it.">
              <Input value={hook} onChange={(e) => setHook(e.target.value)} placeholder="https://api.vercel.com/v1/integrations/deploy/prj_…/…" className="font-mono text-[12.5px]" />
            </Field>
            <Button icon="check" busy={savingHook} disabled={hook.trim() === (settings.vercel_deploy_hook || '')} onClick={saveHook} className="w-fit">
              Save hook
            </Button>
            <a href="https://vercel.com/docs/deploy-hooks" target="_blank" rel="noopener" className="inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-accent">
              About deploy hooks
              <Icon name="arrow" size={12} className="-rotate-45" />
            </a>
          </div>
        </Card>
      </div>
    </>
  );
}
