import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './admindash.css';

export default function ADSidebar({ activePanel, setActivePanel }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const loadAdmin = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        console.error('ADSidebar /api/auth/me fetch failed', res.status);
        if (res.status === 401) {
          setAdmin(null);
          setError('Not authenticated');
        } else if (res.status === 404) {
          try {
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            console.warn('Cleared invalid auth cookie after 404');
          } catch (e) {
            console.warn('Failed to clear cookie after 404', e);
          }
          setAdmin(null);
          setError('Not authenticated');
        } else {
          setError(`Failed to load admin (status ${res.status})`);
        }
      } else {
        const body = await res.json();
        setAdmin(body.user || body);
      }
    } catch (e) {
      console.error('ADSidebar loadAdmin error', e);
      setError('Network error');
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      if (!res.ok) console.warn('Logout returned non-ok', res.status);
    } catch (e) {
      console.warn('Logout network error', e);
    } finally {
      setLoggingOut(false);
      setAdmin(null);
      navigate('/');
    }
  }

  const avatarLetter = admin && admin.username ? admin.username.charAt(0).toUpperCase() : 'A';
  const profilePicture = admin?.profilePicture ? `http://localhost:4000${admin.profilePicture}` : null;

  return (
    <>
      <div className="ad-sidebar-wrap" aria-hidden />
      <aside className="ad-sidebar" aria-label="Admin sidebar navigation">
        <div className="ad-content">
          <div className="ad-sidebar-top">
            <div className="ad-avatar" aria-hidden>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="ad-avatar-img" />
              ) : (
                <span>{loading ? '…' : avatarLetter}</span>
              )}
            </div>
            <div className="ad-userinfo">
              <div className="ad-username">{loading ? 'Loading…' : (admin?.username || 'Admin')}</div>
              <div className="ad-role">Administrator</div>
              <div className="ad-email">{loading ? '' : (admin?.email || '')}</div>
              {error && <div className="ad-user-error" role="status">{error}</div>}
            </div>
          </div>

          <nav className="ad-nav text-center" aria-label="Main">
            <ul>
              <li className="ad-nav-divider" aria-hidden />
              <li className="ad-nav-item"><Link to="/" className="ad-nav-link">Home</Link></li>
              <li className="ad-nav-item"><Link to="/about" className="ad-nav-link">About Us</Link></li>
              <li className="ad-nav-item"><Link to="/products" className="ad-nav-link">Products</Link></li>
              <li className="ad-nav-item"><Link to="/contact" className="ad-nav-link">Contact Us</Link></li>
              <li className="ad-nav-divider" aria-hidden />
              <li className="ad-nav-item">
                <button 
                  onClick={() => setActivePanel("products")} 
                  className={`ad-nav-link ${activePanel === "products" ? "active" : ""}`}
                >
                  Product M
                </button>
              </li>
              <li className="ad-nav-item">
                <button 
                  onClick={() => setActivePanel("accounts")} 
                  className={`ad-nav-link ${activePanel === "accounts" ? "active" : ""}`}
                >
                  Account S
                </button>
              </li>
              <li className="ad-nav-item">
                <button 
                  onClick={() => setActivePanel("system")} 
                  className={`ad-nav-link ${activePanel === "system" ? "active" : ""}`}
                >
                  System M
                </button>
              </li>
              <li className="ad-nav-item">
                <button 
                  onClick={() => setActivePanel("admin")} 
                  className={`ad-nav-link ${activePanel === "admin" ? "active" : ""}`}
                >
                  Admin
                </button>
              </li>
              <li className="ad-nav-divider" aria-hidden />
            </ul>
          </nav>
        </div>

        <div className="ad-sidebar-footer">
          <button className="ad-logout" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>    
    </>
  );    
}
