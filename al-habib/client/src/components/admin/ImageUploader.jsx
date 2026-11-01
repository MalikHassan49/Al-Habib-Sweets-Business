import { useId } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

export default function ImageUploader({ field, label = 'Image' }) {
  const id = useId();
  const { image, upload, remove, uploading } = field;
  return (
    <div>
      <p className="mb-1 font-bold">{label}</p>
      <div className="flex items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-beige">
          {image.url ? <img src={image.url} alt={`${label} preview`} className="h-full w-full object-cover" /> : <ImagePlus className="text-choc/50" />}
        </div>
        <div className="space-y-2">
          <label htmlFor={id} className="btn-outline cursor-pointer !py-2 text-sm">{uploading ? 'Uploading…' : image.url ? 'Replace' : 'Choose image'}</label>
          <input id={id} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading} onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} />
          {image.url && <button type="button" onClick={remove} className="flex items-center gap-1 text-sm font-bold text-bad"><Trash2 size={14} /> Remove</button>}
        </div>
      </div>
      <p className="mt-1 text-xs text-choc/70">JPG, PNG or WebP, up to 5 MB. Saved when you press Save.</p>
    </div>
  );
}
