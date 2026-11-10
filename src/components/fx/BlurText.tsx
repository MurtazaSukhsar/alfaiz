import type { ElementType } from 'react';

/**
 * Heading that sharpens in word by word when it scrolls into view
 * (inspired by 21st.dev's Text Blur Reveal, written from scratch; CSS + FxRuntime observer).
 * Without JavaScript the text is simply shown.
 */
export function BlurText({ text, as: Tag = 'span', className = '', id }: { text: string; as?: ElementType; className?: string; id?: string }) {
  const words = text.split(' ');
  return (
    <Tag id={id} className={`blur-text ${className}`} data-reveal-text aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="blur-word" style={{ ['--i' as string]: i }}>
          {w}
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  );
}
