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
  featured     boolean not null default false,       -- shown in the home page "Featured products"
  featured_rank integer not null default 0,          -- order within Featured products (1 = first)
  industries   text[] not null default '{}',         -- e.g. {construction,oil-gas}; see supabase/README.md
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- added after the first setup (safe to run again)
alter table public.products add column if not exists featured boolean not null default false;
alter table public.products add column if not exists featured_rank integer not null default 0;
alter table public.products add column if not exists industries text[] not null default '{}';
create index if not exists products_industries_idx on public.products using gin (industries);

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

-- ---------------------------------------------------------------------------------------------
-- Admin panel (/admin/) — added Nov 2026. Safe to run again.
-- Who can edit: emails in public.admins (with a confirmed Supabase Auth login).
-- What it edits: products, collections, site_content (home sections + settings), images in product-images.

create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "see own admin row" on public.admins;
create policy "see own admin row" on public.admins for select to authenticated
  using (lower(email) = lower((select auth.jwt()) ->> 'email'));

create or replace function public.is_admin() returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(btrim(u.email)) = lower(btrim(a.email, E' \t\r\n'))
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- emails typed in the Table Editor can carry a trailing newline/space: store them clean
create or replace function public.admins_clean_email() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email = lower(btrim(new.email, E' \t\r\n'));
  return new;
end $$;
drop trigger if exists admins_clean_email on public.admins;
create trigger admins_clean_email before insert or update on public.admins
  for each row execute function public.admins_clean_email();

create table if not exists public.site_content (
  key        text primary key,   -- hero, trust, brands, categories, brandEdit, industries, reviews, faqs, faqGroups, footer, settings
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.site_content enable row level security;
drop trigger if exists site_content_touch on public.site_content;
create trigger site_content_touch before update on public.site_content
  for each row execute function public.touch_updated_at();
drop policy if exists "read site content" on public.site_content;
create policy "read site content" on public.site_content for select to anon, authenticated using (true);
drop policy if exists "admins write site content" on public.site_content;
create policy "admins write site content" on public.site_content for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create table if not exists public.admin_settings (
  key        text primary key,   -- vercel_deploy_hook, last_publish
  value      text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.admin_settings enable row level security;
drop trigger if exists admin_settings_touch on public.admin_settings;
create trigger admin_settings_touch before update on public.admin_settings
  for each row execute function public.touch_updated_at();
drop policy if exists "admins manage admin settings" on public.admin_settings;
create policy "admins manage admin settings" on public.admin_settings for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admins manage collections" on public.collections;
create policy "admins manage collections" on public.collections for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "admins list images" on storage.objects;
create policy "admins list images" on storage.objects for select to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
drop policy if exists "admins upload images" on storage.objects;
create policy "admins upload images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
drop policy if exists "admins update images" on storage.objects;
create policy "admins update images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
drop policy if exists "admins delete images" on storage.objects;
create policy "admins delete images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));

insert into public.admins (email) values ('alfaizinfo@gmail.com') on conflict do nothing;

-- ---------------------------------------------------------------------------------------------
-- Blog (/blog/) — added Nov 2026. Written in the admin panel → Blog.
create table if not exists public.posts (
  slug         text primary key,
  title        text not null,
  excerpt      text not null default '',
  cover        text not null default '',
  html         text not null default '',
  author       text not null default 'Al Faiz team',
  tags         text[] not null default '{}',
  published    boolean not null default false,
  published_at timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
alter table public.posts enable row level security;
drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts
  for each row execute function public.touch_updated_at();
create index if not exists posts_published_idx on public.posts (published, published_at desc);
drop policy if exists "read published posts" on public.posts;
create policy "read published posts" on public.posts for select to anon, authenticated using (published);
drop policy if exists "admins manage posts" on public.posts;
create policy "admins manage posts" on public.posts for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
