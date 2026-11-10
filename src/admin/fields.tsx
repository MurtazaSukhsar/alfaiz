'use client';
// Form builder: each home section is described as a list of fields (see sections.tsx) and edited here.

import { useState } from 'react';
import { Icon, type IconName } from '@/components/Icons';
import { iconChoices } from '@/data/content';
import { useStore } from './store';
import { CollectionField, Field, IconButton, ImageInput, Input, MoveButtons, MultiChoice, ProductField, Select, StringList, Textarea, Thumb, cx, move } from './ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Base = { name: string; label: string; help?: string; half?: boolean };
export type FieldDef =
  | (Base & { type: 'text' | 'textarea' | 'number'; placeholder?: string })
  | (Base & { type: 'image'; folder: string; cover?: boolean })
  | (Base & { type: 'product' })
  | (Base & { type: 'collection'; kind?: 'brand' | 'category' })
  | (Base & { type: 'collections'; kind?: 'brand' | 'category' })
  | (Base & { type: 'icon' })
  | (Base & { type: 'strings'; placeholder?: string })
  | (Base & { type: 'select'; options: { value: string; label: string }[] })
  | (Base & { type: 'list'; item: FieldDef[]; itemLabel: (v: any, i: number) => string; itemImage?: (v: any) => string | undefined; newItem: () => any; max?: number; addLabel?: string });
export type ListDef = Extract<FieldDef, { type: 'list' }>;

export function FormFields({ fields, value, onChange }: { fields: FieldDef[]; value: any; onChange: (v: any) => void }) {
  const set = (name: string, v: unknown) => onChange({ ...value, [name]: v });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.name} className={f.half ? '' : 'sm:col-span-2'}>
          <OneField f={f} value={value?.[f.name]} onChange={(v) => set(f.name, v)} />
        </div>
      ))}
    </div>
  );
}

function OneField({ f, value, onChange }: { f: FieldDef; value: any; onChange: (v: any) => void }) {
  const { collections } = useStore();
  switch (f.type) {
    case 'text':
      return (
        <Field label={f.label} help={f.help}>
          <Input value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case 'number':
      return (
        <Field label={f.label} help={f.help}>
          <Input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
        </Field>
      );
    case 'textarea':
      return (
        <Field label={f.label} help={f.help}>
          <Textarea value={value ?? ''} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
        </Field>
      );
    case 'image':
      return <ImageInput label={f.label} help={f.help} folder={f.folder} value={value ?? ''} onChange={onChange} contain={!f.cover} />;
    case 'product':
      return <ProductField label={f.label} help={f.help} value={value ?? ''} onChange={onChange} />;
    case 'collection':
      return <CollectionField label={f.label} help={f.help} kind={f.kind} value={value ?? ''} onChange={onChange} />;
    case 'collections':
      return (
        <MultiChoice
          label={f.label}
          help={f.help}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          options={collections.filter((c) => !f.kind || c.kind === f.kind).map((c) => ({ value: c.handle, label: c.title }))}
        />
      );
    case 'strings':
      return <StringList label={f.label} help={f.help} placeholder={f.placeholder} value={Array.isArray(value) ? value : []} onChange={onChange} />;
    case 'select':
      return (
        <Field label={f.label} help={f.help}>
          <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)} options={f.options} />
        </Field>
      );
    case 'icon':
      return (
        <Field label={f.label} help={f.help}>
          <span className="flex items-center gap-2">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon name={(value || 'box') as IconName} size={18} />
            </span>
            <Select value={value ?? ''} onChange={(e) => onChange(e.target.value)} options={iconChoices.map((i) => ({ value: i, label: i }))} />
          </span>
        </Field>
      );
    case 'list':
      return <ListEditor def={f} value={Array.isArray(value) ? value : []} onChange={onChange} />;
  }
}

/** Re-orderable list of items, each opened to edit its own fields. */
export function ListEditor({ def, value, onChange, flat }: { def: ListDef; value: any[]; onChange: (v: any[]) => void; flat?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const full = def.max !== undefined && value.length >= def.max;
  return (
    <div className="flex flex-col gap-2">
      {!flat && (
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-semibold text-ink">{def.label}</span>
          {def.help && <span className="text-[12.5px] text-muted">{def.help}</span>}
        </div>
      )}
      <ol className="flex flex-col gap-2">
        {value.map((item, i) => {
          const isOpen = open === i;
          const img = def.itemImage?.(item);
          return (
            <li key={i} className={cx('rounded-lg bg-white ring-1 transition', isOpen ? 'ring-ink/40 shadow-[0_10px_30px_-20px_rgba(0,0,0,.4)]' : 'ring-line')}>
              <div className="flex items-center gap-2 py-1.5 pl-3 pr-1.5">
                <span className="w-5 shrink-0 text-[12px] font-semibold tabular-nums text-muted">{i + 1}</span>
                {def.itemImage && <Thumb src={img} size={36} />}
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
                  <span className={cx('truncate text-[14px] font-medium', def.itemLabel(item, i) ? 'text-ink' : 'text-muted')}>{def.itemLabel(item, i) || 'New item — click to edit'}</span>
                </button>
                <IconButton icon="chev" label={isOpen ? 'Close' : 'Edit'} onClick={() => setOpen(isOpen ? null : i)} className={isOpen ? '[&_svg]:rotate-90' : ''} />
                <MoveButtons
                  i={i}
                  n={value.length}
                  onMove={(to) => {
                    onChange(move(value, i, to));
                    if (open === i) setOpen(to);
                  }}
                />
                <IconButton
                  icon="trash"
                  label="Remove"
                  className="hover:text-accent"
                  onClick={() => {
                    if (!window.confirm(`Remove “${def.itemLabel(item, i) || `item ${i + 1}`}”?`)) return;
                    onChange(value.filter((_, k) => k !== i));
                    setOpen(null);
                  }}
                />
              </div>
              {isOpen && (
                <div className="border-t border-line-soft p-3 sm:p-4">
                  <FormFields fields={def.item} value={item} onChange={(v) => onChange(value.map((x, k) => (k === i ? v : x)))} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        disabled={full}
        onClick={() => {
          onChange([...value, def.newItem()]);
          setOpen(value.length);
        }}
        className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-dashed border-line text-[14px] font-semibold text-ink-2 transition hover:border-ink/40 hover:text-ink disabled:opacity-40"
      >
        <Icon name="plus" size={16} strokeWidth={2.2} />
        {full ? `Maximum ${def.max}` : def.addLabel || 'Add'}
      </button>
    </div>
  );
}
