# Products & content in Supabase — and the admin panel

Products, brands, categories and every home-page section come from Supabase.
Hasan edits them in the **admin panel** at `/admin/` (e.g. https://www.alfaizhardware.com/admin/).

## Admin panel

**What it edits**

| Menu | What |
| --- | --- |
| Products | Add / edit / hide / delete products: name, brand, categories, photos (upload), description, in stock, featured, industries |
| Categories & brands | Add / rename / hide brands and categories, their image and description |
| Home page → Hero (full-width slides, one per category), Trust strip, Brands strip, Shop by category, Featured products, The Brand Edit, Industries, Testimonials, FAQ | Every home section (texts, order, products, photos, logos) |
| Other pages → Blog | Write, edit, hide or delete blog articles (cover photo, photos inside the text) — shown at `/blog/`, linked in the footer |
| Other pages → FAQ page, Footer links | Full FAQ page and footer range links |
| Website → Contact & settings | Phone, WhatsApp, emails, address, map, Instagram, top-bar messages, export countries |
| Website → Publish | Rebuilds the website so the saved changes go live (about 1–2 minutes) |

**Save vs Publish.** *Save* stores a change in Supabase. *Publish* rebuilds the static website on Vercel, which downloads everything first.

### One-time setup (developer)

1. **Database:** already applied. To recreate: Supabase → SQL Editor → paste `supabase/schema.sql` → Run.
2. **Hasan's login:** Supabase → Authentication → Users → **Add user → Create new user** → email `alfaizinfo@gmail.com`,
   a password, tick **Auto Confirm User**. Only emails in the `admins` table can edit. To allow another email:
   `insert into public.admins (email) values ('name@example.com');`
3. **Turn off public sign-ups:** Supabase → Authentication → Sign In / Providers → **Allow new users to sign up: off**
   (strangers couldn't edit anyway, but there's no reason to let them create logins).
4. **Vercel:** import the project (framework Next.js, build `npm run build`, output `out`). No environment variables are
   needed — the public Supabase URL + publishable key are in the code. Then Vercel → Settings → Git → **Deploy Hooks** →
   create “Admin publish” on `main` → copy the URL → paste it in the admin under **Publish**.
5. Forgot password: reset it in Supabase → Authentication → Users → the user → **Send password recovery** or set a new one.

### How it fits together

- `src/data/content.ts` — shape + default value of every editable section (what the site looked like when built).
- `site_content` table — one row per edited section (`hero`, `brands`, `settings` …). No row = default is used.
  Admin → section → **Reset to original** deletes that row.
- `scripts/supabase-pull.mjs` (runs before every `dev` / `build`) writes `data/catalog.json`, `public/search-index.json`
  and `data/content.json`; `src/data/site.ts` merges `content.json` over the defaults.
- Images uploaded in the admin go to Storage → `product-images` (`products/…`, `brands/…`, `categories/…`, `industries/…`).
- Security: row level security — everyone can read published data; only signed-in emails listed in `admins` can write.
  Descriptions are cleaned (`scripts/lib-html.mjs`) before they reach the site; only `https://` links are used from settings.

## Keeping Supabase egress low (free plan: 5 GB / month)

| Where | What happens |
| --- | --- |
| `npm run dev` / `npm run build` | First a tiny check (row counts + last edit time, a few hundred bytes). **Nothing is downloaded unless something changed** since the last download (`data/.supabase-stamp.json`). |
| Photos uploaded in the admin | Copied **once** into `public/media/` (kept in `.next/cache/af-media`, which Vercel keeps between builds). The website uses the copies, so visitors never load images from Supabase. |
| Admin panel | Product / category lists are kept in the browser; each visit downloads only rows edited since the last visit. Dashboard → **Reload all data** forces a full reload. |

Commands:

- `npm run supabase:pull` — download everything now, even if nothing changed.
- `npm run dev:offline` — start without contacting Supabase at all (uses the last downloaded data).

## Keys

The project URL and **publishable** key are public and live in `scripts/lib-env.mjs` and `src/admin/sb.ts` —
enough to read data and to run the admin (sign-in protects writing).

`.env.local` is only needed for `npm run supabase:push` (bulk upload of `data/catalog.json`):
```
SUPABASE_URL=https://gwtpayzrhcgvdppmcixy.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
```
Never commit this file and never rename the secret key to `NEXT_PUBLIC_...` — it can edit everything.

## Editing directly in Supabase (still works)

| You want to… | Supabase → Table Editor |
| --- | --- |
| Hide a product | `products` → `published` = `false` |
| Put a product under an **industry** | `products` → `industries`, e.g. `{construction,oil-gas}` |
| Featured products | `products` → `featured` + `featured_rank` (1 = first, up to 8 shown) |
| Change a home section | `site_content` → edit the JSON of that key (easier in the admin) |

If Supabase can't be reached during a build, the last downloaded files are used, so builds never break.
