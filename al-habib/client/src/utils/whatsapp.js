// Returns null when no number is configured, so callers never open a broken link.
export function waLink(number, text = '') {
  const digits = String(number || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}` : null;
}

import { formatPKR } from './currency.js';

const GREETING = 'Assalam-o-Alaikum Al-Habib Sweets & Bakers!';
const when = (v) => (v ? new Date(v).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : '');
// Local "now" (plus optional hours) in the format datetime-local inputs expect.
export const localNow = (hoursAhead = 0) =>
  new Date(Date.now() + hoursAhead * 3600000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
export const validPhone = (v) => /^\d{10,15}$/.test(String(v).replace(/\D/g, ''));

export function buildOrderMessage({ greeting, name, phone, lines, total, hasUnpriced, pickup, notes }) {
  const rows = lines.map((l, i) => `${i + 1}. ${l.name} — ${l.variantLabel || 'Standard'} — ${l.qty} — ${l.lineTotal != null ? formatPKR(l.lineTotal) : 'price to be confirmed'}`);
  return [
    greeting || GREETING, 'I would like to place an order for pickup.', '',
    `Customer Name: ${name}`, `Contact Number: ${phone}`, '', 'Products:', ...rows, '',
    `Estimated Total: ${formatPKR(total)}${hasUnpriced ? ' (not including items with price to be confirmed)' : ''}`,
    pickup && `Preferred Pickup Time: ${when(pickup)}`, notes && `Special Instructions: ${notes}`, '',
    'Please confirm availability and the final total.', 'I will collect the order from the shop.', 'Thank you!',
  ].filter((x) => x !== '' ? x : true).filter((x) => x !== undefined && x !== false && x !== null).join('\n');
}

export function buildEventMessage({ greeting, name, phone, eventType, eventDate, items, budget, pickup, notes }) {
  return [
    greeting || GREETING, 'I would like to inquire about a special event order (pickup).', '',
    `Customer Name: ${name}`, `Contact Number: ${phone}`, `Event Type: ${eventType}`, `Event Date: ${when(`${eventDate}T00:00`).split(',').slice(0, 2).join(',')}`, '',
    'Required Products and Quantities:', items, '',
    budget && `Approximate Budget: ${budget}`, pickup && `Preferred Pickup Time: ${when(pickup)}`, notes && `Special Instructions: ${notes}`, '',
    'Please let me know availability, the final price and what is needed to confirm.', 'Thank you!',
  ].filter((x) => x !== undefined && x !== false && x !== null).join('\n');
}
