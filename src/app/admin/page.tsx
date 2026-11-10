import type { Metadata } from 'next';
import { AdminApp } from '@/admin/AdminApp';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/** /admin/ — website admin panel (runs in the browser; sign-in via Supabase). */
export default function AdminPage() {
  return <AdminApp />;
}
