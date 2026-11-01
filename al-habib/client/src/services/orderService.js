import api from './api.js';

export const quoteOrder = (items) =>
  api.post('/orders/quote', { items: items.map(({ productId, variantId, qty }) => ({ productId, variantId, qty })) }).then((r) => r.data.data);
