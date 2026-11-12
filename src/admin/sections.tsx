'use client';
// What can be edited in each home-page section / settings page, and how it is checked before saving.

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ContentKey } from '@/data/content';
import type { FieldDef, ListDef } from './fields';
import { slugify } from './sb';
import { firstImage, getState } from './store';

export type SectionDef = {
  key: ContentKey;
  title: string;
  desc: string;
  /** where it shows on the website */
  where: string;
  fields?: FieldDef[];
  list?: ListDef;
  /** tidy up before saving; return a message to stop the save */
  clean?: (v: any) => { value: any; error?: string };
};

const productName = (h: string) => getState().products.find((p) => p.handle === h)?.name ?? '';
const productImg = (h: string) => firstImage(getState().products.find((p) => p.handle === h));
const colTitle = (h: string) => getState().collections.find((c) => c.handle === h)?.title ?? h;

const dropEmpty = <T,>(arr: T[], ok: (x: T) => boolean) => (Array.isArray(arr) ? arr.filter(ok) : []);

export const sections: SectionDef[] = [
  {
    key: 'hero',
    title: 'Hero',
    desc: 'The full-width slides at the top of the home page — one per category. Each has a background photo that shows the products, the headline and a “Get a quote” button.',
    where: '/#hero-title',
    fields: [
      {
        type: 'list',
        name: 'slides',
        label: 'Slides',
        help: 'Shown in this order; they change every 6.5 seconds. 4–6 slides work well.',
        max: 10,
        addLabel: 'Add slide',
        newItem: () => ({ label: '', title1: '', title2: '', text: '', image: '', focus: 'right', collection: '' }),
        itemLabel: (v) => [v.title1, v.title2].filter(Boolean).join(' '),
        itemImage: (v) => v.image,
        item: [
          { type: 'image', name: 'image', label: 'Background photo', folder: 'hero', cover: true, help: 'Wide photo (at least 1600 × 800) with the products in the right half — the text sits on the left.' },
          {
            type: 'select',
            name: 'focus',
            label: 'On phones, keep this part of the photo',
            half: true,
            options: [
              { value: 'right', label: 'Right' },
              { value: 'center', label: 'Middle' },
              { value: 'left', label: 'Left' },
            ],
          },
          { type: 'collection', name: 'collection', label: '“Explore” button opens', kind: 'category', half: true },
          { type: 'text', name: 'label', label: 'Small line above the headline', placeholder: 'Power Tools · DeWALT, Makita, Bosch' },
          { type: 'text', name: 'title1', label: 'Headline — first line', half: true },
          { type: 'text', name: 'title2', label: 'Headline — second line (red)', half: true },
          { type: 'textarea', name: 'text', label: 'Text under the headline' },
        ],
      },
    ],
    clean: (v) => {
      const slides = dropEmpty(v.slides, (x: any) => !!x.title1?.trim() || !!x.image);
      for (const [i, x] of slides.entries()) {
        if (!x.image) return { value: v, error: `Slide ${i + 1} needs a background photo.` };
        if (!x.title1?.trim()) return { value: v, error: `Slide ${i + 1} needs a headline.` };
      }
      return { value: { slides: slides.map((x: any) => ({ ...x, focus: x.focus || 'center' })) }, error: slides.length ? undefined : 'Add at least one slide.' };
    },
  },
  {
    key: 'trust',
    title: 'Trust strip',
    desc: 'The four short promises under the hero (genuine brands, delivery, export, payment).',
    where: '/#about',
    list: {
      type: 'list',
      name: 'trust',
      label: 'Items',
      max: 4,
      addLabel: 'Add item',
      newItem: () => ({ icon: 'check', title: '', short: '', text: '' }),
      itemLabel: (v) => v.title,
      item: [
        { type: 'icon', name: 'icon', label: 'Icon', half: true },
        { type: 'text', name: 'title', label: 'Title', half: true },
        { type: 'text', name: 'short', label: 'Small line under the title' },
      ],
    },
    clean: (v) => ({ value: dropEmpty(v, (x: any) => !!x.title?.trim()).map((x: any) => ({ ...x, text: x.text || x.short })) }),
  },
  {
    key: 'brands',
    title: 'Brands strip',
    desc: 'The moving row of brand logos. Each logo opens that brand’s page. Also used on the About page and by the chat assistant.',
    where: '/#brands',
    list: {
      type: 'list',
      name: 'brands',
      label: 'Brands',
      addLabel: 'Add brand',
      newItem: () => ({ handle: '', name: '', logo: '' }),
      itemLabel: (v) => v.name || colTitle(v.handle),
      itemImage: (v) => v.logo || (v.handle ? `/brands/${v.handle}.png` : ''),
      item: [
        { type: 'collection', name: 'handle', label: 'Brand page', kind: 'brand', half: true, help: 'Add new brands in Categories & brands first.' },
        { type: 'text', name: 'name', label: 'Name shown', half: true },
        { type: 'image', name: 'logo', label: 'Logo', folder: 'brands', help: 'PNG with a transparent background works best. Leave empty to keep the built-in logo.' },
      ],
    },
    clean: (v) => ({ value: dropEmpty(v, (x: any) => !!x.handle).map((x: any) => ({ handle: x.handle, name: x.name?.trim() || colTitle(x.handle), ...(x.logo ? { logo: x.logo } : {}) })) }),
  },
  {
    key: 'categories',
    title: 'Shop by category',
    desc: 'The category tiles on the home page, in order.',
    where: '/#cats-title',
    list: {
      type: 'list',
      name: 'categories',
      label: 'Category tiles',
      addLabel: 'Add category tile',
      newItem: () => ({ handle: '', title: '', image: '' }),
      itemLabel: (v) => v.title || colTitle(v.handle),
      itemImage: (v) => v.image,
      item: [
        { type: 'collection', name: 'handle', label: 'Category', kind: 'category', half: true },
        { type: 'text', name: 'title', label: 'Name shown', half: true },
        { type: 'image', name: 'image', label: 'Tile photo', folder: 'categories', help: 'Square photos on a white background look best. Leave empty to use the first product photo.' },
      ],
    },
    clean: (v) => ({ value: dropEmpty(v, (x: any) => !!x.handle).map((x: any) => ({ handle: x.handle, title: x.title?.trim() || colTitle(x.handle), ...(x.image ? { image: x.image } : {}) })) }),
  },
  {
    key: 'brandEdit',
    title: 'The Brand Edit',
    desc: 'The swipeable brand spreads: one brand per slide with three key tools.',
    where: '/#edit-title',
    list: {
      type: 'list',
      name: 'brandEdit',
      label: 'Brand slides',
      max: 10,
      addLabel: 'Add brand slide',
      newItem: () => ({ brand: '', name: '', note: '', products: [] }),
      itemLabel: (v) => v.name || colTitle(v.brand),
      item: [
        { type: 'collection', name: 'brand', label: 'Brand', kind: 'brand', half: true },
        { type: 'text', name: 'name', label: 'Name shown', half: true },
        { type: 'textarea', name: 'note', label: 'One-line description' },
        {
          type: 'list',
          name: 'products',
          label: 'Key tools (3)',
          max: 3,
          addLabel: 'Add tool',
          newItem: () => ({ handle: '', label: '', spec: '' }),
          itemLabel: (v) => v.label || productName(v.handle),
          itemImage: (v) => productImg(v.handle),
          item: [
            { type: 'product', name: 'handle', label: 'Product' },
            { type: 'text', name: 'label', label: 'Title', half: true, help: 'e.g. “Demolition hammer”' },
            { type: 'text', name: 'spec', label: 'Key specs', half: true, help: 'e.g. “18kg · 28mm HEX · 1800W”' },
          ],
        },
      ],
    },
    clean: (v) => ({
      value: dropEmpty(v, (x: any) => !!x.brand).map((x: any) => ({ ...x, name: x.name?.trim() || colTitle(x.brand), products: dropEmpty(x.products, (p: any) => !!p.handle) })),
    }),
  },
  {
    key: 'industries',
    title: 'Industries we serve',
    desc: 'The industry cards on the home page. Each industry has its own page listing the products tagged with it (tag products in Products → Industries).',
    where: '/#ind-title',
    list: {
      type: 'list',
      name: 'industries',
      label: 'Industries',
      addLabel: 'Add industry',
      newItem: () => ({ slug: '', icon: 'box', title: '', text: '', image: '', cats: [] }),
      itemLabel: (v) => v.title,
      itemImage: (v) => v.image,
      item: [
        { type: 'text', name: 'title', label: 'Name', half: true },
        { type: 'text', name: 'slug', label: 'Page address', half: true, help: 'alfaizhardware.com/industries/… — leave empty to make it from the name. Changing it changes the link.' },
        { type: 'textarea', name: 'text', label: 'Short description' },
        { type: 'image', name: 'image', label: 'Photo', folder: 'industries', cover: true, help: 'Landscape photo (4:3), at least 720 × 540.' },
        { type: 'icon', name: 'icon', label: 'Icon (About page)', half: true },
        { type: 'collections', name: 'cats', label: 'Categories for this industry', kind: 'category', help: 'Shown on the industry page while no products are tagged with this industry.' },
      ],
    },
    clean: (v) => {
      const items = dropEmpty(v, (x: any) => !!x.title?.trim()).map((x: any) => ({ ...x, slug: slugify(x.slug || x.title), cats: x.cats || [] }));
      const seen = new Set<string>();
      for (const x of items) {
        if (seen.has(x.slug)) return { value: v, error: `Two industries use the page address “${x.slug}”. Change one of them.` };
        seen.add(x.slug);
        if (!x.image) return { value: v, error: `Add a photo for “${x.title}”.` };
      }
      return { value: items };
    },
  },
  {
    key: 'reviews',
    title: 'Testimonials',
    desc: 'Customer reviews in the moving testimonials section.',
    where: '/',
    list: {
      type: 'list',
      name: 'reviews',
      label: 'Reviews',
      addLabel: 'Add review',
      newItem: () => ({ name: '', text: '' }),
      itemLabel: (v) => (v.name ? `${v.name} — ${String(v.text || '').slice(0, 50)}` : ''),
      item: [
        { type: 'text', name: 'name', label: 'Customer name' },
        { type: 'textarea', name: 'text', label: 'Review' },
      ],
    },
    clean: (v) => ({ value: dropEmpty(v, (x: any) => !!x.name?.trim() && !!x.text?.trim()) }),
  },
  {
    key: 'faqs',
    title: 'FAQ (home page)',
    desc: 'Questions at the bottom of the home page. The chat assistant also answers from these.',
    where: '/#faq',
    list: {
      type: 'list',
      name: 'faqs',
      label: 'Questions',
      addLabel: 'Add question',
      newItem: () => ({ q: '', a: '' }),
      itemLabel: (v) => v.q,
      item: [
        { type: 'text', name: 'q', label: 'Question' },
        { type: 'textarea', name: 'a', label: 'Answer' },
      ],
    },
    clean: (v) => ({ value: dropEmpty(v, (x: any) => !!x.q?.trim() && !!x.a?.trim()) }),
  },
  {
    key: 'faqGroups',
    title: 'FAQ page',
    desc: 'The full FAQ page, grouped by topic.',
    where: '/pages/faq/',
    list: {
      type: 'list',
      name: 'faqGroups',
      label: 'Topics',
      addLabel: 'Add topic',
      newItem: () => ({ id: '', title: '', icon: 'shield', items: [] }),
      itemLabel: (v) => (v.title ? `${v.title} (${(v.items || []).length})` : ''),
      item: [
        { type: 'text', name: 'title', label: 'Topic', half: true },
        {
          type: 'select',
          name: 'icon',
          label: 'Icon',
          half: true,
          options: [
            { value: 'cart', label: 'Cart' },
            { value: 'truck', label: 'Delivery truck' },
            { value: 'card', label: 'Payment card' },
            { value: 'shield', label: 'Shield' },
            { value: 'pin', label: 'Map pin' },
          ],
        },
        {
          type: 'list',
          name: 'items',
          label: 'Questions',
          addLabel: 'Add question',
          newItem: () => ({ q: '', a: '' }),
          itemLabel: (v) => v.q,
          item: [
            { type: 'text', name: 'q', label: 'Question' },
            { type: 'textarea', name: 'a', label: 'Answer' },
          ],
        },
      ],
    },
    clean: (v) => ({
      value: dropEmpty(v, (g: any) => !!g.title?.trim()).map((g: any) => ({ ...g, id: g.id || slugify(g.title), items: dropEmpty(g.items, (x: any) => !!x.q?.trim() && !!x.a?.trim()) })),
    }),
  },
  {
    key: 'footer',
    title: 'Footer links',
    desc: 'The “Product ranges” links in the footer.',
    where: '/',
    list: {
      type: 'list',
      name: 'footer',
      label: 'Links',
      addLabel: 'Add link',
      newItem: () => ({ handle: '', title: '' }),
      itemLabel: (v) => v.title || colTitle(v.handle),
      item: [
        { type: 'collection', name: 'handle', label: 'Category', kind: 'category', half: true },
        { type: 'text', name: 'title', label: 'Text shown', half: true },
      ],
    },
    clean: (v) => ({ value: dropEmpty(v, (x: any) => !!x.handle).map((x: any) => ({ handle: x.handle, title: x.title?.trim() || colTitle(x.handle) })) }),
  },
  {
    key: 'settings',
    title: 'Contact & settings',
    desc: 'Phone, WhatsApp, emails, address and the top announcement bar — used across the whole website.',
    where: '/pages/contact/',
    fields: [
      { type: 'text', name: 'phone', label: 'Phone (shown)', half: true, placeholder: '+971 55 858 4900' },
      { type: 'text', name: 'whatsapp', label: 'WhatsApp number', half: true, help: 'Digits with country code, no + or spaces (e.g. 971558584900). All “Get a quote” buttons open this chat.' },
      { type: 'text', name: 'email', label: 'Main email', half: true },
      { type: 'text', name: 'email2', label: 'Second email', half: true },
      { type: 'text', name: 'street', label: 'Street address' },
      { type: 'text', name: 'city', label: 'City', half: true },
      { type: 'text', name: 'country', label: 'Country', half: true },
      { type: 'text', name: 'hours', label: 'Opening hours', help: 'e.g. “Sat–Thu 8:00 am – 8:00 pm, Friday closed”.' },
      { type: 'text', name: 'mapsUrl', label: 'Google Maps link', help: 'Opens when someone taps “Get directions”.' },
      { type: 'text', name: 'mapEmbed', label: 'Google Maps embed link', help: 'The map shown on the Contact page (must start with https://).' },
      { type: 'text', name: 'instagram', label: 'Instagram link', half: true },
      { type: 'text', name: 'instagramHandle', label: 'Instagram name', half: true, placeholder: '@alfaiz.tools' },
      { type: 'strings', name: 'announcements', label: 'Top bar messages', help: 'The bar at the very top of every page rotates through these.' },
      { type: 'number', name: 'since', label: 'In business since (year)', half: true },
      { type: 'strings', name: 'exportCountries', label: 'Export countries', help: 'Used in the FAQ and About texts.' },
      { type: 'strings', name: 'popularSearches', label: 'Popular searches', help: 'Suggestions shown in the search box.' },
      { type: 'text', name: 'name', label: 'Business name', half: true },
      { type: 'text', name: 'legal', label: 'Legal name', half: true },
    ],
    clean: (v) => {
      const whatsapp = String(v.whatsapp || '').replace(/\D/g, '');
      if (whatsapp.length < 9) return { value: v, error: 'WhatsApp number looks too short — use the full number with country code.' };
      for (const k of ['mapsUrl', 'mapEmbed', 'instagram']) if (v[k] && !/^https:\/\//.test(v[k])) return { value: v, error: 'Links must start with https://' };
      return {
        value: {
          ...v,
          whatsapp,
          since: Number(v.since) || 2019,
          announcements: (v.announcements || []).map((s: string) => s.trim()).filter(Boolean),
          exportCountries: (v.exportCountries || []).map((s: string) => s.trim()).filter(Boolean),
          popularSearches: (v.popularSearches || []).map((s: string) => s.trim()).filter(Boolean),
        },
      };
    },
  },
];

export const sectionByKey = (k: string) => sections.find((s) => s.key === k);
