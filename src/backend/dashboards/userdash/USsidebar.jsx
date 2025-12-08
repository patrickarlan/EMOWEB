import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './userdash.css';

export default function USSidebar({ activePanel, setActivePanel }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        // try to get more info for debugging
        let txt = '';
        try {
          txt = await res.text();
        } catch (e) {
          txt = '';
        }
        console.error('USSidebar /api/auth/me fetch failed', res.status, txt);
        if (res.status === 401) {
          setUser(null);
          setError('Not authenticated');
        } else if (res.status === 404) {
          // token is valid but user record missing -> clear server cookie and treat as signed out
          try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            console.warn('Cleared invalid auth cookie after 404');
          } catch (e) {
            console.warn('Failed to clear cookie after 404', e);
          }
          setUser(null);
          setError('Not authenticated');
        } else {
          // try parse json out of the text
          try {
            const parsed = JSON.parse(txt || '{}');
            setError(parsed.error || `Failed to load user (status ${res.status})`);
          } catch (e) {
            setError(`Failed to load user (status ${res.status})`);
          }
        }
      } else {
        const body = await res.json();
        // backend may return { user } or user object
        setUser(body.user || body);
      }
    } catch (e) {
      console.error('USSidebar loadUser error', e);
      setError('Network error');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      // only clear client state when server responded ok (or even on network failure we'll clear UI)
      if (!res.ok) console.warn('Logout returned non-ok', res.status);
    } catch (e) {
      console.warn('Logout network error', e);
    } finally {
      setLoggingOut(false);
      setUser(null);
      // ensure sidebar doesn't re-fetch the old token: navigate home and leave user cleared
      navigate('/');
    }
  }

  const avatarLetter = user && user.username ? user.username.charAt(0).toUpperCase() : 'U';
  const profilePicture = user?.profilePicture ? `http://localhost:4000${user.profilePicture}` : null;

  return (
    <>
      <div className="us-sidebar-wrap" aria-hidden />
      <aside className="us-sidebar" aria-label="User sidebar navigation">
      <div className="us-content">
        <div className="us-sidebar-top">
        <div className="us-avatar" aria-hidden>
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="us-avatar-img" />
          ) : (
            <span>{loading ? '…' : avatarLetter}</span>
          )}
        </div>
        <div className="us-userinfo">
          <div className="us-username">{loading ? 'Loading…' : (user?.username || 'Guest')}</div>
          <div className="us-email">{loading ? '' : (user?.email || '')}</div>
          {error && <div className="us-user-error" role="status">{error}</div>}
        </div>
      </div>

      <nav className="us-nav text-center" aria-label="Main">
        <ul>
            <li className="us-nav-divider" aria-hidden />
            <li className="us-nav-item"><Link to="/" className="us-nav-link">Home</Link></li>
            <li className="us-nav-item"><Link to="/about" className="us-nav-link">About Us</Link></li>
            <li className="us-nav-item"><Link to="/products" className="us-nav-link">Products</Link></li>
            <li className="us-nav-item"><Link to="/contact" className="us-nav-link">Contact Us</Link></li>
            <li className="us-nav-divider" aria-hidden />
            <li className="us-nav-item">
              <button 
                onClick={() => setActivePanel("orders")} 
                className={`us-nav-link ${activePanel === "orders" ? "active" : ""}`}
              >
                Orders
              </button>
            </li>
            <li className="us-nav-item">
              <button 
                onClick={() => setActivePanel("cart")} 
                className={`us-nav-link ${activePanel === "cart" ? "active" : ""}`}
              >
                Cart
              </button>
            </li>
            <li className="us-nav-item">
              <button 
                onClick={() => setActivePanel("profile")} 
                className={`us-nav-link ${activePanel === "profile" ? "active" : ""}`}
              >
                Profile
              </button>
            </li>
            <li className="us-nav-item">
              <button 
                onClick={() => setActivePanel("settings")} 
                className={`us-nav-link ${activePanel === "settings" ? "active" : ""}`}
              >
                Settings
              </button>
            </li>
            <li className="us-nav-divider" aria-hidden />
        </ul>
      </nav>

      </div>

      <div className="us-sidebar-footer">
        <button className="us-logout" onClick={handleLogout} disabled={loggingOut}>{loggingOut ? 'Signing out…' : 'Sign out'}</button>
      </div>
    </aside>    
    </>
  );    
}
