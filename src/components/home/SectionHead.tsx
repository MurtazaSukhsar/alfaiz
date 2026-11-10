import type { ReactNode } from 'react';
import { BlurText } from '../fx/BlurText';

/**
 * Shared opening for every home-page section: a ruled line, a number and label on the left,
 * the title (and an optional link or note) on the right. Keeps the page reading as one layout.
 */
export function SectionHead({ num, label, title, id, intro, aside }: { num: string; label: string; title: string; id?: string; intro?: string; aside?: ReactNode }) {
  return (
    <header className="mb-8 grid gap-4 border-t border-ink/15 pt-5 sm:mb-10 lg:grid-cols-12 lg:gap-8">
      <div className="flex h-fit items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.18em] lg:col-span-3 lg:pt-3">
        <span className="tabular-nums text-accent">{num}</span>
        <span aria-hidden="true" className="h-px w-6 bg-ink/25" />
        <span className="text-ink-2">{label}</span>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 lg:col-span-9">
        <div className="flex max-w-[680px] flex-col gap-3">
          <BlurText as="h2" id={id} className="text-[clamp(28px,3.4vw,44px)] font-semibold leading-[1.05] tracking-[-0.03em]" text={title} />
          {intro && <p className="text-[15.5px] leading-relaxed text-muted">{intro}</p>}
        </div>
        {aside && <div className="flex shrink-0 items-center">{aside}</div>}
      </div>
    </header>
  );
}
