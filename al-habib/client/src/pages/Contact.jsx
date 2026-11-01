import { useState } from 'react';
import toast from 'react-hot-toast';
import { Clock, ExternalLink, MapPin, MessageCircle, Phone } from 'lucide-react';
import Field from '../components/common/Field.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { waLink } from '../utils/whatsapp.js';

export default function Contact() {
  const { settings: s } = useSettings();
  usePageTitle('Contact Us', 'Contact Al-Habib Sweets & Bakers: phone, WhatsApp, address and opening hours.');
  const [f, setF] = useState({ name: '', message: '' });
  const [errors, setErrors] = useState({});
  const wa = waLink(s.whatsappNumber);
  const tel = s.contactNumber?.replace(/[^\d+]/g, '');
  const social = Object.entries(s.socialLinks || {}).filter(([, v]) => v);
  const configured = s.contactNumber || s.address || s.openingHours || s.googleMapsUrl || wa;

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'Please enter your name.';
    if (f.message.trim().length < 5) er.message = 'Please write your message.';
    setErrors(er);
    if (Object.keys(er).length) return;
    const link = waLink(s.whatsappNumber, `${s.whatsappGreeting || 'Assalam-o-Alaikum!'}\n\nName: ${f.name.trim()}\nMessage: ${f.message.trim()}`);
    if (!link) return toast.error('WhatsApp is not set up yet.');
    window.open(link, '_blank', 'noopener,noreferrer'); // nothing is stored on our side
    toast('WhatsApp opened. Your message is sent only when you press send there.', { duration: 6000 });
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-2">
      <section>
        <h1 className="text-4xl">Contact Us</h1>
        {!configured && <p className="card mt-6 p-5 text-choc/80">The shop's contact details have not been added yet. Please check back soon.</p>}
        <ul className="mt-6 space-y-4">
          {s.contactNumber && <li className="flex gap-3"><Phone className="mt-1 shrink-0 text-caramel" /><div><p className="font-bold">Phone</p><a className="underline" href={`tel:${tel}`}>{s.contactNumber}</a></div></li>}
          {wa && <li className="flex gap-3"><MessageCircle className="mt-1 shrink-0 text-caramel" /><div><p className="font-bold">WhatsApp</p><a className="underline" href={wa} target="_blank" rel="noreferrer">Chat with us</a></div></li>}
          {s.address && <li className="flex gap-3"><MapPin className="mt-1 shrink-0 text-caramel" /><div><p className="font-bold">Address</p><p className="whitespace-pre-line">{s.address}</p>{s.googleMapsUrl && <a className="inline-flex items-center gap-1 underline" href={s.googleMapsUrl} target="_blank" rel="noreferrer">Open in Google Maps <ExternalLink size={14} /></a>}</div></li>}
          {!s.address && s.googleMapsUrl && <li className="flex gap-3"><MapPin className="mt-1 shrink-0 text-caramel" /><a className="underline" href={s.googleMapsUrl} target="_blank" rel="noreferrer">Find us on Google Maps</a></li>}
          {s.openingHours && <li className="flex gap-3"><Clock className="mt-1 shrink-0 text-caramel" /><div><p className="font-bold">Opening hours</p><p className="whitespace-pre-line">{s.openingHours}</p></div></li>}
          {social.length > 0 && <li className="flex flex-wrap gap-4">{social.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noreferrer" className="font-bold capitalize underline">{k}</a>)}</li>}
        </ul>
        {s.pickupInstructions && <p className="card mt-6 p-4"><span className="font-bold">Pickup: </span>{s.pickupInstructions}</p>}
      </section>

      <form onSubmit={submit} noValidate className="card h-fit space-y-4 p-5">
        <h2 className="text-2xl">Send us a message</h2>
        <Field label="Your name" error={errors.name}><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" maxLength={80} /></Field>
        <Field label="Message" error={errors.message}><textarea rows={4} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={800} /></Field>
        {!wa && <p role="alert" className="rounded-xl bg-caramel/20 p-3 text-sm">Messaging is not set up yet because the shop has not added a WhatsApp number.</p>}
        <button className="btn-primary w-full disabled:opacity-50" disabled={!wa}><MessageCircle size={18} /> Continue on WhatsApp</button>
        <p className="text-xs text-choc/70">This opens WhatsApp with your message ready to send. We do not store it.</p>
      </form>
    </div>
  );
}
