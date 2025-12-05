import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function SmallSpinner() {
  const style = {
    width: 20,
    height: 20,
    borderRadius: '50%',
    border: '2px solid rgba(0,0,0,0.08)',
    borderTopColor: 'rgba(0,0,0,0.5)',
    animation: 'rq-spin 0.8s linear infinite',
    margin: '8px auto'
  };
  try {
    if (typeof document !== 'undefined' && !document.getElementById('rq-spin-style')) {
      const s = document.createElement('style');
      s.id = 'rq-spin-style';
      s.innerHTML = `@keyframes rq-spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(s);
    }
  } catch (e) {}
  return <div style={style} aria-hidden />;
}

// RequireAuth: allows children only if authenticated; otherwise redirect to /signform
export default function RequireAuth({ children }) {
  const [state, setState] = useState({ loading: true, authenticated: false });

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!mounted) return;
        setState({ loading: false, authenticated: res.ok });
      } catch (err) {
        if (!mounted) return;
        setState({ loading: false, authenticated: false });
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (state.loading) return <SmallSpinner />;
  if (!state.authenticated) return <Navigate to="/signform" replace />;
  return children;
}
