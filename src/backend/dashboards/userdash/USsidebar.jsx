import React from 'react';
import { Link } from 'react-router-dom';
import './userdash.css';

export default function USSidebar() {
  return (
    <aside className="us-sidebar" aria-label="User sidebar navigation">
      <div className="us-sidebar-top">
        <div className="us-avatar" aria-hidden>
          <span>U</span>
        </div>
        <div className="us-userinfo">
          <div className="us-username">User</div>
          <div className="us-email">you@domain.com</div>
        </div>
      </div>

      <nav className="us-nav" aria-label="Main">
        <ul>
          <li className="us-nav-item"><Link to="/user/profile" className="us-nav-link">Profile</Link></li>
          <li className="us-nav-item"><Link to="/user/messages" className="us-nav-link">Messages</Link></li>
          <li className="us-nav-item"><Link to="/user/settings" className="us-nav-link">Settings</Link></li>
          <li className="us-nav-item"><Link to="/user/activity" className="us-nav-link">Activity</Link></li>
        </ul>
      </nav>

      <div className="us-sidebar-footer">
        <button className="us-logout">Sign out</button>
      </div>
    </aside>
  );
}
