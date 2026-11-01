import { useState } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import Field from '../components/common/Field.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import ImageUploader from '../components/admin/ImageUploader.jsx';
import { useImageField } from '../hooks/useImageField.js';
import { useFetch } from '../hooks/useFetch.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getCategories } from '../services/catalogService.js';
import { saveCategory, deleteCategory } from '../services/adminService.js';
import { errMsg } from '../services/api.js';

function CategoryForm({ cat, onDone }) {
  const [f, setF] = useState({ name: cat?.name || '', slug: cat?.slug || '', description: cat?.description || '', displayOrder: cat?.displayOrder ?? 0, isActive: cat?.isActive ?? true });
  const img = useImageField({ url: cat?.imageUrl || '', fileId: cat?.imageFileId || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (f.name.trim().length < 2) return setErrors({ name: 'Name must be at least 2 characters.' });
    setErrors({}); setBusy(true);
    const body = { name: f.name.trim(), description: f.description.trim(), displayOrder: Number(f.displayOrder) || 0, isActive: f.isActive, imageUrl: img.image.url, imageFileId: img.image.fileId };
    if (f.slug.trim()) body.slug = f.slug.trim();
    try {
      await saveCategory(cat?._id, body);
      img.committed();
      toast.success(cat ? 'Category updated' : 'Category created');
      onDone(true);
    } catch (x) { toast.error(errMsg(x)); } finally { setBusy(false); }
  };
  const cancel = () => { img.abandon(); onDone(false); };

  return (
    <form onSubmit={submit} noValidate className="card mb-6 grid gap-4 p-5 md:grid-cols-2">
      <h2 className="text-2xl md:col-span-2">{cat ? 'Edit category' : 'New category'}</h2>
      <Field label="Name" error={errors.name}><input value={f.name} onChange={set('name')} maxLength={80} /></Field>
      <Field label="Slug (optional)" hint="Used in the web address. Leave empty to generate it."><input value={f.slug} onChange={set('slug')} maxLength={80} /></Field>
      <div className="md:col-span-2"><Field label="Description"><textarea rows={2} value={f.description} onChange={set('description')} maxLength={500} /></Field></div>
      <Field label="Display order" hint="Lower numbers show first."><input type="number" min="0" value={f.displayOrder} onChange={set('displayOrder')} /></Field>
      <label className="flex items-center gap-2 self-end pb-3 font-bold"><input type="checkbox" className="h-5 w-5" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active (visible to customers)</label>
      <div className="md:col-span-2"><ImageUploader field={img} label="Category image" /></div>
      <div className="flex gap-3 md:col-span-2">
        <button className="btn-primary disabled:opacity-50" disabled={busy || img.uploading}>{busy ? 'Saving…' : 'Save'}</button>
        <button type="button" className="btn-outline" onClick={cancel}>Cancel</button>
      </div>
    </form>
  );
}

export default function AdminCategories() {
  usePageTitle('Categories');
  const [version, setVersion] = useState(0);
  const { data, loading, error } = useFetch(getCategories, [version]);
  const [editing, setEditing] = useState(null); // null | 'new' | category
  const [toDelete, setToDelete] = useState(null);

  const done = (changed) => { setEditing(null); if (changed) setVersion((v) => v + 1); };
  const confirmDelete = async () => {
    try { await deleteCategory(toDelete._id); toast.success('Category deleted'); setVersion((v) => v + 1); }
    catch (x) { toast.error(errMsg(x)); }
    setToDelete(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between"><h1 className="text-4xl">Categories</h1>{!editing && <button className="btn-primary" onClick={() => setEditing('new')}><Plus size={18} /> Add category</button>}</div>
      {editing && <CategoryForm key={editing._id || 'new'} cat={editing === 'new' ? null : editing} onDone={done} />}
      {loading ? <p aria-busy="true">Loading…</p> : error ? <p role="alert" className="text-bad">{error}</p> : !data.length ? <p className="card p-6 text-choc/70">No categories yet. Add your first one.</p> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-beige/50 text-sm"><tr><th className="p-3">Category</th><th className="p-3">Products</th><th className="p-3">Order</th><th className="p-3">Status</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead>
            <tbody className="divide-y divide-beige">
              {data.map((c) => (
                <tr key={c._id}>
                  <td className="p-3"><div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-beige">{c.imageUrl && <img src={c.imageUrl} alt="" className="h-full w-full object-cover" />}</div><div><p className="font-bold">{c.name}</p><p className="text-xs text-choc/70">/{c.slug}</p></div></div></td>
                  <td className="p-3">{c.productCount}</td><td className="p-3">{c.displayOrder}</td>
                  <td className="p-3"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.isActive ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad'}`}>{c.isActive ? 'Active' : 'Disabled'}</span></td>
                  <td className="p-3 text-right"><button aria-label={`Edit ${c.name}`} className="p-2" onClick={() => { setEditing(c); window.scrollTo({ top: 0 }); }}><Pencil size={18} /></button><button aria-label={`Delete ${c.name}`} className="p-2 text-bad" onClick={() => setToDelete(c)}><Trash2 size={18} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!toDelete} title="Delete category?" message={`"${toDelete?.name}" will be removed. A category that still has products cannot be deleted. Disable it instead if you only want to hide it.`} onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}
