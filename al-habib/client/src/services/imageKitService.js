import api from './api.js';

const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Browser uploads straight to ImageKit using a short-lived signature from our server (private key stays server-side).
export async function uploadImage(file) {
  if (!TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG or WebP image.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Image must be 5 MB or smaller.');
  const { data } = await api.get('/imagekit/auth');
  const a = data.data;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('fileName', file.name);
  fd.append('publicKey', a.publicKey);
  fd.append('signature', a.signature);
  fd.append('expire', a.expire);
  fd.append('token', a.token);
  fd.append('folder', '/al-habib');
  const r = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: fd });
  if (!r.ok) {
    const errorText = await r.text();

    console.error("ImageKit Upload Error:", {
      status: r.status,
      response: errorText
    });

    throw new Error(`ImageKit Error (${r.status}): ${errorText}`);
  }
  const j = await r.json();
  return { url: j.url, fileId: j.fileId };
}
// Removes a freshly uploaded file that was never saved (server only deletes it if nothing references it).
export const discardUpload = (fileId) => api.post('/imagekit/discard', { fileId }).catch(() => { });
