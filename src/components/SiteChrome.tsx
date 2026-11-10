'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Header, footer, chat and splash belong to the public site — not to the /admin/ panel. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const path = usePathname() || '';
  return path.startsWith('/admin') ? null : <>{children}</>;
}
