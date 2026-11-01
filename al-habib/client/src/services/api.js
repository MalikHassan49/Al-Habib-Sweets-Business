import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }, // required by the server's CSRF guard
});
export default api;

// Turns an API error into one readable sentence (includes field-level messages).
export const errMsg = (e) => {
  const d = e.response?.data;
  if (!d) return e.message || 'Something went wrong.';
  return d.errors?.length ? `${d.message}: ${d.errors.map((x) => x.message).join(' ')}` : d.message;
};
