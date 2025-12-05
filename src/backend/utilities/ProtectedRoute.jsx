import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function Spinner({ size = 28 }) {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.08)',
    borderTopColor: 'rgba(255,255,255,0.6)',
    animation: 'pr-spin 0.8s linear infinite',
    margin: '6px auto'
  };
  return <div style={style} aria-hidden />;
}

// add minimal keyframes for spinner if not present; most apps include global CSS, but we
// ensure the animation exists by injecting a tiny style node once.
try {
  if (typeof document !== 'undefined' && !document.getElementById('pr-spin-style')) {
    const s = document.createElement('style');
    s.id = 'pr-spin-style';
    s.innerHTML = `@keyframes pr-spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(s);
  }
} catch (e) {
  // ignore server-side renders or non-DOM environments
}

// ProtectedRoute: if the user is authenticated, redirect to /userdash
// otherwise render the child element (e.g., SignForm).
export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          setStatus({ loading: false, authenticated: true });
        } else {
          setStatus({ loading: false, authenticated: false });
        }
      } catch (err) {
        if (!mounted) return;
        setStatus({ loading: false, authenticated: false });
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (status.loading) return <Spinner />;
  if (status.authenticated) return <Navigate to="/userdash" replace />;
  return children;
}
