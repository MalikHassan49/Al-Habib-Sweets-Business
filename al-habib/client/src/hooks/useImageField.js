import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadImage, discardUpload } from '../services/imageKitService.js';

// Upload / preview / replace / remove for one image. Call committed() after a successful save and abandon() on cancel.
export function useImageField(initial = { url: '', fileId: '' }) {
  const [image, setImage] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const fresh = useRef(null);
  const dropFresh = () => { if (fresh.current) { discardUpload(fresh.current); fresh.current = null; } };

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      dropFresh();
      fresh.current = res.fileId;
      setImage(res);
    } catch (e) { toast.error(e.response?.data?.message || e.message); }
    finally { setUploading(false); }
  };
  const remove = () => { dropFresh(); setImage({ url: '', fileId: '' }); };
  return { image, upload, remove, uploading, committed: () => { fresh.current = null; }, abandon: dropFresh };
}
