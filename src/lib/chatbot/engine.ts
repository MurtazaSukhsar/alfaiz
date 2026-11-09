// In-browser intent model: MiniLM (int8 ONNX) sentence embeddings + a bank of
// pre-embedded example questions. Everything runs on the visitor's device —
// no API, no server. Files live in public/chatbot/ and load only when the chat opens.

import { encode, parseVocab, type Vocab } from './tokenizer';

const BASE = '/chatbot';

export type Intent =
  | { k: 'say'; c: string }
  | { k: 'use'; label: string; find: string[]; needs: string | null }
  | { k: 'off' };

type Bank = { v: number; dim: number; intents: Intent[]; rows: number[]; vecs: string };

// Minimal surface of onnxruntime-web that we use.
type Tensor = { data: Float32Array };
type OrtModule = {
  env: { wasm: { wasmPaths: string; numThreads: number; proxy?: boolean } };
  Tensor: new (type: 'int64', data: BigInt64Array, dims: number[]) => unknown;
  InferenceSession: {
    create(url: string, opts: { executionProviders: string[]; graphOptimizationLevel?: string }): Promise<{
      run(feeds: Record<string, unknown>): Promise<Record<string, Tensor>>;
    }>;
  };
};

export type Engine = {
  intents: Intent[];
  /** Best score per intent, highest first. */
  classify(text: string): Promise<{ intent: number; score: number }[]>;
};

let loading: Promise<Engine> | null = null;

export function loadEngine(): Promise<Engine> {
  if (!loading) {
    loading = create().catch((e) => {
      loading = null;
      throw e;
    });
  }
  return loading;
}

async function create(): Promise<Engine> {
  // Loaded at runtime from /public, kept out of the bundle on purpose.
  const importAtRuntime = new Function('url', 'return import(url)') as (url: string) => Promise<OrtModule>;
  const ort = await importAtRuntime(`${BASE}/ort-1.30/ort.mjs`);
  ort.env.wasm.wasmPaths = `${BASE}/ort-1.30/`;
  ort.env.wasm.numThreads = 1; // works without cross-origin isolation headers

  const [session, bank, vocab] = await Promise.all([
    ort.InferenceSession.create(`${BASE}/minilm-q8-v1.onnx`, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' }),
    fetch(`${BASE}/bank-v1.json`).then((r) => r.json() as Promise<Bank>),
    fetch(`${BASE}/vocab-v1.txt`).then((r) => r.text()).then(parseVocab),
  ]);

  const dim = bank.dim;
  const raw = Uint8Array.from(atob(bank.vecs), (c) => c.charCodeAt(0));
  const vecs = new Int8Array(raw.buffer);
  const rows = bank.rows;
  const norms = new Float32Array(rows.length);
  for (let r = 0; r < rows.length; r++) {
    let s = 0;
    for (let j = 0; j < dim; j++) s += vecs[r * dim + j] ** 2;
    norms[r] = Math.sqrt(s) || 1;
  }

  async function embed(text: string, v: Vocab): Promise<Float32Array> {
    const ids = encode(text, v, 64);
    const n = ids.length;
    const feeds = {
      input_ids: new ort.Tensor('int64', BigInt64Array.from(ids, BigInt), [1, n]),
      attention_mask: new ort.Tensor('int64', new BigInt64Array(n).fill(BigInt(1)), [1, n]),
      token_type_ids: new ort.Tensor('int64', new BigInt64Array(n), [1, n]),
    };
    const out = await session.run(feeds);
    const h = out.last_hidden_state.data;
    const e = new Float32Array(dim);
    for (let t = 0; t < n; t++) for (let j = 0; j < dim; j++) e[j] += h[t * dim + j];
    let norm = 0;
    for (let j = 0; j < dim; j++) norm += e[j] ** 2;
    norm = Math.sqrt(norm) || 1;
    for (let j = 0; j < dim; j++) e[j] /= norm;
    return e;
  }

  return {
    intents: bank.intents,
    async classify(text) {
      const q = await embed(text, vocab);
      const best = new Map<number, number>();
      for (let r = 0; r < rows.length; r++) {
        let s = 0;
        const o = r * dim;
        for (let j = 0; j < dim; j++) s += q[j] * vecs[o + j];
        s /= norms[r];
        const i = rows[r];
        if (s > (best.get(i) ?? -1)) best.set(i, s);
      }
      return [...best.entries()].map(([intent, score]) => ({ intent, score })).sort((a, b) => b.score - a.score);
    },
  };
}
