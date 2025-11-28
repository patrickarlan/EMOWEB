import React from "react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <h1 className="site-title-footer">EMOWEB</h1>
      <div className="social-links" aria-label="Social links">
        <a href="#" className="social-link" aria-label="Facebook" title="Facebook">
          <i className="bi bi-facebook" aria-hidden="true"></i>
        </a>
        <a href="#" className="social-link" aria-label="Instagram" title="Instagram">
          <i className="bi bi-instagram" aria-hidden="true"></i>
        </a>
        <a href="#" className="social-link" aria-label="TikTok" title="TikTok">
          <i className="bi bi-tiktok" aria-hidden="true"></i>
        </a>
        <a href="#" className="social-link" aria-label="Twitter" title="Twitter">
          <i className="bi bi-twitter" aria-hidden="true"></i>
        </a>
      </div>
      <div className="site-container">
        <nav className="footer-nav">
          <a href="#" className="footer-link">Home</a>
          <a href="#" className="footer-link">About Us</a>
          <a href="#" className="footer-link">Contact</a>
        </nav>
      </div>
    </footer>
  );
}

