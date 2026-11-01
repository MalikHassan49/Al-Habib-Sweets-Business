import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Field from '../components/common/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../services/api.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AdminLogin() {
  usePageTitle('Admin Login');
  const { admin, loading, login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (!loading && admin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { await login(f.email.trim(), f.password); nav('/admin'); }
    catch (x) { setErr(errMsg(x)); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-beige/50 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <h1 className="text-3xl">Admin Login</h1>
        <Field label="Email"><input type="email" autoComplete="username" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required /></Field>
        {err && <p role="alert" className="text-sm text-bad">{err}</p>}
        <button className="btn-primary w-full disabled:opacity-50" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-xs text-choc/70">Admin accounts are created by the site owner with the server setup script. There is no public sign-up.</p>
      </form>
    </div>
  );
}
