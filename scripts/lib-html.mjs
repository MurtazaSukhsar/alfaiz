// Cleans product / category descriptions before they reach the site (they may be typed in the admin panel).
import sanitizeHtml from 'sanitize-html';

export const cleanHtml = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'h5', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'span', 'blockquote', 'hr'],
    allowedAttributes: { a: ['href', 'title'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    transformTags: {
      h1: 'h2',
      div: 'p',
      a: (tag, attribs) => ({ tagName: 'a', attribs: { ...attribs, rel: 'noopener', target: attribs.href?.startsWith('/') ? undefined : '_blank' } }),
    },
    exclusiveFilter: (frame) => ['p', 'span', 'li', 'strong'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
  })
    .replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>')
    .trim();

export const plainText = (html) =>
  sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();

/** Blog articles: like product descriptions, plus images. */
export const cleanPostHtml = (html) =>
  sanitizeHtml(html || '', {
    allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'a', 'blockquote', 'hr', 'img', 'figure', 'figcaption'],
    allowedAttributes: { a: ['href', 'title'], img: ['src', 'alt', 'width', 'height'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      div: 'p',
      a: (tag, attribs) => ({ tagName: 'a', attribs: { ...attribs, rel: 'noopener', target: attribs.href?.startsWith('/') ? undefined : '_blank' } }),
      img: (tag, attribs) => ({ tagName: 'img', attribs: { ...attribs, loading: 'lazy', alt: attribs.alt || '' } }),
    },
    exclusiveFilter: (frame) => ['p', 'li', 'strong'].includes(frame.tag) && !frame.text.trim() && !frame.mediaChildren?.length,
  }).trim();
