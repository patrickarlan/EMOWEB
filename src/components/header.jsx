import React from "react";
import logo from "../pics/emoweb.png";
import "../styles/header.css";

export default function Header() {
  return (
    <header className="site-header">
      
      <div className="header-logo">
        <a href="/" className="site-nav no-underline flex items-center"> <img src={logo} alt="EMOWEB Logo" className="logo-image"/>
        <h1 className="site-title">EMOWEB</h1>
        </a>  
      </div>
      
      <div className="site-container">
        <nav className="header-nav">
          <a href="#" className="nav-link">Home</a>
          <a href="#" className="nav-link">About</a>
          <a href="#" className="nav-link">Contact</a>
        </nav>
      </div>

      <div className="header-controls" role="group" aria-label="Header controls">
        <button className="search-button" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <button className="profile-button" aria-label="User profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
