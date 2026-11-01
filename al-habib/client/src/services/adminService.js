import api from './api.js';

export const login = (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data.data);
export const logout = () => api.post('/auth/logout');
export const me = () => api.get('/auth/me').then((r) => r.data.data);
export const getStats = () => api.get('/admin/dashboard/stats').then((r) => r.data.data);
export const getCharts = () => api.get('/admin/dashboard/charts').then((r) => r.data.data);
export const saveCategory = (id, body) => (id ? api.put(`/categories/${id}`, body) : api.post('/categories', body)).then((r) => r.data.data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
export const getAdminProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProductById = (id) => api.get(`/products/${id}`).then((r) => r.data.data);
export const saveProduct = (id, body) => (id ? api.put(`/products/${id}`, body) : api.post('/products', body)).then((r) => r.data.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const saveSettings = (body) => api.put('/settings', body).then((r) => r.data.data);
