import type { CSSProperties } from 'react';

/**
 * Brand intro shown once per visit (see the inline script in layout.tsx).
 * Pure CSS: the F builds stroke by stroke, FAIZ rises letter by letter, the bar
 * counts to 100%, then a crimson curtain sweeps up to reveal the page.
 */
export function Loader() {
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash-inner">
        <svg viewBox="0 0 350 410" className="splash-mark">
          <rect className="sp-stem" x="50" y="0" width="120" height="410" />
          <rect className="sp-arm sp-top" x="166" y="0" width="184" height="100" />
          <rect className="sp-arm sp-mid" x="166" y="150" width="124" height="100" />
        </svg>
        <span className="splash-word">
          {'FAIZ'.split('').map((l, i) => (
            <span key={i} style={{ '--i': i } as CSSProperties}>
              {l}
            </span>
          ))}
        </span>
        <span className="splash-name">Electric &amp; Hardware</span>
        <span className="splash-progress">
          <span className="splash-bar" />
          <span className="splash-pct" />
        </span>
      </div>
    </div>
  );
}
