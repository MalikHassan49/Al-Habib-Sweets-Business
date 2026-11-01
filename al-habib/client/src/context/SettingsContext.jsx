import { createContext, useContext, useState } from 'react';
import { getSettings } from '../services/catalogService.js';
import { useFetch } from '../hooks/useFetch.js';

const Ctx = createContext({ settings: {}, loading: true, reload: () => {} });
export const useSettings = () => useContext(Ctx);

export function SettingsProvider({ children }) {
  const [v, setV] = useState(0);
  const { data, loading } = useFetch(getSettings, [v]);
  return <Ctx.Provider value={{ settings: data || {}, loading, reload: () => setV((x) => x + 1) }}>{children}</Ctx.Provider>;
}
