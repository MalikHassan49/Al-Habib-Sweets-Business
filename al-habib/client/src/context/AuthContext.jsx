import { createContext, useContext, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import * as svc from '../services/adminService.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

// Wraps only /admin/* routes, so public visitors never call the auth API.
export function AdminRoot() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { svc.me().then(setAdmin).catch(() => setAdmin(null)).finally(() => setLoading(false)); }, []);
  const login = async (email, password) => setAdmin(await svc.login(email, password));
  const logout = async () => { await svc.logout().catch(() => {}); setAdmin(null); };
  return <Ctx.Provider value={{ admin, loading, login, logout }}><Outlet /></Ctx.Provider>;
}
