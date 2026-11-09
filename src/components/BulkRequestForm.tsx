'use client';

import { useState } from 'react';
import { site, waLink } from '@/data/site';
import { Icon } from './Icons';

/** Bulk / special product request: builds a message and opens WhatsApp or email. Nothing is sent to a server. */
export function BulkRequestForm() {
  const [f, setF] = useState({ name: '', company: '', phone: '', location: '', items: '', notes: '' });
  const [touched, setTouched] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((v) => ({ ...v, [k]: e.target.value }));
  const ok = f.name.trim() && f.phone.trim() && f.items.trim();

  const opt = (label: string, v: string) => (v.trim() ? `${label}: ${v.trim()}` : null);
  const message = [
    'Hello Al Faiz, I would like a bulk / special product quote.',
    '',
    `Name: ${f.name.trim()}`,
    opt('Company', f.company),
    `Phone: ${f.phone.trim()}`,
    opt('Delivery location', f.location),
    '',
    'Products & quantities:',
    f.items.trim(),
    f.notes.trim() ? `\nNotes: ${f.notes.trim()}` : null,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');

  const field = 'h-12 w-full rounded-xl bg-[#F6F6F3] px-4 text-[15px] text-ink outline-none ring-1 ring-transparent transition placeholder:text-[#8a8f96] focus:bg-white focus:ring-ink/25';
  const label = 'text-sm font-medium text-ink';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (ok) window.open(waLink(message), '_blank', 'noopener');
      }}
      className="flex flex-col gap-5 rounded-[28px] bg-white p-6 ring-1 ring-line-soft sm:p-8"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className={label}>
            Your name <span className="text-accent">*</span>
          </span>
          <input value={f.name} onChange={set('name')} autoComplete="name" className={field} aria-invalid={touched && !f.name.trim()} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Company</span>
          <input value={f.company} onChange={set('company')} autoComplete="organization" className={field} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>
            Phone / WhatsApp <span className="text-accent">*</span>
          </span>
          <input value={f.phone} onChange={set('phone')} type="tel" autoComplete="tel" placeholder="+971" className={field} aria-invalid={touched && !f.phone.trim()} />
        </label>
        <label className="flex flex-col gap-2">
          <span className={label}>Delivery location</span>
          <input value={f.location} onChange={set('location')} placeholder="e.g. Jebel Ali, Dubai" className={field} />
        </label>
      </div>
      <label className="flex flex-col gap-2">
        <span className={label}>
          Products &amp; quantities <span className="text-accent">*</span>
        </span>
        <textarea
          value={f.items}
          onChange={set('items')}
          rows={5}
          placeholder={'One item per line, e.g.\n50 × flap disc 4.5" 60 grit\n10 × DeWALT SDS drill bit 8mm'}
          className={`${field} h-auto py-3 leading-relaxed`}
          aria-invalid={touched && !f.items.trim()}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className={label}>Notes</span>
        <input value={f.notes} onChange={set('notes')} placeholder="Deadline, brand preference, model numbers…" className={field} />
      </label>

      {touched && !ok && <p className="text-sm font-medium text-accent">Please add your name, phone and the products you need.</p>}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" className="pill pill-lg bg-accent text-white">
          <Icon name="chat" size={17} />
          Send on WhatsApp
        </button>
        <a
          href={`mailto:${site.email}?cc=${site.email2}&subject=${encodeURIComponent('Bulk & special product request')}&body=${encodeURIComponent(message)}`}
          onClick={(e) => {
            setTouched(true);
            if (!ok) e.preventDefault();
          }}
          className="pill pill-lg pill-outline"
        >
          <Icon name="mail" size={17} />
          Send by email
        </a>
        <span className="text-[13px] text-muted">Opens WhatsApp or your email app with the request filled in.</span>
      </div>
    </form>
  );
}
