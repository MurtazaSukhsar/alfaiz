'use client';

import { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/Icons';
import { defaultSettings, makeDefaults, type ContentKey, type Settings } from '@/data/content';
import { FormFields, ListEditor } from '../fields';
import { sectionByKey } from '../sections';
import { resetContent, saveContent, useStore } from '../store';
import { Badge, Button, Card, PageHeader, SaveBar, timeAgo, toast, useLeaveGuard } from '../ui';
import { fail, go, SITE } from '../nav';

/** Current value of a section: what was saved in the admin, else the built-in default. */
export function useSectionValue(key: ContentKey) {
  const { content } = useStore();
  return useMemo(() => {
    const settings: Settings = { ...defaultSettings, ...((content.settings as Partial<Settings>) || {}) };
    if (key === 'settings') return { value: settings, edited: !!content.settings };
    const brands = content.brands as { name: string }[] | undefined;
    const d = makeDefaults(settings, brands?.map((b) => b.name));
    const v = content[key];
    return { value: v ?? d[key], edited: v !== undefined };
  }, [content, key]);
}

export function SectionEdit({ sectionKey }: { sectionKey: string }) {
  const def = sectionByKey(sectionKey);
  const { contentUpdated } = useStore();
  const { value, edited } = useSectionValue((def?.key ?? 'hero') as ContentKey);
  const [draft, setDraft] = useState<unknown>(value);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(structuredClone(value)), [value]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(value);
  useLeaveGuard(dirty);

  if (!def) {
    go('#/', true);
    return null;
  }

  const save = async () => {
    const { value: clean, error } = def.clean ? def.clean(draft) : { value: draft, error: undefined };
    if (error) return toast(error, 'error');
    setBusy(true);
    try {
      await saveContent(def.key, clean);
      toast('Saved — press “Publish” when you’re ready to put it live');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!window.confirm(`Put “${def.title}” back to how it was when the website was built? Your edits to this section will be lost.`)) return;
    setBusy(true);
    try {
      await resetContent(def.key);
      toast('Back to the original');
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title={def.title}
        desc={def.desc}
        actions={
          <>
            {edited ? <Badge tone="ok">Edited {timeAgo(contentUpdated[def.key])}</Badge> : <Badge>Original</Badge>}
            <a href={`${SITE}${def.where}`} target="_blank" rel="noopener" className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-[14px] font-semibold text-ink-2 hover:bg-chip">
              View on site
              <Icon name="arrow" size={14} className="-rotate-45" />
            </a>
          </>
        }
      />
      <Card>
        {def.list ? (
          <ListEditor def={def.list} value={Array.isArray(draft) ? draft : []} onChange={setDraft} flat />
        ) : (
          <FormFields fields={def.fields ?? []} value={draft} onChange={setDraft} />
        )}
      </Card>
      <SaveBar
        dirty={dirty}
        busy={busy}
        onSave={save}
        onDiscard={() => setDraft(structuredClone(value))}
        extra={
          edited && !dirty ? (
            <Button variant="ghost" onClick={reset} disabled={busy}>
              Reset to original
            </Button>
          ) : null
        }
      />
    </>
  );
}
