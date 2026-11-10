-- Al Faiz Hardware: product catalogue in Supabase.
-- Run once in Supabase → SQL Editor → New query → paste → Run. Safe to run again.
--
-- Editing guide (Supabase → Table Editor):
--   collections  one row per brand or category (kind = 'brand' or 'category')
--   products     one row per product; `collections` lists the brand + category handles it belongs to,
--                e.g. {dewalt,power-tools}. Set published = false to hide a product without deleting it.
-- After editing, run `npm run build` (or restart `npm run dev`): the site pulls the latest data automatically.

create table if not exists public.collections (
  handle      text primary key,
  title       text not null,
  kind        text not null default 'category' check (kind in ('brand', 'category')),
  image       text,
  html        text not null default '',
  sort        integer not null default 0,
  published   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.products (
  handle       text primary key,
  title        text not null,
  name         text not null,
  subtitle     text not null default '',
  brand        text not null default '',
  brand_handle text references public.collections(handle) on update cascade on delete set null,
  type         text not null default '',
  tags         text[] not null default '{}',
  collections  text[] not null default '{}',
  images       jsonb not null default '[]'::jsonb,   -- [{"src": "...", "alt": "", "width": 1000, "height": 1000}]
  price        numeric not null default 0,           -- never shown on the website (quotes only)
  available    boolean not null default true,
  options      jsonb not null default '[]'::jsonb,
  variants     jsonb not null default '[]'::jsonb,
  html         text not null default '',
  summary      text not null default '',
  sort         integer not null default 0,
  published    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists products_collections_idx on public.products using gin (collections);
create index if not exists products_sort_idx on public.products (sort);
create index if not exists products_brand_handle_idx on public.products (brand_handle);

-- keep updated_at current on every edit
create or replace function public.touch_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();
drop trigger if exists collections_touch on public.collections;
create trigger collections_touch before update on public.collections
  for each row execute function public.touch_updated_at();

-- Row level security: anyone may READ published rows; only the secret key (server/scripts) may write.
alter table public.collections enable row level security;
alter table public.products enable row level security;

drop policy if exists "read published collections" on public.collections;
create policy "read published collections" on public.collections
  for select to anon, authenticated using (published);
drop policy if exists "read published products" on public.products;
create policy "read published products" on public.products
  for select to anon, authenticated using (published);

-- Public bucket for new product photos (upload in Storage → product-images, then use the public URL in images).
-- Public buckets serve files by URL without any extra policy.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
