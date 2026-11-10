'use client';
// Hash routing helpers + error handling shared by the admin views.

import { AuthError } from './sb';
import { toast } from './ui';

/** Links to the public website open on the same address the admin runs on. */
export const SITE = '';

export function go(hash: string, replace = false) {
  if (replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    (window as unknown as { __fzDirty?: boolean }).__fzDirty = false;
    location.hash = hash;
  }
}

/** Show an error; if the session has ended, send the user back to sign-in. */
export function fail(e: unknown) {
  if (e instanceof AuthError) {
    window.dispatchEvent(new Event('fz-auth-lost'));
    toast(e.message, 'error');
    return;
  }
  toast((e as Error)?.message || 'Something went wrong', 'error');
}
