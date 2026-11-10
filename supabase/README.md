# Products in Supabase

The website's products, brands and categories now come from Supabase.

## One-time setup

1. **Create the tables:** Supabase → SQL Editor → New query → paste `supabase/schema.sql` → **Run**.
2. **Keys:** `.env.local` (next to `package.json`) holds:
   ```
   SUPABASE_URL=https://gwtpayzrhcgvdppmcixy.supabase.co
   SUPABASE_SECRET_KEY=sb_secret_...
   ```
   Never commit this file and never rename the key to `NEXT_PUBLIC_...` — the secret key can edit everything.
3. **Upload the current 423 products:** `npm run supabase:push`

## Everyday use

| You want to… | Do this in Supabase → Table Editor |
| --- | --- |
| Edit a product's name, description or photos | `products` → edit the row (`name`, `html`, `images`) |
| Hide a product | `products` → set `published` to `false` |
| Mark out of stock | `products` → set `available` to `false` |
| Put a product in a brand / category | `products` → `collections`, e.g. `{dewalt,power-tools}` |
| Add a new product | `products` → Insert row: `handle` (url name, e.g. `dewalt-dcd996`), `title`, `name`, `brand`, `brand_handle`, `collections`, `images` |
| Add a new photo | Storage → `product-images` → upload → copy URL → put in `images` as `[{"src":"<url>"}]` |
| Add a brand or category | `collections` → Insert row (`handle`, `title`, `kind` = `brand` or `category`) |

Then restart `npm run dev`, or run `npm run build` and upload the `out` folder. The site downloads the latest data from Supabase first every time (`npm run supabase:pull` does it on its own).

If Supabase can't be reached, the site keeps the last downloaded catalogue, so builds never break.
