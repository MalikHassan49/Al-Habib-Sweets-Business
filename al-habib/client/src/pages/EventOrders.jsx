import { useState } from 'react';
import toast from 'react-hot-toast';
import { MessageCircle, PartyPopper } from 'lucide-react';
import Field from '../components/common/Field.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { buildEventMessage, localNow, validPhone, waLink } from '../utils/whatsapp.js';

const TYPES = ['Wedding', 'Engagement', 'Birthday', 'Anniversary', 'Family gathering', 'Corporate event', 'School function', 'Religious gathering', 'Ramadan', 'Laylat al-Qadr', 'Eid', 'Mosque gathering', 'Other'];

export default function EventOrders() {
  usePageTitle('Special Event Orders');
  const { settings } = useSettings();
  const [f, setF] = useState({ name: '', phone: '', eventType: TYPES[0], eventDate: '', items: '', budget: '', pickup: '', notes: '' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const wa = waLink(settings.whatsappNumber);

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (!validPhone(f.phone)) er.phone = 'Enter a valid phone number (10 to 15 digits).';
    if (!f.eventDate) er.eventDate = 'Choose the event date.';
    else if (f.eventDate < localNow().slice(0, 10)) er.eventDate = 'The event date cannot be in the past.';
    if (f.items.trim().length < 5) er.items = 'Tell us what you need, for example "5 kg laddoo, 2 cakes of 2 lb".';
    setErrors(er);
    if (Object.keys(er).length) return;
    const link = waLink(settings.whatsappNumber, buildEventMessage({ greeting: settings.whatsappGreeting, ...f, name: f.name.trim(), phone: f.phone.trim(), items: f.items.trim(), notes: f.notes.trim() }));
    if (!link) return toast.error('WhatsApp is not set up yet.');
    window.open(link, '_blank', 'noopener,noreferrer');
    toast('WhatsApp opened. Your inquiry is not confirmed until the shop replies.', { duration: 6000 });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <PartyPopper className="text-caramel" size={32} />
      <h1 className="mt-2 text-4xl">Special Event Orders</h1>
      <p className="mt-2 text-lg text-choc/80">For weddings, Eid, Ramadan gatherings, school or corporate events and other large orders. Send us your requirements and the shop will confirm availability and the price with you. Bulk and custom orders are never confirmed automatically, and this version offers pickup only.</p>
      <form onSubmit={submit} noValidate className="card mt-8 grid gap-4 p-6 md:grid-cols-2">
        <Field label="Your name" error={errors.name}><input value={f.name} onChange={set('name')} autoComplete="name" maxLength={80} /></Field>
        <Field label="Phone / WhatsApp number" error={errors.phone}><input value={f.phone} onChange={set('phone')} inputMode="tel" autoComplete="tel" maxLength={20} /></Field>
        <Field label="Event type"><select value={f.eventType} onChange={set('eventType')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Event date" error={errors.eventDate}><input type="date" value={f.eventDate} onChange={set('eventDate')} min={localNow().slice(0, 10)} /></Field>
        <div className="md:col-span-2"><Field label="Products and quantities" error={errors.items} hint="Include weights, cake sizes or packs, e.g. 5 kg laddoo, 2 cakes of 2 lb."><textarea rows={4} value={f.items} onChange={set('items')} maxLength={1500} /></Field></div>
        <Field label="Approximate budget (optional)"><input value={f.budget} onChange={set('budget')} maxLength={40} placeholder="e.g. Rs. 50,000" /></Field>
        <Field label="Preferred pickup time (optional)"><input type="datetime-local" value={f.pickup} onChange={set('pickup')} min={localNow()} /></Field>
        <div className="md:col-span-2"><Field label="Special instructions (optional)"><textarea rows={3} value={f.notes} onChange={set('notes')} maxLength={500} /></Field></div>
        {!wa && <p role="alert" className="rounded-xl bg-caramel/20 p-3 text-sm md:col-span-2">WhatsApp is not set up yet. The shop owner needs to add the WhatsApp number in Settings.</p>}
        <button className="btn-primary disabled:opacity-50 md:col-span-2" disabled={!wa}><MessageCircle size={18} /> Send inquiry on WhatsApp</button>
      </form>
    </div>
  );
}
