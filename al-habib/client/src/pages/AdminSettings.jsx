import { useState } from 'react';
import toast from 'react-hot-toast';
import Field from '../components/common/Field.jsx';
import ImageUploader from '../components/admin/ImageUploader.jsx';
import { useImageField } from '../hooks/useImageField.js';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { getSettings } from '../services/catalogService.js';
import { saveSettings } from '../services/adminService.js';
import { errMsg } from '../services/api.js';

const SOCIAL = ['facebook', 'instagram', 'tiktok', 'youtube'];

function Form({ s }) {
  const { reload } = useSettings();
  const [f, setF] = useState({
    businessName: s.businessName || '', description: s.description || '', announcement: s.announcement || '', aboutContent: s.aboutContent || '',
    whatsappNumber: s.whatsappNumber || '', contactNumber: s.contactNumber || '', address: s.address || '', openingHours: s.openingHours || '', googleMapsUrl: s.googleMapsUrl || '',
    pickupInstructions: s.pickupInstructions || '', whatsappGreeting: s.whatsappGreeting || '',
    schedEnabled: !!s.pickupScheduling?.enabled, minLeadHours: s.pickupScheduling?.minLeadHours ?? 2,
    ...Object.fromEntries(SOCIAL.map((k) => [k, s.socialLinks?.[k] || ''])),
  });
  const logo = useImageField({ url: s.logoUrl || '', fileId: s.logoFileId || '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      businessName: f.businessName.trim(), description: f.description.trim(), announcement: f.announcement.trim(), aboutContent: f.aboutContent.trim(),
      whatsappNumber: f.whatsappNumber, contactNumber: f.contactNumber.trim(), address: f.address.trim(), openingHours: f.openingHours.trim(), googleMapsUrl: f.googleMapsUrl.trim(),
      pickupInstructions: f.pickupInstructions.trim(), whatsappGreeting: f.whatsappGreeting.trim(), logoUrl: logo.image.url, logoFileId: logo.image.fileId,
      socialLinks: Object.fromEntries(SOCIAL.map((k) => [k, f[k].trim()])),
      pickupScheduling: { enabled: f.schedEnabled, minLeadHours: Number(f.minLeadHours) || 0 },
    };
    try { await saveSettings(body); logo.committed(); reload(); toast.success('Settings saved'); }
    catch (x) { toast.error(errMsg(x)); } finally { setBusy(false); }
  };
  const box = 'card space-y-4 p-5';
  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      <section className={box}><h2 className="text-2xl">Business</h2>
        <Field label="Business name"><input value={f.businessName} onChange={set('businessName')} maxLength={1000} /></Field>
        <Field label="Short description" hint="Shown on the home page and footer."><textarea rows={2} value={f.description} onChange={set('description')} /></Field>
        <Field label="Announcement banner (optional)" hint="Shown at the top of every page. Leave empty to hide."><input value={f.announcement} onChange={set('announcement')} /></Field>
        <Field label="About Us text (optional)" hint="Added to the About page. Only write facts you want to publish."><textarea rows={5} value={f.aboutContent} onChange={set('aboutContent')} maxLength={4000} /></Field>
        <ImageUploader field={logo} label="Logo" />
      </section>
      <section className={box}><h2 className="text-2xl">Contact and location</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="WhatsApp number" hint="Country code first, digits only (92XXXXXXXXXX). Needed for ordering."><input value={f.whatsappNumber} onChange={set('whatsappNumber')} inputMode="numeric" /></Field>
          <Field label="Phone number"><input value={f.contactNumber} onChange={set('contactNumber')} /></Field>
        </div>
        <Field label="Shop address"><textarea rows={2} value={f.address} onChange={set('address')} /></Field>
        <Field label="Opening hours"><textarea rows={2} value={f.openingHours} onChange={set('openingHours')} /></Field>
        <Field label="Google Maps link" hint="Full https link to your shop on Google Maps."><input type="url" value={f.googleMapsUrl} onChange={set('googleMapsUrl')} /></Field>
      </section>
      <section className={box}><h2 className="text-2xl">Social links</h2>
        <div className="grid gap-4 md:grid-cols-2">{SOCIAL.map((k) => <Field key={k} label={k[0].toUpperCase() + k.slice(1)}><input type="url" value={f[k]} onChange={set(k)} placeholder="https://" /></Field>)}</div>
      </section>
      <section className={box}><h2 className="text-2xl">Pickup and WhatsApp</h2>
        <Field label="Pickup instructions" hint="Shown under the pickup time field when customers order."><textarea rows={2} value={f.pickupInstructions} onChange={set('pickupInstructions')} /></Field>
        <Field label="WhatsApp greeting" hint="First line of every WhatsApp message."><input value={f.whatsappGreeting} onChange={set('whatsappGreeting')} /></Field>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5" checked={f.schedEnabled} onChange={(e) => setF({ ...f, schedEnabled: e.target.checked })} /> Require advance notice for pickup</label>
        {f.schedEnabled && <Field label="Minimum notice (hours)"><input type="number" min="0" max="168" value={f.minLeadHours} onChange={set('minLeadHours')} /></Field>}
      </section>
      <button className="btn-primary disabled:opacity-50" disabled={busy || logo.uploading}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  );
}

export default function AdminSettings() {
  usePageTitle('Settings');
  const { data, loading, error } = useFetch(getSettings, []);
  return (
    <div><h1 className="mb-6 text-4xl">Settings</h1>
      {loading ? <p aria-busy="true">Loading…</p> : error ? <p role="alert" className="text-bad">{error}</p> : <Form s={data} />}
    </div>
  );
}
