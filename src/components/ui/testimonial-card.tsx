import { cn } from '@/lib/utils';
import { Icon } from '../Icons';

export interface TestimonialAuthor {
  name: string;
  handle: string;
  avatar?: string;
}

export interface TestimonialCardProps {
  author: TestimonialAuthor;
  text: string;
  href?: string;
  className?: string;
}

export function TestimonialCard({ author, text, href, className }: TestimonialCardProps) {
  const Card = href ? 'a' : 'div';
  return (
    <Card
      {...(href ? { href, target: '_blank', rel: 'noopener' } : {})}
      className={cn(
        'flex w-[280px] shrink-0 flex-col gap-5 rounded-2xl border border-line-soft bg-white p-5 shadow-[0_1px_2px_rgba(21,23,26,.04)] text-start sm:w-[320px] sm:p-6',
        'transition duration-300 hover:-translate-y-1 hover:border-line hover:shadow-[0_16px_32px_-16px_rgba(21,23,26,.25)]',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {author.avatar ? (
          <img src={author.avatar} alt="" className="size-12 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-accent text-lg font-semibold text-white">
            {author.name[0]}
          </span>
        )}
        <div className="flex flex-col items-start leading-tight">
          <h3 className="text-[16px] font-semibold text-ink">{author.name}</h3>
          <p className="mt-0.5 text-[13px] text-muted">{author.handle}</p>
        </div>
        <Icon name="quote" size={22} strokeWidth={1.8} className="ml-auto text-accent/40" />
      </div>
      <p className="text-[15px] leading-relaxed text-ink-2 sm:text-base">{text}</p>
    </Card>
  );
}
