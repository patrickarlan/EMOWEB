import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../pics/emoweb.png";
import "../styles/header.css";


export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const headerRef = useRef(null);
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;

    const threshold = 1; // become sticky as soon as user starts scrolling

    const onScroll = () => {
      const scrolled = window.scrollY || window.pageYOffset;
      setIsSticky(scrolled > threshold);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // run once to set initial state
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header ref={headerRef} className={"site-header backdrop-blur-sm" + (isSticky ? " sticky" : "")}>
      
      <div className="header-logo">
        <Link to="/" className="site-nav no-underline flex items-center"> <img src={logo} alt="EMOWEB Logo" className="logo-image"/>
        <h1 className="site-title">EMOWEB</h1>
        </Link>  
      </div>
      
      <div className="site-container backdrop-blur-sm">
        <nav className="header-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
      </div>

      <div className="header-controls" role="group" aria-label="Header controls">
        <button className="search-button" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        <Link to="/product" className="cart-button" aria-label="Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 6h15l-1.5 9h-12z" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </Link>
        <Link to="/signform" className="profile-button" aria-label="User profile">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </Link>
      </div>
    </header>
  );
}
