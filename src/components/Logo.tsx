import Link from 'next/link';

/** The Al Faiz mark: crimson F with FAIZ set beneath. */
export function LogoMark({ className, fill = '#9C0015', text = 'currentColor' }: { className?: string; fill?: string; text?: string }) {
  return (
    <svg viewBox="0 0 350 565" className={className} aria-hidden="true">
      <path d="M50 0H350V100H170V150H290V250H170V410H50Z" fill={fill} />
      <text
        x="4"
        y="560"
        textLength="342"
        lengthAdjust="spacing"
        fontFamily="'Outfit Variable', Outfit, sans-serif"
        fontWeight="700"
        fontSize="112"
        fill={text}
      >
        FAIZ
      </text>
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" aria-label="Al Faiz Electric & Hardware, home" className="flex shrink-0 items-center gap-2.5 text-ink">
      <LogoMark className="h-12 w-[30px] shrink-0" />
      <span className="ml-1 hidden flex-col gap-0.5 border-l border-[#E2E3DF] pl-3 leading-tight sm:flex lg:hidden xl:flex">
        <span className="text-[15px] font-bold">Electric &amp; Hardware</span>
        <span className="text-xs text-muted">Sharjah · UAE</span>
      </span>
    </Link>
  );
}
