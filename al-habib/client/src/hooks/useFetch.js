import { useEffect, useState } from 'react';

export function useFetch(fn, deps = []) {
  const [state, set] = useState({ data: null, loading: true, error: null });
  useEffect(() => {
    let live = true;
    set((s) => ({ ...s, loading: true }));
    fn()
      .then((data) => live && set({ data, loading: false, error: null }))
      .catch((e) => live && set({ data: null, loading: false, error: e.response?.data?.message || e.message }));
    return () => { live = false; };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return state;
}
