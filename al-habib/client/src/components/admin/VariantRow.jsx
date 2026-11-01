import { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';
import Field from '../common/Field.jsx';
import ImageUploader from './ImageUploader.jsx';
import { useImageField } from '../../hooks/useImageField.js';

// One option the customer can choose (500 g, 2 lb cake, large packet...). Owns its optional image.
export default function VariantRow({ v, type, index, onChange, onRemove, registry }) {
  const img = useImageField({ url: v.imageUrl, fileId: v.imageFileId });
  const ref = useRef(img);
  ref.current = img;
  useEffect(() => { registry.current.set(v.key, img); });
  useEffect(() => () => { registry.current.delete(v.key); ref.current.abandon(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onChange({ imageUrl: img.image.url, imageFileId: img.image.fileId }); }, [img.image.fileId]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (k) => (e) => onChange({ [k]: e.target.value });

  return (
    <fieldset className="rounded-xl border-2 border-caramel/40 bg-cream p-4">
      <legend className="px-2 font-bold text-choc">Variant {index + 1}</legend>
      <div className="grid gap-3 md:grid-cols-3">
        <Field label={type === 'weight' ? 'Label (optional)' : 'Label'}><input value={v.label} onChange={set('label')} maxLength={60} placeholder={type === 'weight' ? 'Auto from weight' : type === 'variant' ? '1 lb' : 'Large packet'} /></Field>
        {type === 'weight' && <Field label="Weight (grams)" hint="500 for 500 g, 1000 for 1 kg"><input type="number" min="1" value={v.sizeValue} onChange={set('sizeValue')} /></Field>}
        {type === 'variant' && <>
          <Field label="Size"><input type="number" min="0" step="0.5" value={v.sizeValue} onChange={set('sizeValue')} /></Field>
          <Field label="Size unit"><select value={v.sizeUnit} onChange={set('sizeUnit')}><option value="lb">lb</option><option value="piece">piece</option><option value="g">g</option></select></Field>
        </>}
        {type === 'package' && <Field label="Stock unit"><select value={v.unit} onChange={set('unit')}>{['packet', 'box', 'bottle', 'piece'].map((u) => <option key={u}>{u}</option>)}</select></Field>}
        <Field label="Price (Rs.)"><input type="number" min="0" value={v.price} onChange={set('price')} /></Field>
        <Field label={type === 'weight' ? 'Stock (kg)' : `Stock (${v.unit}s)`} hint={type === 'weight' ? 'Total kg available, shared by this weight option' : undefined}><input type="number" min="0" step={type === 'weight' ? '0.1' : '1'} value={v.stock} onChange={set('stock')} /></Field>
        <Field label={type === 'weight' ? 'Low-stock alert (kg)' : 'Low-stock alert'}><input type="number" min="0" step={type === 'weight' ? '0.1' : '1'} value={v.low} onChange={set('low')} /></Field>
        <Field label="SKU (optional)"><input value={v.sku} onChange={set('sku')} maxLength={40} /></Field>
      </div>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <ImageUploader field={img} label="Variant image (optional)" />
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" className="h-5 w-5" checked={v.isAvailable} onChange={(e) => onChange({ isAvailable: e.target.checked })} /> Available</label>
          <button type="button" onClick={onRemove} className="flex items-center gap-1 font-bold text-bad"><Trash2 size={16} /> Remove</button>
        </div>
      </div>
    </fieldset>
  );
}
