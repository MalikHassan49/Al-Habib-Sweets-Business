import { useEffect } from 'react';

const DEFAULT_DESC = 'Browse fresh mithai, cakes and bakery items from Al-Habib Sweets & Bakers and prepare your pickup order on WhatsApp.';

// Sets the tab title plus the description / Open Graph tags used by search engines and link previews.
export function usePageTitle(title, description) {
  useEffect(() => {
    const full = title ? `${title} | Al-Habib Sweets & Bakers` : 'Al-Habib Sweets & Bakers';
    const desc = description || DEFAULT_DESC;
    const set = (sel, v) => document.head.querySelector(sel)?.setAttribute('content', v);
    document.title = full;
    set('meta[property="og:title"]', full);
    set('meta[name="description"]', desc);
    set('meta[property="og:description"]', desc);
  }, [title, description]);
}
