import { createContext, useContext, useEffect, useState } from 'react';

const KEY = 'alhabib-order-v1';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
const Ctx = createContext(null);
export const useOrder = () => useContext(Ctx);

// Items hold ids + quantity only. Prices are re-read from the server when the order is reviewed (Phase 8).
export function OrderProvider({ children }) {
  const [items, setItems] = useState(load);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage blocked */ } }, [items]);
  const add = (item) => setItems((cur) => {
    const i = cur.findIndex((x) => x.key === item.key);
    if (i < 0) return [...cur, item];
    const next = [...cur];
    next[i] = { ...next[i], max: item.max, qty: Math.min(item.max, next[i].qty + item.qty) };
    return next;
  });
  const setQty = (key, qty) => setItems((cur) => cur.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(x.max, qty)) } : x)));
  const remove = (key) => setItems((cur) => cur.filter((x) => x.key !== key));
  const clear = () => setItems([]);
  const count = items.reduce((n, x) => n + x.qty, 0);
  return <Ctx.Provider value={{ items, add, setQty, remove, clear, count }}>{children}</Ctx.Provider>;
}
