'use client';
// Small UI kit for the admin panel.

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { imgUrl } from '@/lib/format';
import { Icon, type IconName } from '@/components/Icons';
import { prepareImage, uploadFile } from './sb';
import { firstImage, useStore, type ProductLite } from './store';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ toasts */

type Toast = { id: number; text: string; tone: 'ok' | 'error' };
let toasts: Toast[] = [];
const toastSubs = new Set<(t: Toast[]) => void>();
export function toast(text: string, tone: Toast['tone'] = 'ok') {
  const t = { id: Date.now() + Math.random(), text, tone };
  toasts = [...toasts, t];
  toastSubs.forEach((f) => f(toasts));
  setTimeout(() => {
    toasts = toasts.filter((x) => x.id !== t.id);
    toastSubs.forEach((f) => f(toasts));
  }, tone === 'error' ? 7000 : 3500);
}
export function Toasts() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => {
    toastSubs.add(setList);
    return () => void toastSubs.delete(setList);
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[200] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {list.map((t) => (
        <div
          key={t.id}
          className={cx(
            'pointer-events-auto flex max-w-[520px] items-center gap-2 rounded-lg px-4 py-3 text-[14px] font-medium shadow-[0_12px_30px_-12px_rgba(0,0,0,.45)]',
            t.tone === 'ok' ? 'bg-ink text-white' : 'bg-accent text-white',
          )}
        >
          <Icon name={t.tone === 'ok' ? 'check' : 'x'} size={16} strokeWidth={2.4} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ basics */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger'; size?: 'sm' | 'md'; icon?: IconName; busy?: boolean };
export function Button({ variant = 'outline', size = 'md', icon, busy, className, children, disabled, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-45',
        size === 'sm' ? 'h-8 px-2.5 text-[13px]' : 'h-10 px-4 text-[14px]',
        variant === 'primary' && 'bg-ink text-white hover:bg-accent',
        variant === 'outline' && 'bg-white text-ink ring-1 ring-line hover:ring-ink/40',
        variant === 'ghost' && 'text-ink-2 hover:bg-chip hover:text-ink',
        variant === 'danger' && 'bg-white text-accent ring-1 ring-accent/30 hover:bg-accent hover:text-white',
        className,
      )}
      {...rest}
    >
      {busy ? <Spinner /> : icon ? <Icon name={icon} size={size === 'sm' ? 14 : 16} strokeWidth={2.2} /> : null}
      {children}
    </button>
  );
}

export const Spinner = ({ className = '' }: { className?: string }) => (
  <span aria-hidden="true" className={cx('inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)} />
);

export function Field({ label, help, children, className }: { label: string; help?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cx('flex min-w-0 flex-col gap-1.5', className)}>
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {help && <span className="text-[12.5px] leading-snug text-muted">{help}</span>}
    </label>
  );
}

const inputCls = 'w-full rounded-lg bg-white px-3 text-[14.5px] text-ink outline-none ring-1 ring-line transition placeholder:text-muted/60 focus:ring-2 focus:ring-ink';
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, 'h-10', props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(480, el.scrollHeight + 2)}px`;
  }, [props.value]);
  return <textarea ref={ref} rows={3} {...props} className={cx(inputCls, 'resize-y py-2.5 leading-relaxed', props.className)} />;
}
export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={cx(inputCls, 'h-10 cursor-pointer pr-8', props.className)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
export function Toggle({ checked, onChange, label, help }: { checked: boolean; onChange: (v: boolean) => void; label: string; help?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-start gap-3 text-left">
      <span className={cx('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition', checked ? 'bg-ink' : 'bg-line')}>
        <span className={cx('absolute top-0.5 size-5 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </span>
      <span className="flex flex-col">
        <span className="text-[14px] font-semibold text-ink">{label}</span>
        {help && <span className="text-[12.5px] text-muted">{help}</span>}
      </span>
    </button>
  );
}

export function Card({ title, desc, children, actions, className }: { title?: string; desc?: ReactNode; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={cx('rounded-xl bg-white p-4 ring-1 ring-line-soft sm:p-6', className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {title && <h2 className="text-[16px] font-semibold text-ink">{title}</h2>}
            {desc && <p className="text-[13px] text-muted">{desc}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, desc, actions, back }: { title: string; desc?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:mb-6">
      {back && (
        <a href={back.href} className="inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-muted hover:text-ink">
          <Icon name="arrow" size={13} strokeWidth={2.4} className="rotate-180" />
          {back.label}
        </a>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="line-clamp-3 text-[21px] font-bold leading-tight tracking-[-0.02em] text-ink sm:text-[26px]">{title}</h1>
          {desc && <p className="max-w-[680px] text-[14px] leading-relaxed text-muted">{desc}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/** Sticky bar at the bottom of an editor with Save / Discard. */
export function SaveBar({ dirty, busy, onSave, onDiscard, extra }: { dirty: boolean; busy?: boolean; onSave: () => void; onDiscard?: () => void; extra?: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft bg-white/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8">
      <span className={cx('text-[13px] font-medium', dirty ? 'text-accent' : 'text-muted')}>{dirty ? 'You have unsaved changes' : 'All changes saved'}</span>
      <div className="flex flex-wrap items-center gap-2">
        {extra}
        {onDiscard && (
          <Button variant="ghost" disabled={!dirty || busy} onClick={onDiscard}>
            Discard
          </Button>
        )}
        <Button variant="primary" icon="check" busy={busy} disabled={!dirty} onClick={onSave}>
          Save
        </Button>
      </div>
    </div>
  );
}

/** Warn before leaving the page with unsaved changes. */
export function useLeaveGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const f = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', f);
    (window as unknown as { __fzDirty?: boolean }).__fzDirty = true;
    return () => {
      window.removeEventListener('beforeunload', f);
      (window as unknown as { __fzDirty?: boolean }).__fzDirty = false;
    };
  }, [dirty]);
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', f);
      document.body.style.overflow = '';
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', wide ? 'sm:max-w-[760px]' : 'sm:max-w-[520px]')}>
        <div className="flex items-center justify-between border-b border-line-soft px-5 py-3.5">
          <h2 className="text-[16px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-chip hover:text-ink">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

export const thumb = (src: string, w = 160) => imgUrl(src, w);

export function Thumb({ src, size = 44, className }: { src?: string; size?: number; className?: string }) {
  return (
    <span className={cx('grid shrink-0 place-items-center overflow-hidden rounded-md bg-chip', className)} style={{ width: size, height: size }}>
      {src ? <img src={thumb(src, size * 3)} alt="" loading="lazy" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} className="max-h-full max-w-full object-contain mix-blend-multiply" /> : <Icon name="box" size={16} className="text-muted" />}
    </span>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'ok' | 'warn' | 'off' }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center rounded-md px-2 text-[11.5px] font-semibold',
        tone === 'neutral' && 'bg-chip text-ink-2',
        tone === 'ok' && 'bg-[#e6f4ea] text-[#1e6b34]',
        tone === 'warn' && 'bg-[#fff4d6] text-[#7a5a00]',
        tone === 'off' && 'bg-accent-soft text-accent',
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ images */

export function ImageInput({ value, onChange, folder, label = 'Image', help, contain = true }: { value: string; onChange: (v: string) => void; folder: string; label?: string; help?: string; contain?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [paste, setPaste] = useState(false);
  const [link, setLink] = useState('');
  const file = useRef<HTMLInputElement>(null);
  const applyLink = () => {
    const u = link.trim();
    if (!/^(https:\/\/|\/)/.test(u)) return toast('Paste a full link starting with https://', 'error');
    onChange(u);
    setLink('');
    setPaste(false);
  };
  const pick = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast('Please choose an image file (JPG, PNG, WebP or SVG).', 'error');
    setBusy(true);
    try {
      const blob = await prepareImage(f, folder === 'hero' ? 2200 : 1600);
      const ext = blob.type === 'image/webp' ? 'webp' : (f.name.split('.').pop() || 'jpg').toLowerCase();
      const base = f.name.replace(/\.[^.]+$/, '').slice(0, 60) || 'image';
      const url = await uploadFile(`${folder}/${Date.now().toString(36)}-${base}.${ext}`, blob);
      onChange(url);
      toast('Image uploaded');
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(false);
      if (file.current) file.current.value = '';
    }
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div
        className="flex flex-wrap items-center gap-3 rounded-lg p-2 ring-1 ring-line"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }}
      >
        <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-chip">
          {value ? <img src={thumb(value, 240)} alt="" className={cx('size-full', contain ? 'object-contain' : 'object-cover')} /> : <Icon name="box" size={20} className="text-muted" />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" icon="plus" busy={busy} onClick={() => file.current?.click()}>
              {value ? 'Replace' : 'Upload'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPaste((v) => !v)}>
              Use a link
            </Button>
            {value && (
              <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange('')}>
                Remove
              </Button>
            )}
          </div>
          {paste && (
            <span className="flex gap-2">
              <Input
                autoFocus
                placeholder="https://…"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    applyLink();
                  }
                }}
                className="h-9 text-[13px]"
              />
              <Button size="sm" variant="primary" onClick={applyLink} className="h-9">
                Use
              </Button>
            </span>
          )}
          {!paste && value && <span className="truncate text-[12px] text-muted">{value.split('/').pop()?.split('?')[0]}</span>}
        </div>
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
      {help && <span className="text-[12.5px] text-muted">{help}</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ pickers */

export function ProductPicker({ onPick, onClose, exclude = [] }: { onPick: (p: ProductLite) => void; onClose: () => void; exclude?: string[] }) {
  const { products, collections } = useStore();
  const [q, setQ] = useState('');
  const [brand, setBrand] = useState('');
  const brands = collections.filter((c) => c.kind === 'brand');
  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return products
      .filter((p) => !exclude.includes(p.handle))
      .filter((p) => !brand || p.brand_handle === brand || p.collections.includes(brand))
      .filter((p) => words.every((w) => `${p.name} ${p.brand} ${p.handle}`.toLowerCase().includes(w)))
      .slice(0, 60);
  }, [products, q, brand, exclude]);
  return (
    <Modal title="Choose a product" onClose={onClose} wide>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Input autoFocus placeholder="Search by name, model or brand…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={brand} onChange={(e) => setBrand(e.target.value)} options={[{ value: '', label: 'All brands' }, ...brands.map((b) => ({ value: b.handle, label: b.title }))]} className="sm:w-48" />
      </div>
      <ul className="flex flex-col divide-y divide-line-soft">
        {results.map((p) => (
          <li key={p.handle}>
            <button
              type="button"
              onClick={() => {
                onPick(p);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-chip"
            >
              <Thumb src={firstImage(p)} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[14px] font-medium text-ink">{p.name}</span>
                <span className="text-[12.5px] text-muted">
                  {p.brand || '—'}
                  {!p.published && ' · hidden'}
                </span>
              </span>
              <Icon name="plus" size={16} className="text-muted" />
            </button>
          </li>
        ))}
        {!results.length && <li className="py-8 text-center text-[14px] text-muted">No products match.</li>}
      </ul>
    </Modal>
  );
}

/** One product chosen from the catalogue (shows its photo + name). */
export function ProductField({ label, value, onChange, help }: { label: string; value: string; onChange: (handle: string) => void; help?: string }) {
  const { products } = useStore();
  const [open, setOpen] = useState(false);
  const p = products.find((x) => x.handle === value);
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div className="flex items-center gap-3 rounded-lg p-2 ring-1 ring-line">
        <Thumb src={firstImage(p)} size={48} />
        <span className="flex min-w-0 flex-1 flex-col">
          {p ? (
            <>
              <span className="line-clamp-2 text-[13.5px] font-medium leading-snug text-ink">{p.name}</span>
              <span className="text-[12px] text-muted">
                {p.brand}
                {!p.published && <span className="text-accent"> · hidden — won’t show on the site</span>}
              </span>
            </>
          ) : value ? (
            <span className="text-[13px] text-accent">Product not found (deleted?) — choose another</span>
          ) : (
            <span className="text-[13px] text-muted">No product chosen</span>
          )}
        </span>
        <Button size="sm" onClick={() => setOpen(true)}>
          {value ? 'Change' : 'Choose'}
        </Button>
      </div>
      {help && <span className="text-[12.5px] text-muted">{help}</span>}
      {open && <ProductPicker onPick={(x) => onChange(x.handle)} onClose={() => setOpen(false)} />}
    </div>
  );
}

export function CollectionField({ label, value, onChange, kind, help }: { label: string; value: string; onChange: (v: string) => void; kind?: 'brand' | 'category'; help?: string }) {
  const { collections } = useStore();
  const opts = collections.filter((c) => !kind || c.kind === kind);
  return (
    <Field label={label} help={help}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={[{ value: '', label: '— Choose —' }, ...opts.map((c) => ({ value: c.handle, label: `${c.title}${c.published ? '' : ' (hidden)'}` })), ...(value && !opts.some((c) => c.handle === value) ? [{ value, label: `${value} (not found)` }] : [])]}
      />
    </Field>
  );
}

/** Several brands / categories / industries as removable chips + a dropdown to add more. */
export function MultiChoice({ label, value, onChange, options, help }: { label: string; value: string[]; onChange: (v: string[]) => void; options: { value: string; label: string }[]; help?: string }) {
  const name = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const left = options.filter((o) => !value.includes(o.value));
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg p-2 ring-1 ring-line">
        {value.map((v) => (
          <span key={v} className="inline-flex h-8 items-center gap-1 rounded-md bg-chip pl-2.5 pr-1 text-[13px] font-medium text-ink">
            {name(v)}
            <button type="button" aria-label={`Remove ${name(v)}`} onClick={() => onChange(value.filter((x) => x !== v))} className="grid size-6 place-items-center rounded text-muted hover:bg-white hover:text-accent">
              <Icon name="x" size={13} strokeWidth={2.4} />
            </button>
          </span>
        ))}
        {left.length > 0 && (
          <select
            value=""
            onChange={(e) => e.target.value && onChange([...value, e.target.value])}
            className="h-8 cursor-pointer rounded-md border border-dashed border-line bg-white px-2 text-[13px] text-muted outline-none hover:text-ink"
            aria-label={`Add to ${label}`}
          >
            <option value="">+ Add…</option>
            {left.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {help && <span className="text-[12.5px] text-muted">{help}</span>}
    </div>
  );
}

/** A list of short texts (e.g. announcement messages, countries). */
export function StringList({ label, value, onChange, help, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; help?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div className="flex flex-col gap-2">
        {value.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={v} placeholder={placeholder} onChange={(e) => onChange(value.map((x, k) => (k === i ? e.target.value : x)))} />
            <MoveButtons i={i} n={value.length} onMove={(to) => onChange(move(value, i, to))} />
            <IconButton icon="trash" label="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))} />
          </div>
        ))}
        <Button size="sm" icon="plus" className="w-fit" onClick={() => onChange([...value, ''])}>
          Add
        </Button>
      </div>
      {help && <span className="text-[12.5px] text-muted">{help}</span>}
    </div>
  );
}

export function IconButton({ icon, label, onClick, disabled, className }: { icon: IconName; label: string; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className={cx('grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-chip hover:text-ink disabled:opacity-30', className)}>
      <Icon name={icon} size={16} strokeWidth={2.2} />
    </button>
  );
}

export function MoveButtons({ i, n, onMove }: { i: number; n: number; onMove: (to: number) => void }) {
  return (
    <span className="flex shrink-0">
      <IconButton icon="arrow" label="Move up" className="[&_svg]:-rotate-90" disabled={i === 0} onClick={() => onMove(i - 1)} />
      <IconButton icon="arrow" label="Move down" className="[&_svg]:rotate-90" disabled={i === n - 1} onClick={() => onMove(i + 1)} />
    </span>
  );
}

export function move<T>(arr: T[], from: number, to: number): T[] {
  const out = arr.slice();
  const [x] = out.splice(from, 1);
  out.splice(to, 0, x);
  return out;
}

export const timeAgo = (iso?: string) => {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
