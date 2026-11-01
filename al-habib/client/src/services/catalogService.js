import api from './api.js';

export const getCategories = () => api.get('/categories').then((r) => r.data.data);
export const getFeatured = () => api.get('/products/featured').then((r) => r.data.data);
export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getSettings = () => api.get('/settings').then((r) => r.data.data);
export const getProduct = (slug) => api.get(`/products/slug/${encodeURIComponent(slug)}`).then((r) => r.data.data);
