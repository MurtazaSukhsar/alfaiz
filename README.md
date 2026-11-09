# Al Faiz Electric & Hardware — website

Next.js 16 site for **alfaizhardware.com**, built from the Home v3 design: clean industrial look, crimson brand accent,
product search in the header, scrolling brand logos, magazine-style range spread, quote list and WhatsApp quoting.

The product catalog (423 products, 36 collections) is pulled from the live Shopify store, and the site is exported as plain
static HTML, so it can be hosted anywhere.

## Run it locally

Needs Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Update products from Shopify

```bash
npm run sync      # pulls products + collections into data/catalog.json and public/search-index.json
npm run build     # rebuild the site
```

Run `sync` whenever products are added or changed in Shopify. To pull from a different store:
`STORE_URL=https://example.myshopify.com npm run sync` (on Windows PowerShell: `$env:STORE_URL="…"; npm run sync`).

## Build and deploy

```bash
npm run build     # writes the finished site to ./out
npm start         # preview ./out locally on http://localhost:3000
```

Upload the **contents of `out/`** to any static host:

- **Hostinger / cPanel:** upload `out/*` into `public_html`. No Node.js needed on the server.
- **Vercel / Netlify:** import the repo; build command `npm run build`, output directory `out`.

`npm run build` uses webpack (`next build --webpack`) so it also works on hosts with an older glibc.

## Where things live

| What | File |
| --- | --- |
| Phone, WhatsApp, email, address, hours, Farwings credit | `src/data/site.ts` → `site` |
| Featured product tabs, brand strip, product ranges, FAQs, reviews, Range Edit spread | `src/data/site.ts` |
| Home page sections | `src/components/home/Sections.tsx` |
| Header (search, nav, mega menu) | `src/components/Header.tsx`, `src/components/SearchBox.tsx` |
| Category & brand pages (`/collections/<handle>/`) | `src/app/collections/[handle]/page.tsx`, `src/components/CollectionView.tsx` |
| Product pages (`/products/<handle>/`) | `src/app/products/[handle]/page.tsx`, `src/components/ProductBuy.tsx` |
| Cart (`/cart/`) | `src/components/QuoteList.tsx`, `src/components/QuoteProvider.tsx` |
| Chat assistant | `src/components/ChatWidget.tsx`, `src/lib/chatbot/` |
| Colours, buttons, animations | `src/app/globals.css` |
| Brand logos / range images / hero | `public/brands/`, `public/images/` |
| Catalog sync script | `scripts/sync-catalog.mjs` |

URLs match the current Shopify store (`/products/…`, `/collections/…`, `/pages/about-us`), so existing Google rankings
and links keep working after the switch. `sitemap.xml` and `robots.txt` are generated at build time.

## Website assistant (chatbot)

The chat button (bottom-right) opens the Al Faiz assistant. It runs fully in the visitor's browser —
no API keys, no server, no running cost:

- `public/chatbot/` holds the trained model: `minilm-q8-v1.onnx` (sentence model), `bank-v1.json`
  (pre-embedded example questions for 88 intents), `vocab-v1.txt` and the ONNX Runtime files in `ort-1.30/`.
  They download only when someone opens the chat (~38 MB, cached by the browser).
- `src/lib/chatbot/brain.ts` is what the assistant says: answers for every intent, the tool finder
  ("drilling concrete" → products) and the product search. Edit the text there.
- It only talks about this website. It never gives prices — price questions are handed to the sales team —
  and off-topic questions are politely declined.
- While the model loads (or if a browser can't run it) simple keyword answers are used instead.
- `public/.htaccess` sets the right file types for `.mjs` / `.wasm` on Hostinger. Keep it when you upload `out/`.

## Still to fill in

- Opening hours: `site.hours` in `src/data/site.ts` (currently `[OPENING HOURS]`).
- Prices: every product in Shopify is priced at 0, so the site shows **Price on request**. Set real prices in Shopify,
  run `npm run sync`, and they appear automatically.
- Product images load from Shopify's CDN. If the Shopify store is ever closed, download the images first.
