import { cn } from '@/lib/utils';
import { TestimonialCard, type TestimonialAuthor } from './testimonial-card';

interface TestimonialsSectionProps {
  title: string;
  description: string;
  testimonials: Array<{
    author: TestimonialAuthor;
    text: string;
    href?: string;
  }>;
  className?: string;
}

/** Scrolling testimonials (21st.dev "testimonials with marquee", adapted to the Al Faiz theme). */
export function TestimonialsSection({ title, description, testimonials, className }: TestimonialsSectionProps) {
  // Two identical tracks make the loop seamless: the second follows the first.
  const Track = ({ hidden = false }: { hidden?: boolean }) => (
    <div
      aria-hidden={hidden || undefined}
      className="animate-marquee flex shrink-0 flex-row justify-around [gap:var(--gap)] group-hover:[animation-play-state:paused]"
    >
      {[...Array(4)].map((_, setIndex) =>
        testimonials.map((testimonial, i) => <TestimonialCard key={`${setIndex}-${i}`} {...testimonial} />),
      )}
    </div>
  );

  return (
    <section className={cn('px-0 py-12 text-ink sm:py-16', className)}>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-8 text-center sm:gap-12">
        <div className="flex flex-col items-center gap-3 px-4 sm:gap-4">
          <h2 className="max-w-[720px] text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[40px]">{title}</h2>
          <p className="max-w-[600px] text-[16px] font-medium text-muted sm:text-lg">{description}</p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <div className="group flex flex-row overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]">
            <Track />
            <Track hidden />
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 bg-gradient-to-r from-[#F5F5F2] sm:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/4 bg-gradient-to-l from-[#F5F5F2] sm:block" />
        </div>
      </div>
    </section>
  );
}
