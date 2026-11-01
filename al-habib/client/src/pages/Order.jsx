import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MessageCircle, Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';
import Field from '../components/common/Field.jsx';
import { useOrder } from '../context/OrderContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { quoteOrder } from '../services/orderService.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { formatPKR } from '../utils/currency.js';
import { buildOrderMessage, localNow, validPhone, waLink } from '../utils/whatsapp.js';

export default function Order() {
  usePageTitle('Your Order');
  const { items, setQty, remove, clear } = useOrder();
  const { settings } = useSettings();
  const [q, setQ] = useState({ loading: false, lines: [], total: 0, hasUnpriced: false, error: null });
  const [form, setForm] = useState({ name: '', phone: '', pickup: '', notes: '' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const sig = JSON.stringify(items.map((i) => [i.productId, i.variantId, i.qty]));

  useEffect(() => {
    if (!items.length) { setQ((s) => ({ ...s, lines: [], total: 0 })); return; }
    let live = true;
    setQ((s) => ({ ...s, loading: true, error: null }));
    quoteOrder(items)
      .then((d) => live && setQ({ ...d, loading: false, error: null }))
      .catch((e) => live && setQ((s) => ({ ...s, loading: false, error: e.response?.data?.message || 'Could not check prices. Please try again.' })));
    return () => { live = false; };
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps

  const wa = waLink(settings.whatsappNumber);
  const lead = settings.pickupScheduling?.enabled ? settings.pickupScheduling.minLeadHours || 0 : 0;
  const blocked = q.loading || !!q.error || q.lines.length !== items.length || q.lines.some((l) => !l.ok);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!validPhone(form.phone)) er.phone = 'Enter a valid phone number (10 to 15 digits).';
    if (form.pickup && form.pickup < localNow(lead)) er.pickup = lead ? `Pickup must be at least ${lead} hour(s) from now.` : 'Pickup time cannot be in the past.';
    setErrors(er);
    if (Object.keys(er).length) return;
    if (blocked) return toast.error('Please fix the items marked in red first.');
    const text = buildOrderMessage({ greeting: settings.whatsappGreeting, name: form.name.trim(), phone: form.phone.trim(), lines: q.lines, total: q.total, hasUnpriced: q.hasUnpriced, pickup: form.pickup, notes: form.notes.trim() });
    const link = waLink(settings.whatsappNumber, text);
    if (!link) return toast.error('WhatsApp is not set up yet.');
    window.open(link, '_blank', 'noopener,noreferrer');
    toast('WhatsApp opened. Your order is not confirmed until the shop replies.', { duration: 6000 });
  };

  if (!items.length) return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-3xl">Your order is empty</h1><p className="mt-2 text-choc/80">Add some mithai, cakes or bakery items to get started.</p><Link to="/products" className="btn-primary mt-6">Browse products</Link></div>
  );

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.4fr_1fr]">
      <section aria-label="Order items">
        <div className="mb-4 flex items-center justify-between"><h1 className="text-4xl">Your Order</h1><button className="text-sm font-bold text-bad underline" onClick={clear}>Clear all</button></div>
        {q.error && <p role="alert" className="card mb-4 p-4 text-bad">{q.error}</p>}
        <ul className="space-y-3">
          {items.map((it, i) => {
            const l = q.lines[i];
            const max = l?.maxQty ?? it.max;
            return (
              <li key={it.key} className={`card p-4 ${l && !l.ok ? 'ring-2 ring-bad' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div><Link to={`/products/${it.slug}`} className="font-bold">{it.name}</Link><p className="text-sm text-choc/70">{it.variantLabel || 'Standard'}{l?.unitPrice != null && ` · ${formatPKR(l.unitPrice)} each`}</p></div>
                  <button aria-label={`Remove ${it.name}`} onClick={() => remove(it.key)} className="p-2 text-bad"><Trash2 size={18} /></button>
                </div>
                {l && !l.ok && <p className="mt-2 flex items-center gap-2 text-sm text-bad"><AlertTriangle size={16} />{l.problem}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center rounded-full border-2 border-beige" role="group" aria-label={`Quantity of ${it.name}`}>
                    <button aria-label="Decrease" className="p-2" disabled={it.qty <= 1} onClick={() => setQty(it.key, it.qty - 1)}><Minus size={16} /></button>
                    <span className="w-9 text-center font-bold">{it.qty}</span>
                    <button aria-label="Increase" className="p-2" disabled={it.qty >= max} onClick={() => setQty(it.key, it.qty + 1)}><Plus size={16} /></button>
                  </div>
                  <p className="font-bold text-choc">{l?.ok ? (l.lineTotal != null ? formatPKR(l.lineTotal) : 'Price to be confirmed') : ''}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-lg font-bold" aria-live="polite">Estimated total: {q.loading ? 'checking prices…' : formatPKR(q.total)}</p>
        <p className="text-sm text-choc/70">Prices and availability are checked with the shop's current data. The shop confirms availability and the final total on WhatsApp.</p>
      </section>

      <form onSubmit={submit} noValidate className="card h-fit space-y-4 p-5">
        <h2 className="text-2xl">Pickup details</h2>
        <Field label="Your name" error={errors.name}><input value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} /></Field>
        <Field label="Phone / WhatsApp number" error={errors.phone}><input value={form.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" maxLength={20} /></Field>
        <Field label="Preferred pickup time (optional)" error={errors.pickup} hint={settings.pickupInstructions}><input type="datetime-local" value={form.pickup} onChange={set('pickup')} min={localNow(lead)} /></Field>
        <Field label="Special instructions (optional)"><textarea rows={3} value={form.notes} onChange={set('notes')} maxLength={500} /></Field>
        {!wa && <p role="alert" className="rounded-xl bg-caramel/20 p-3 text-sm">WhatsApp ordering is not set up yet. The shop owner needs to add the WhatsApp number in Settings.</p>}
        <button className="btn-primary w-full disabled:opacity-50" disabled={!wa || q.loading}><MessageCircle size={18} /> Send order on WhatsApp</button>
        <p className="text-xs text-choc/70">Pickup only. No online payment. Opening WhatsApp does not confirm or reserve your order.</p>
      </form>
    </div>
  );
}
