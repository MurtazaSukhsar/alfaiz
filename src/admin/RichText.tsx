'use client';
// Simple rich-text box for product / category descriptions: bold, italic, headings, lists, links,
// plus an "HTML" switch for pasting a ready-made description or spec table.

import { useEffect, useRef, useState } from 'react';
import { cx, Textarea } from './ui';

const TOOLS: { label: string; title: string; run: () => void; cls?: string }[] = [
  { label: 'B', title: 'Bold', run: () => document.execCommand('bold'), cls: 'font-bold' },
  { label: 'I', title: 'Italic', run: () => document.execCommand('italic'), cls: 'italic' },
  { label: 'H', title: 'Heading', run: () => document.execCommand('formatBlock', false, 'h3'), cls: 'font-bold' },
  { label: '¶', title: 'Normal text', run: () => document.execCommand('formatBlock', false, 'p') },
  { label: '• List', title: 'Bullet list', run: () => document.execCommand('insertUnorderedList') },
  { label: '1. List', title: 'Numbered list', run: () => document.execCommand('insertOrderedList') },
  {
    label: 'Link',
    title: 'Add a link to the selected text',
    run: () => {
      const url = window.prompt('Link address (https://… or /collections/…)');
      if (url && /^(https?:\/\/|\/|mailto:|tel:)/.test(url.trim())) document.execCommand('createLink', false, url.trim());
    },
  },
  { label: 'Clear', title: 'Remove formatting', run: () => document.execCommand('removeFormat') },
];

export function RichText({ value, onChange, label = 'Description', help }: { value: string; onChange: (html: string) => void; label?: string; help?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);
  const [source, setSource] = useState(false);

  // put outside changes (load, discard, switching back from HTML) into the editor
  useEffect(() => {
    if (source || !ref.current) return;
    if (value !== last.current) {
      ref.current.innerHTML = value || '';
      last.current = value;
    }
  }, [value, source]);

  const emit = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML === '<br>' ? '' : ref.current.innerHTML;
    last.current = html;
    onChange(html);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold text-ink">{label}</span>
      <div className="overflow-hidden rounded-lg ring-1 ring-line focus-within:ring-2 focus-within:ring-ink">
        <div className="flex flex-wrap items-center gap-1 border-b border-line-soft bg-chip/60 p-1.5">
          {!source &&
            TOOLS.map((t) => (
              <button
                key={t.title}
                type="button"
                title={t.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  t.run();
                  emit();
                }}
                className={cx('h-8 min-w-8 rounded-md px-2 text-[13px] text-ink-2 hover:bg-white hover:text-ink', t.cls)}
              >
                {t.label}
              </button>
            ))}
          <button
            type="button"
            onClick={() => {
              last.current = null;
              setSource((s) => !s);
            }}
            className={cx('ml-auto h-8 rounded-md px-2.5 text-[12.5px] font-semibold', source ? 'bg-ink text-white' : 'text-ink-2 hover:bg-white')}
          >
            {source ? 'Back to editor' : 'HTML'}
          </button>
        </div>
        {source ? (
          <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[220px] rounded-none font-mono text-[12.5px] ring-0 focus:ring-0" />
        ) : (
          <div
            ref={ref}
            contentEditable
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={label}
            onInput={emit}
            onBlur={emit}
            onPaste={(e) => {
              // paste as clean text (Word / websites bring hidden styles); use HTML mode for tables
              e.preventDefault();
              document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
            }}
            className="prose-af max-h-[520px] min-h-[200px] overflow-y-auto bg-white px-4 py-3 text-[14.5px] outline-none"
          />
        )}
      </div>
      <span className="text-[12.5px] text-muted">{help ?? 'Pasted text arrives without formatting. To paste a spec table, use HTML.'}</span>
    </div>
  );
}
