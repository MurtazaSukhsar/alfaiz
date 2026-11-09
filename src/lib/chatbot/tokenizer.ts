// BERT WordPiece tokenizer (uncased) for the MiniLM sentence model.
// Mirrors HuggingFace's BertTokenizer: clean text, lowercase, strip accents,
// split on whitespace and punctuation, then greedy longest-match WordPiece.

export type Vocab = Map<string, number>;

export function parseVocab(text: string): Vocab {
  const vocab: Vocab = new Map();
  text.split('\n').forEach((line, i) => {
    const tok = line.replace(/\r$/, '');
    if (tok && !vocab.has(tok)) vocab.set(tok, i);
  });
  return vocab;
}

const isPunct = (ch: string) => {
  const cp = ch.codePointAt(0)!;
  if ((cp >= 33 && cp <= 47) || (cp >= 58 && cp <= 64) || (cp >= 91 && cp <= 96) || (cp >= 123 && cp <= 126)) return true;
  return /\p{P}/u.test(ch);
};
const isCjk = (cp: number) =>
  (cp >= 0x4e00 && cp <= 0x9fff) ||
  (cp >= 0x3400 && cp <= 0x4dbf) ||
  (cp >= 0x20000 && cp <= 0x2a6df) ||
  (cp >= 0x2a700 && cp <= 0x2b73f) ||
  (cp >= 0x2b740 && cp <= 0x2b81f) ||
  (cp >= 0x2b820 && cp <= 0x2ceaf) ||
  (cp >= 0xf900 && cp <= 0xfaff) ||
  (cp >= 0x2f800 && cp <= 0x2fa1f);

function basicTokenize(text: string): string[] {
  let clean = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp === 0 || cp === 0xfffd || (/\p{C}/u.test(ch) && !/[\t\n\r]/.test(ch))) continue;
    clean += /\s/.test(ch) ? ' ' : isCjk(cp) ? ` ${ch} ` : ch;
  }
  const out: string[] = [];
  for (const word of clean.trim().split(/\s+/)) {
    if (!word) continue;
    const w = word.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '');
    let cur = '';
    for (const ch of w) {
      if (isPunct(ch)) {
        if (cur) out.push(cur);
        out.push(ch);
        cur = '';
      } else cur += ch;
    }
    if (cur) out.push(cur);
  }
  return out;
}

function wordPiece(word: string, vocab: Vocab, unk: number): number[] {
  if (word.length > 100) return [unk];
  const ids: number[] = [];
  let start = 0;
  while (start < word.length) {
    let end = word.length;
    let found = -1;
    while (start < end) {
      const piece = (start > 0 ? '##' : '') + word.slice(start, end);
      const id = vocab.get(piece);
      if (id !== undefined) {
        found = id;
        break;
      }
      end--;
    }
    if (found < 0) return [unk];
    ids.push(found);
    start = end;
  }
  return ids;
}

/** [CLS] tokens… [SEP], truncated to maxLen. */
export function encode(text: string, vocab: Vocab, maxLen = 64): number[] {
  const cls = vocab.get('[CLS]')!;
  const sep = vocab.get('[SEP]')!;
  const unk = vocab.get('[UNK]')!;
  const ids: number[] = [];
  for (const w of basicTokenize(text)) ids.push(...wordPiece(w, vocab, unk));
  return [cls, ...ids.slice(0, maxLen - 2), sep];
}
